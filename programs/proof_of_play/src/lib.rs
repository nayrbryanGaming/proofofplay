use anchor_lang::prelude::*;
use solana_program::keccak::hashv;

declare_id!("ReplaceWithYourProgramIdAfterDeploy000000000000");

#[program]
pub mod proof_of_play {
    use super::*;

    /// Initialize a new player account
    /// Security: Validates stat bounds to prevent exploits
    pub fn init_player(ctx: Context<InitPlayer>, hp: u8, atk: u8, def: u8) -> Result<()> {
        // Validate stats are within reasonable bounds
        require!(hp > 0 && hp <= 100, ProofOfPlayError::InvalidStats);
        require!(atk > 0 && atk <= 50, ProofOfPlayError::InvalidStats);
        require!(def <= 20, ProofOfPlayError::InvalidStats);

        let player = &mut ctx.accounts.player;
        player.authority = *ctx.accounts.authority.key;
        player.hp = hp;
        player.atk = atk;
        player.def = def;
        player.last_event = [0u8; 32];
        player.can_claim = false;
        
        msg!("Player initialized: HP={}, ATK={}, DEF={}", hp, atk, def);
        Ok(())
    }

    /// Generate a random event using on-chain data
    /// Security: Uses clock slot + player state for unpredictable RNG
    pub fn explore(ctx: Context<ModifyPlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        
        // Security: Verify player is alive
        require!(player.hp > 0, ProofOfPlayError::PlayerDead);
        
        // Generate unpredictable hash
        let clock = Clock::get()?;
        let slot_bytes = clock.slot.to_le_bytes();
        let unix_ts = clock.unix_timestamp.to_le_bytes();
        
        let mut seed_parts: Vec<&[u8]> = Vec::new();
        seed_parts.push(&slot_bytes);
        seed_parts.push(&unix_ts);
        seed_parts.push(&player.hp.to_le_bytes());
        seed_parts.push(&player.atk.to_le_bytes());
        seed_parts.push(&player.def.to_le_bytes());
        seed_parts.push(player.authority.as_ref());
        
        let digest = hashv(&seed_parts);
        player.last_event = digest.0;
        
        msg!("Event generated: hash={:?}", &digest.0[..4]);
        Ok(())
    }

    /// Execute battle against generated enemy
    /// Security: Validates event exists and player is alive, prevents replay
    pub fn fight(ctx: Context<ModifyPlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        let h = player.last_event;
        
        // Security: Must explore first
        require!(h != [0u8; 32], ProofOfPlayError::NoEvent);
        
        // Security: Player must be alive
        require!(player.hp > 0, ProofOfPlayError::PlayerDead);

        // Derive enemy stats from hash (deterministic)
        let enemy_hp = 1u8.saturating_add(h[0] % 10);
        let enemy_atk = 1u8.saturating_add(h[1] % 6);
        let enemy_def = h[2] % 5;

        msg!("Enemy stats: HP={}, ATK={}, DEF={}", enemy_hp, enemy_atk, enemy_def);

        // Calculate damage with saturation (no underflow)
        let player_damage = player.atk.saturating_sub(enemy_def);
        let enemy_remaining = enemy_hp.saturating_sub(player_damage);

        let player_remaining = if enemy_remaining == 0 {
            player.hp // Victory: no damage taken
        } else {
            let enemy_damage = enemy_atk.saturating_sub(player.def);
            player.hp.saturating_sub(enemy_damage)
        };

        // Update game state
        if enemy_remaining == 0 && player_remaining > 0 {
            player.can_claim = true;
            msg!("Victory! Reward available.");
        } else {
            player.hp = player_remaining;
            msg!("Defeat. HP remaining: {}", player_remaining);
        }
        
        // Anti-replay: Clear event after use
        player.last_event = [0u8; 32];

        Ok(())
    }

    /// Claim reward after victory
    /// Security: Validates claim flag, resets to prevent double-claim
    pub fn claim(ctx: Context<ModifyPlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        
        // Security: Must have reward available
        require!(player.can_claim, ProofOfPlayError::NothingToClaim);
        
        // Reset claim flag (prevents double-claim)
        player.can_claim = false;
        
        msg!("Reward claimed by {}", player.authority);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(hp: u8, atk: u8, def: u8)]
pub struct InitPlayer<'info> {
    #[account(
        init,
        payer = authority,
        space = Player::SPACE,
        seeds = [b"player", authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModifyPlayer<'info> {
    #[account(
        mut,
        seeds = [b"player", player.authority.as_ref()],
        bump,
        constraint = player.authority == authority.key() @ ProofOfPlayError::Unauthorized
    )]
    pub player: Account<'info, Player>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Player {
    pub authority: Pubkey,
    pub hp: u8,
    pub atk: u8,
    pub def: u8,
    pub last_event: [u8; 32],
    pub can_claim: bool,
}

impl Player {
    pub const SPACE: usize = 8 + 32 + 1 + 1 + 1 + 32 + 1;
}

#[error_code]
pub enum ProofOfPlayError {
    #[msg("No event generated yet. Call explore first.")]
    NoEvent,
    #[msg("Nothing to claim. Win a battle first.")]
    NothingToClaim,
    #[msg("Player is dead. HP = 0.")]
    PlayerDead,
    #[msg("Invalid stats. HP must be 1-100, ATK 1-50, DEF 0-20.")]
    InvalidStats,
    #[msg("Unauthorized. You are not the player owner.")]
    Unauthorized,
}
