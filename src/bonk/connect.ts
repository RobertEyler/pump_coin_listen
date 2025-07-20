import { Connection } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();
export const connection = new Connection(process.env.SOLANA_INNRT_URL!, {wsEndpoint: process.env.SOLANA_INNRT_WSS!})