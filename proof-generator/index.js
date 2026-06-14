const { Noir } = require('@noir-lang/noir_js');
const { BarretenbergBackend } = require('@noir-lang/backend_barretenberg');
const fs = require('fs');
const path = require('path');

async function generateProof() {
  console.log('Loading compiled circuit...');
  const circuitPath = path.join(__dirname, '../circuits/target/circuits.json');
  const circuitJson = JSON.parse(fs.readFileSync(circuitPath, 'utf8'));

  console.log('Setting up backend...');
  const backend = new BarretenbergBackend(circuitJson);
  const noir = new Noir(circuitJson);

  const inputs = {
    balances: [1000, 2000, 3000, 500, 750, 1200, 800, 900, 1500, 350],
    total_supply: 10000,
    threshold_pct: 100
  };

  console.log('Generating witness...');
  const { witness } = await noir.execute(inputs);
  console.log('Witness generated successfully');

  console.log('Generating proof...');
  const proof = await backend.generateProof(witness);

  console.log('Proof generated successfully!');
  console.log('Proof size:', proof.proof.length, 'bytes');
  console.log('Public inputs:', proof.publicInputs);

  fs.writeFileSync(
    'proof.json',
    JSON.stringify({
      proof: Array.from(proof.proof),
      publicInputs: proof.publicInputs
    }, null, 2)
  );

  console.log('Proof saved to proof.json');
}

generateProof().catch(console.error);
