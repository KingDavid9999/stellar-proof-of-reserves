const crypto = require('crypto');
const fs = require('fs');

// Simple hash function matching what we'll use in the circuit
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hashLeaf(address, balance) {
  return hash(`${address}:${balance}`);
}

function hashPair(left, right) {
  // Always hash in sorted order for consistency
  const [a, b] = [left, right].sort();
  return hash(a + b);
}

function buildMerkleTree(leaves) {
  if (leaves.length === 0) return null;
  
  let level = leaves.map((leaf, i) => ({
    hash: hashLeaf(leaf.address, leaf.balance),
    index: i
  }));

  const tree = [level];

  while (level.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || level[i]; // duplicate last if odd
      nextLevel.push({
        hash: hashPair(left.hash, right.hash),
        index: Math.floor(i / 2)
      });
    }
    tree.push(nextLevel);
    level = nextLevel;
  }

  return tree;
}

function getMerklePath(tree, leafIndex) {
  const path = [];
  let index = leafIndex;

  for (let level = 0; level < tree.length - 1; level++) {
    const isRight = index % 2 === 1;
    const siblingIndex = isRight ? index - 1 : index + 1;
    const sibling = tree[level][siblingIndex] || tree[level][index];
    
    path.push({
      hash: sibling.hash,
      isRight: !isRight
    });

    index = Math.floor(index / 2);
  }

  return path;
}

// Main
const data = JSON.parse(fs.readFileSync('./data/mock_accounts.json', 'utf8'));
const accounts = data.accounts;

console.log('Building Merkle tree for', accounts.length, 'accounts...');

const tree = buildMerkleTree(accounts);
const root = tree[tree.length - 1][0].hash;

console.log('Merkle root:', root);
console.log('Total reserves:', accounts.reduce((sum, a) => sum + a.balance, 0));
console.log('Total supply:', data.total_supply);
console.log('Threshold:', data.threshold_pct + '%');

// Build output
const output = {
  merkle_root: root,
  total_supply: data.total_supply,
  threshold_pct: data.threshold_pct,
  balances: accounts.map(a => a.balance),
  accounts: accounts.map((a, i) => ({
    ...a,
    leaf_hash: hashLeaf(a.address, a.balance),
    merkle_path: getMerklePath(tree, i)
  }))
};

fs.writeFileSync('./data/merkle_output.json', JSON.stringify(output, null, 2));
console.log('Output saved to data/merkle_output.json');