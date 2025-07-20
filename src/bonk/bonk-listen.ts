import { Connection, PublicKey, type Context, type Logs, type LogsCallback, type LogsFilter } from "@solana/web3.js";
import * as bonkJson from "../idls/bonk.json";
import dotenv from "dotenv";
import { BonkEventParser } from "./bonk-event-parser";
dotenv.config();
const connection = new Connection(process.env.SOLANA_INNRT_URL!, {wsEndpoint: process.env.SOLANA_INNRT_WSS!})

export const bonkSub = async()=>{
    connection.onLogs(filterPumpfun,dealLog,"processed");
}
const filterPumpfun:LogsFilter = new PublicKey(bonkJson.address)
const eventParser:BonkEventParser = new BonkEventParser();
const dealLog:LogsCallback = (logs: Logs, ctx: Context)=>{
    if(logs.err) {
        return;
    }
    eventParser.dealLogs(logs.logs,logs.signature).then().catch(err=>{
        console.trace(err);
    })
}