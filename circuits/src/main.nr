// Proof of Reserves Circuit
// Proves that the sum of private balances >= public threshold
// without revealing individual balances

fn main(
    // Private inputs - never revealed
    balances: [u64; 10],
    
    // Public inputs - visible to verifier
    total_supply: pub u64,
    threshold_pct: pub u64
) {
    let mut total_reserves: u64 = 0;
    for i in 0..10 {
        total_reserves = total_reserves + balances[i];
    }

    let required: u64 = (total_supply * threshold_pct) / 100;
    assert(total_reserves >= required);
}

#[test]
fn test_sufficient_reserves() {
    let balances: [u64; 10] = [
        1000, 2000, 3000, 500, 750,
        1200, 800, 900, 1500, 350
    ];
    main(balances, 10000, 100);
}
