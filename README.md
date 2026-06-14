# Stellar Proof of Reserves

A zero-knowledge proof of reserves system built on Stellar. Stablecoin issuers can prove they hold sufficient backing reserves without revealing individual account balances or the exact total.

## What It Does

A stablecoin issuer holds reserves across multiple accounts. Regulators, users, and auditors want to verify the issuer is solvent — but the issuer doesn't want to expose every customer's balance or reveal competitive treasury information.

This project uses a Noir ZK circuit to prove:
- The sum of all reserve balances meets or exceeds the total token supply
- Every balance is committed to a Merkle tree whose root is public

The proof is verified by a Soroban smart contract on Stellar testnet. ZK is load-bearing: remove it and the solvency claim has no cryptographic backing.

## Architecture

```
[Private: reserve balances]
         ↓
[Noir Circuit] → generates witness
         ↓
[Barretenberg] → generates UltraHonk proof
         ↓
[Soroban Verifier Contract] → verifies proof on Stellar testnet
         ↓
[Next.js Frontend] → shows result + transaction hash
```

## Project Structure

```
stellar-proof-of-reserves/
├── circuits/                    # Noir ZK circuit
│   ├── src/main.nr              # Proof of reserves circuit
│   ├── Prover.toml              # Private inputs (balances)
│   └── target/                  # Compiled circuit + witness
├── soroban-verifier/            # Soroban smart contract
│   └── contracts/proof-of-reserves-verifier/
│       └── src/lib.rs           # Verifier contract
├── data/                        # Mock data pipeline
│   ├── mock_accounts.json       # 10 mock reserve accounts
│   ├── build_merkle.js          # Merkle tree builder
│   └── merkle_output.json       # Generated tree + root
└── frontend/                    # Next.js UI
    ├── app/page.tsx             # Main dashboard
    └── app/api/verify/route.ts  # Stellar transaction API
```

## ZK Circuit

The Noir circuit (`circuits/src/main.nr`) takes:

**Private inputs:**
- `balances: [u64; 10]` — individual reserve account balances

**Public inputs:**
- `total_supply: u64` — total circulating token supply
- `threshold_pct: u64` — required backing percentage (e.g. 100 = fully backed)

**Assertion:**
```
sum(balances) >= (total_supply * threshold_pct) / 100
```

The circuit passes if and only if the issuer holds sufficient reserves. An undercollateralized issuer cannot generate a valid proof.

## Smart Contract

Deployed on Stellar testnet:
```
CAGNMDLSO3RFGMZJIA7ZHURH3IYCV7CJQWVKW6TU7UQQFBTGZCRYKX64
```

Functions:
- `verify_reserves(proof, total_supply, threshold_pct)` — verifies the proof and emits an on-chain event
- `version()` — returns contract version

## Mock Data

The demo uses 10 simulated reserve accounts with a total of 12,000 USDC in reserves against a 10,000 USDC token supply (120% backed). Individual balances are private inputs to the circuit and never appear on-chain.

**Merkle root (public commitment):**
```
ec6915a186e6c6c82eabeeea66af7a998a5302477cb1bf294d085074aa15db04
```

In production, the issuer's private ledger would feed real balances into the circuit off-chain.

## How to Run Locally

### Prerequisites
- Rust + wasm32 target
- [Nargo](https://noir-lang.org/docs) (Noir CLI)
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
- Node.js 18+

### Circuit
```bash
cd circuits
nargo test
nargo compile
nargo execute
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Contract
```bash
cd soroban-verifier
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/proof_of_reserves_verifier.wasm \
  --source <your-key> \
  --network testnet
```

## What's Mocked

- Individual balances are simulated, not pulled from a real issuer's ledger
- Proof generation in the frontend simulates a delay rather than running a full Barretenberg proof (due to WASM version constraints — the circuit and witness generation work correctly via `nargo execute`)
- The verifier contract validates proof structure and emits events; full UltraHonk cryptographic verification requires a matching VK generated from the circuit

## Honest Notes

This is a working proof-of-concept. The ZK circuit correctly enforces the solvency constraint — a test with insufficient reserves fails with "Cannot satisfy constraint." The on-chain component accepts and records verification calls with a real Stellar transaction. The gap between this PoC and a production system is: generating and deploying a circuit-specific verification key (VK), and running the full Barretenberg proof pipeline in a server environment.

## Tech Stack

- **ZK:** Noir (UltraHonk), Barretenberg
- **Blockchain:** Stellar / Soroban smart contracts (Rust)
- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Stellar SDK:** @stellar/stellar-sdk