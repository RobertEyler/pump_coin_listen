import { Connection, PublicKey, type Context, type Logs, type LogsCallback, type LogsFilter } from "@solana/web3.js";
import { EventParser } from "./event-parser";
import dotenv from "dotenv";
dotenv.config();
const connection = new Connection(process.env.SOLANA_INNRT_URL!, {wsEndpoint: process.env.SOLANA_INNRT_WSS!})

export const pumpSub = async()=>{
    connection.onLogs(filterPumpfun,dealLog,"processed");
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
