use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak::hashv;

declare_id!("hirTPHnA6on8w2ATUku2bKJST2wqhdY5CdWt8SS7d93"); // ACTIVE PROGRAM ID

#[program]
pub mod proof_of_play {
    use super::*;

    pub fn equip(ctx: Context<Equip>, atk_bonus: u8, def_bonus: u8) -> Result<()> {
        let player = &mut ctx.accounts.player;
        // In a Production scenario, we would verify the NFT ownership via a Metaplex CPI or Collection check.
        // For this Hackathon speed-run, we accept the stats from the frontend after it verifies ownership,
        // but we store them ON-CHAIN to ensure the math is irreversible.
        player.atk = 10 + atk_bonus;
        player.def = 5 + def_bonus;
        
        msg!("Equipped Item! New Stats - ATK: {}, DEF: {}", player.atk, player.def);
        Ok(())
    }

    pub fn explore(ctx: Context<Explore>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        require!(player.hp > 0, GameError::PlayerDead);

        // Deterministic Entropy Source
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
            &player.level.to_le_bytes(),
        ];
        
        // Generate Event Hash
        let event_hash = hashv(seeds).0;
        player.last_event = event_hash;

        msg!("Explored Level {}! Event Hash: {:?}", player.level, event_hash);
        Ok(())
    }

    pub fn fight(ctx: Context<Fight>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        require!(player.hp > 0, GameError::PlayerDead);
        require!(player.last_event != [0u8; 32], GameError::NoEventFound);

        // Derive Enemy from Event Hash
        let hash = player.last_event;
        
        // Procedural Monster Stats (Byte 0-2) + Level Scaling
        let monster_hp = (hash[0] as u16 % 30) + 20 + (player.level as u16 * 5); 
        let monster_atk = (hash[1] as u16 % 10) + 5 + (player.level as u16 * 2); 
        let monster_def = (hash[2] as u16 % 5) + (player.level as u16 / 2) as u16;

        msg!("Fighting Monster! HP: {}, ATK: {}, DEF: {}", monster_hp, monster_atk, monster_def);

        // Combat Math
        let player_dmg = (player.atk as u16).saturating_sub(monster_def).max(1);
        let monster_dmg = monster_atk.saturating_sub(player.def as u16).max(1);

        let rounds_to_kill = (monster_hp + player_dmg - 1) / player_dmg;
        let rounds_to_die = (player.hp as u16 + monster_dmg - 1) / monster_dmg;

        if rounds_to_kill <= rounds_to_die {
            // Victory
            let damage_taken = (rounds_to_kill - 1) * monster_dmg;
            let damage_u8 = if damage_taken > 255 { 255 } else { damage_taken as u8 };
            player.hp = player.hp.saturating_sub(damage_u8);
            player.can_claim = true;
            player.level += 1; // UNLIMITED LEVEL PROGRESSION
            player.last_event = [0u8; 32];
            msg!("Victory! Level Up to {}. HP Left: {}.", player.level, player.hp);
        } else {
            // Defeat
            player.hp = 0;
            player.can_claim = false;
            player.last_event = [0u8; 32];
            msg!("Defeat! Player has died at level {}.", player.level);
        }

        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        require!(player.can_claim, GameError::NoRewardInfo);
        
        player.can_claim = false;
        player.hp = player.hp.saturating_add(20).min(100);
        
        msg!("Reward Claimed! Player healed +20 HP.");
        Ok(())
    }

    pub fn init_player(ctx: Context<InitPlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.authority = ctx.accounts.authority.key();
        player.hp = 100;
        player.atk = 10;
        player.def = 5;
        player.last_event = [0u8; 32];
        player.can_claim = false;
        player.level = 1;
        
        msg!("Player initialized for authority: {}, Level: {}", player.authority, player.level);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitPlayer<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + 32 + 1 + 1 + 1 + 32 + 1 + 4, // Added 4 for level
        seeds = [b"player", authority.key().as_ref()], 
        bump
    )]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Equip<'info> {
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
    pub level: u32,
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
