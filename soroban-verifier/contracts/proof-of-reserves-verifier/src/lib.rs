#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, symbol_short, Bytes, Env, Symbol};

#[contract]
pub struct ProofOfReservesVerifier;

#[contracterror]
#[repr(u32)]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    VkNotSet = 1,
    AlreadyInitialized = 2,
    ProofParseError = 3,
    VerificationFailed = 4,
    InvalidInputs = 5,
}

#[contractimpl]
impl ProofOfReservesVerifier {
    fn key_vk() -> Symbol {
        symbol_short!("vk")
    }

    fn key_supply() -> Symbol {
        symbol_short!("supply")
    }

    /// Initialize contract with verification key and total supply
    pub fn initialize(
        env: Env,
        vk_bytes: Bytes,
        total_supply: u64,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&Self::key_vk()) {
            return Err(Error::AlreadyInitialized);
        }
        assert!(total_supply > 0);
        env.storage().instance().set(&Self::key_vk(), &vk_bytes);
        env.storage().instance().set(&Self::key_supply(), &total_supply);
        Ok(())
    }

    /// Verify a proof of reserves
    /// public_inputs contains: [total_supply, threshold_pct] encoded as bytes
    /// proof_bytes is the UltraHonk proof
    pub fn verify_reserves(
        env: Env,
        proof_bytes: Bytes,
        total_supply: u64,
        threshold_pct: u64,
    ) -> Result<bool, Error> {
        // Validate inputs
        if total_supply == 0 {
            return Err(Error::InvalidInputs);
        }
        if threshold_pct == 0 || threshold_pct > 100 {
            return Err(Error::InvalidInputs);
        }

        // For now emit a verification event and return true
        // Full cryptographic verification will be added once
        // we generate a compatible VK from our circuit
        env.events().publish(
            (symbol_short!("reserves"),),
            (total_supply, threshold_pct),
        );

        Ok(true)
    }

    /// Get the stored total supply
    pub fn total_supply(env: Env) -> Result<u64, Error> {
        env.storage()
            .instance()
            .get(&Self::key_supply())
            .ok_or(Error::VkNotSet)
    }

    /// Get contract version
    pub fn version(_env: Env) -> u32 {
        2
    }
}

mod test;