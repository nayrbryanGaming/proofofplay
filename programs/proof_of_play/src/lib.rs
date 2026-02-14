use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak::hashv;

declare_id!("3QFQBFSLCAqenWMdTaj9HBHVCjJwzD19Wz9ELvSd5fmK"); // Default Devnet ID, change after deploy

#[program]
pub mod proof_of_play {
    use super::*;

    pub fn init_player(ctx: Context<InitPlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.authority = ctx.accounts.authority.key();
        player.hp = 100;
        player.atk = 10;
        player.def = 5;
        player.last_event = [0u8; 32];
        player.can_claim = false;
        
        msg!("Player initialized for authority: {}", player.authority);
        Ok(())
    }

    pub fn explore(ctx: Context<Explore>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        require!(player.hp > 0, GameError::PlayerDead);

        // Deterministic Entropy Source
        // 1. Slot (Time)
        // 2. Player Address (Identity)
        // 3. Previous State (History)
        // 4. Block Timestamp (Variation)
        let clock = Clock::get()?;
        let slot = clock.slot.to_le_bytes();
        let timestamp = clock.unix_timestamp.to_le_bytes();
        let authority = player.authority.to_bytes();
        let old_state = player.last_event;

        let seeds = &[
            &slot[..],
            &timestamp[..],
            &authority[..],
            &old_state[..],
            &player.hp.to_le_bytes(),
        ];
        
        // Generate Event Hash
        let event_hash = hashv(seeds).0;
        player.last_event = event_hash;

        msg!("Explored! Event Hash: {:?}", event_hash);
        Ok(())
    }

    pub fn fight(ctx: Context<Fight>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        require!(player.hp > 0, GameError::PlayerDead);
        require!(player.last_event != [0u8; 32], GameError::NoEventFound);

        // Derive Enemy from Event Hash
        let hash = player.last_event;
        
        // Procedural Monster Stats (Derived from Bytes 0-2)
        // HP: 20-50 (Byte 0 % 30 + 20)
        let monster_hp = (hash[0] as u16 % 30) + 20; 
        // ATK: 5-15 (Byte 1 % 10 + 5)
        let monster_atk = (hash[1] as u16 % 10) + 5; 
        // DEF: 0-5 (Byte 2 % 5)
        let monster_def = (hash[2] as u16 % 5);

        msg!("Fighting Monster! HP: {}, ATK: {}, DEF: {}", monster_hp, monster_atk, monster_def);

        // Combat Math
        // Player Dmg = (Player Atk - Monster Def).max(1)
        let player_dmg = (player.atk as u16).saturating_sub(monster_def).max(1);
        // Monster Dmg = (Monster Atk - Player Def).max(1)
        let monster_dmg = monster_atk.saturating_sub(player.def as u16).max(1);

        // Rounds to kill monster
        let rounds_to_kill = (monster_hp + player_dmg - 1) / player_dmg;
        // Rounds to kill player
        let rounds_to_die = (player.hp as u16 + monster_dmg - 1) / monster_dmg;

        if rounds_to_kill <= rounds_to_die {
            // Victory
            // Victory
            let damage_taken = (rounds_to_kill - 1) * monster_dmg;
            // Fix: Cap damage at 255 to prevent casting overflow (e.g. 300u16 as u8 -> 44u8)
            let damage_u8 = if damage_taken > 255 { 255 } else { damage_taken as u8 };
            player.hp = player.hp.saturating_sub(damage_u8);
            player.can_claim = true;
            // Clear event to prevent replay
            player.last_event = [0u8; 32];
            msg!("Victory! HP Left: {}. Claim Unlocked.", player.hp);
        } else {
            // Defeat
            player.hp = 0;
            player.can_claim = false;
            player.last_event = [0u8; 32];
            msg!("Defeat! Player has died.");
        }

        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        require!(player.can_claim, GameError::NoRewardInfo);

        // In a real scenario, this would CPI to a Token Program or assert a specific state for the frontend to execute a swap.
        // For this architecture, we reset the flag, verifying the "Claim" action happened.
        
        player.can_claim = false;
        // Heal partial HP on claim as a bonus?
        player.hp = player.hp.saturating_add(20).min(100);
        
        msg!("Reward Claimed! Player healed +20 HP.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitPlayer<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 1 + 1 + 1 + 32 + 1,
        seeds = [b"player", authority.key().as_ref()], 
        bump
    )]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Explore<'info> {
    #[account(
        mut,
        seeds = [b"player", authority.key().as_ref()], 
        bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Fight<'info> {
    #[account(
        mut,
        seeds = [b"player", authority.key().as_ref()], 
        bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"player", authority.key().as_ref()], 
        bump,
        has_one = authority
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

#[error_code]
pub enum GameError {
    #[msg("Player is dead. Init new player.")]
    PlayerDead,
    #[msg("No event generated. Explore first.")]
    NoEventFound,
    #[msg("No reward to claim.")]
    NoRewardInfo,
}
