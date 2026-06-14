'use client';

import { useState } from 'react';

const CONTRACT_ID = 'CAGNMDLSO3RFGMZJIA7ZHURH3IYCV7CJQWVKW6TU7UQQFBTGZCRYKX64';
const NETWORK = 'testnet';

const mockAccounts = [
  { address: 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQKM7OAJAUEQFU6LPCSEFVXON', balance: 1000 },
  { address: 'GDZAPBTNOBDQZX2KXZN4WJYLMFHALYGTPCQFLVMXHZ3SVXBHSZQLHYZ', balance: 2000 },
  { address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDOUALPFL5VZAL5ZJJJ', balance: 3000 },
  { address: 'GDQJUTQYK2MQX2ZJARTPPIT66EBHCVCEDQKB3WGDYFXKQ7RSTMDHKN5', balance: 500 },
  { address: 'GBSAOXKIVPCMUQJHLNXYGIJLJKIVNQR5JKFBFBWPDH7LXQFQXEVWXBV', balance: 750 },
  { address: 'GDXTJEK4JZNSTNQV3LWMKEB5GOKV7HFLM5AKGVLQFNMZ5OKMXRMDRA', balance: 1200 },
  { address: 'GBZNLMUQMIN3VGUJISKZU7GNY3O3XLMYEHJCKCSMVROZD7YEQ43HKBS', balance: 800 },
  { address: 'GAZN3PPIDQCSP5JD4ETQQQ2IU2RMFYQTAL4NNQZUGLLO2XJJJ6ULMKM', balance: 900 },
  { address: 'GCVLWV5B3L3YE6DSCCMHLCK7QIB3ZVMJBEQ3LXFWA3TDPSTKO5CWRPM', balance: 1500 },
  { address: 'GDFQPCRQ7FG9VRTW2RGCXV7RLZPX4SSJQJFXOQFVZLTDAAHQKXRBLMR', balance: 350 },
];

const TOTAL_SUPPLY = 10000;
const MERKLE_ROOT = 'ec6915a186e6c6c82eabeeea66af7a998a5302477cb1bf294d085074aa15db04';

type Step = 'idle' | 'generating' | 'verifying' | 'done' | 'error';

export default function Home() {
  const [step, setStep] = useState<Step>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const totalReserves = mockAccounts.reduce((sum, a) => sum + a.balance, 0);
  const backingPct = Math.round((totalReserves / TOTAL_SUPPLY) * 100);

  async function runVerification() {
    setStep('generating');
    setError('');
    setTxHash('');
    await new Promise(r => setTimeout(r, 2000));
    setStep('verifying');
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_supply: TOTAL_SUPPLY, threshold_pct: 100 }),
      });
      const data = await response.json();
      if (data.success) {
        setTxHash(data.txHash);
        setStep('done');
      } else {
        setError(data.error || 'Verification failed');
        setStep('error');
      }
    } catch {
      setError('Network error');
      setStep('error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Proof of Reserves</h1>
          <p className="text-gray-400">Zero-knowledge solvency proof on Stellar</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Supply</p>
            <p className="text-2xl font-bold">{TOTAL_SUPPLY.toLocaleString()} USDC</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Reserves (Private)</p>
            <p className="text-2xl font-bold text-green-400">████████</p>
            <p className="text-xs text-gray-500 mt-1">Hidden by ZK proof</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Backing</p>
            <p className="text-2xl font-bold text-green-400">{backingPct}%+</p>
            <p className="text-xs text-gray-500 mt-1">Proven on-chain</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-8">
          <p className="text-gray-400 text-sm mb-2">Merkle Root (Public Commitment)</p>
          <p className="font-mono text-xs text-blue-400 break-all">{MERKLE_ROOT}</p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8 overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <h2 className="font-semibold">Reserve Accounts (Mock Data)</h2>
            <p className="text-gray-400 text-sm">Individual balances are private inputs to the ZK circuit</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 text-sm font-normal">#</th>
                <th className="text-left p-4 text-gray-400 text-sm font-normal">Address</th>
                <th className="text-right p-4 text-gray-400 text-sm font-normal">Balance</th>
              </tr>
            </thead>
            <tbody>
              {mockAccounts.map((account, i) => (
                <tr key={i} className="border-b border-gray-800 last:border-0">
                  <td className="p-4 text-gray-500 text-sm">{i + 1}</td>
                  <td className="p-4 font-mono text-xs text-gray-300">
                    {account.address.slice(0, 8)}...{account.address.slice(-8)}
                  </td>
                  <td className="p-4 text-right text-green-400 font-mono">
                    {account.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-800">
                <td colSpan={2} className="p-4 font-semibold">Total Reserves</td>
                <td className="p-4 text-right font-bold text-green-400 font-mono">
                  {totalReserves.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="font-semibold mb-2">Generate and Verify Proof</h2>
          <p className="text-gray-400 text-sm mb-6">
            Proves total reserves are greater than or equal to total supply without revealing individual balances
          </p>
          <button
            onClick={runVerification}
            disabled={step === 'generating' || step === 'verifying'}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
          >
            {step === 'idle' && 'Generate Proof and Verify On-Chain'}
            {step === 'generating' && 'Generating ZK Proof...'}
            {step === 'verifying' && 'Submitting to Stellar...'}
            {step === 'done' && 'Verified — Run Again'}
            {step === 'error' && 'Failed — Try Again'}
          </button>

          {step === 'done' && txHash && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-xl">
              <p className="text-green-400 font-semibold mb-2">Reserves Verified On-Chain</p>
              <p className="text-gray-400 text-sm mb-1">Transaction Hash:</p>
              <a
                href={'https://stellar.expert/explorer/testnet/tx/' + txHash}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-400 hover:text-blue-300 break-all"
              >
                {txHash}
              </a>
            </div>
          )}

          {step === 'error' && error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
              <p className="text-red-400 font-semibold">Error: {error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 border border-gray-800 rounded-xl">
          <p className="text-gray-500 text-xs">
            Contract: <span className="font-mono text-gray-400">{CONTRACT_ID}</span>
            {' · '}
            Network: <span className="text-gray-400">{NETWORK}</span>
          </p>
        </div>
      </div>
    </main>
  );
}