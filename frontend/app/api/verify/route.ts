import { NextRequest, NextResponse } from 'next/server';
import {
  Contract,
  Networks,
  rpc,
  TransactionBuilder,
  nativeToScVal,
  xdr,
  Keypair,
  BASE_FEE,
} from '@stellar/stellar-sdk';

const CONTRACT_ID = 'CAGNMDLSO3RFGMZJIA7ZHURH3IYCV7CJQWVKW6TU7UQQFBTGZCRYKX64';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const DEMO_SECRET = 'SDVDR6ADJELF7BMYS6HPWIR3ZSWMZBRX643UXKER5H27IRRI5QJC4B4F';

export async function POST(req: NextRequest) {
  try {
    const { total_supply, threshold_pct } = await req.json();

    const server = new rpc.Server(RPC_URL);
    const keypair = Keypair.fromSecret(DEMO_SECRET);
    const account = await server.getAccount(keypair.publicKey());

    const contract = new Contract(CONTRACT_ID);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'verify_reserves',
          xdr.ScVal.scvBytes(Buffer.from('0000', 'hex')),
          nativeToScVal(total_supply, { type: 'u64' }),
          nativeToScVal(threshold_pct, { type: 'u64' }),
        )
      )
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(tx);
    preparedTx.sign(keypair);

    const result = await server.sendTransaction(preparedTx);

    return NextResponse.json({
      success: true,
      txHash: result.hash,
    });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}