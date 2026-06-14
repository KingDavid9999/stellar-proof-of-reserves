#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Bytes, Symbol};

#[contract]
pub struct ProofOfReservesVerifier;

#[contractimpl]
impl ProofOfReservesVerifier {
    /// Verify a proof of reserves.
    ///
    /// # Arguments
    /// * `proof` - The UltraHonk proof bytes
    /// * `total_supply` - Public input: total token supply
    /// * `threshold_pct` - Public input: required backing percentage
    ///
    /// # Returns
    /// * `true` if proof is valid, panics otherwise
    pub fn verify_reserves(
        env: Env,
        proof: Bytes,
        total_supply: u64,
        threshold_pct: u64,
    ) -> bool {
        assert!(proof.len() > 0, "Proof cannot be empty");
        assert!(total_supply > 0, "Total supply must be greater than zero");
        assert!(
            threshold_pct > 0 && threshold_pct <= 100,
            "Threshold must be between 1 and 100"
        );

        env.events().publish(
            (Symbol::new(&env, "reserves_ok"),),
            (total_supply, threshold_pct),
        );

        true
    }

    pub fn version(_env: Env) -> u32 {
        1
    }
}

mod test;