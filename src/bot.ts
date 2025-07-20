import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
dotenv.config();

const token = process.env.BOT_TOKEN!;

// Create a bot that uses 'polling' to fetch new updates
export const bot = new TelegramBot(token, {polling: false});

export const send_ids:string[] = process.env.SEND_IDS!.split(",")