import * as pumpIdl from "pump-public-docs/idl/pump.json";
import type {Pump} from "pump-public-docs/idl/pump";
import { Connection, Keypair, PublicKey, type Context, type Logs, type LogsCallback, type LogsFilter } from "@solana/web3.js";
import { EventParser } from "./event-parser";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import dotenv from "dotenv";
dotenv.config();
const connection = new Connection(process.env.SOLANA_INNRT_URL!, {wsEndpoint: process.env.SOLANA_INNRT_WSS!})
const key = Keypair.fromSecretKey(bs58.decode(process.env.SECRET_KEY!));
const wallet = new NodeWallet(key);
const provider = new AnchorProvider(connection, wallet, {});
const pumpProgram: Program<Pump> = new Program(pumpIdl as Pump, provider);

const sub = async()=>{
    connection.onLogs(filterPumpfun,dealLog,"confirmed");
}
const filterPumpfun:LogsFilter = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
const eventParser:EventParser = new EventParser();
const dealLog:LogsCallback = (logs: Logs, ctx: Context)=>{
    if(logs.err) {
        return;
    }
    eventParser.dealLogs(logs.logs,logs.signature).then().catch(err=>{
        console.trace(err);
    })
}

sub().then();