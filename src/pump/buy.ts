import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import * as pump_amm from 'pump-public-docs/idl/pump_amm'
import {PumpAmm} from 'pump-public-docs/idl/pump_amm';
import { 
  Connection, 
  Keypair, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  sendAndConfirmTransaction, 
  PublicKey
} from '@solana/web3.js';

// 1. 建立连接
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');


const priviteKey = Keypair.fromSecretKey(bs58.decode(process.env.SECRET_KEY!));


const provider = new AnchorProvider(connection,new NodeWallet(priviteKey));

const program = new Program<PumpAmm>(pump_amm as PumpAmm,provider);


// program.methods.buy()



