// grpc-pump-stream.ts
import Client, {
    CommitmentLevel, SubscribeRequest
} from "@triton-one/yellowstone-grpc";
import * as bs58 from 'bs58';
import { Bonk } from "../idls/bonk";
import dotenv from "dotenv";
import { AnchorProvider, Program, utils } from "@coral-xyz/anchor";
import { connection } from "./connect";
import { Keypair } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as idlBonk from "../idls/bonk.json";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { bot, send_ids } from "../bot";
dotenv.config();
class GrpcStreamManager {
    private client: Client;
    private stream: any;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 10;
    private readonly reconnectInterval: number = 5000; // 5 seconds
    private readonly dataHandler: (data: any) => void;

    constructor(
        endpoint: string,
        authToken: string,
        dataHandler: (data: any) => void
    ) {
        this.client = new Client(
            endpoint,
            authToken,
            { "grpc.max_receive_message_length": 64 * 1024 * 1024 }
        );
        this.dataHandler = dataHandler;
    }

    async connect(subscribeRequest: SubscribeRequest): Promise<void> {
        try {
            this.stream = await this.client.subscribe();
            this.isConnected = true;
            this.reconnectAttempts = 0;

            this.stream.on("data", this.handleData.bind(this));
            this.stream.on("error", this.handleError.bind(this));
            this.stream.on("end", () => this.handleDisconnect(subscribeRequest));
            this.stream.on("close", () => this.handleDisconnect(subscribeRequest));

            await this.write(subscribeRequest);
            this.startPing();
        } catch (error) {
            console.error("Connection error:", error);
            await this.reconnect(subscribeRequest);
        }
    }

    private async write(req: SubscribeRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            this.stream.write(req, (err: any) => err ? reject(err) : resolve());
        });
    }

    private async reconnect(subscribeRequest: SubscribeRequest): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnection attempts reached");
            return;
        }

        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

        setTimeout(async () => {
            try {
                await this.connect(subscribeRequest);
            } catch (error) {
                console.error("Reconnection failed:", error);
                await this.reconnect(subscribeRequest);
            }
        }, this.reconnectInterval * Math.min(this.reconnectAttempts, 5));
    }

    private startPing(): void {
        setInterval(() => {
            if (this.isConnected) {
                this.write({
                    ping: { id: 1 },
                    accounts: {},
                    accountsDataSlice: [],
                    transactions: {},
                    blocks: {},
                    blocksMeta: {},
                    entry: {},
                    slots: {},
                    transactionsStatus: {},
                }).catch(console.error);
            }
        }, 30000);
    }

    private handleData(data: any): void {
        try {
            const processed = this.processBuffers(data);
            this.dataHandler(processed);
        } catch (error) {
            console.error("Error processing data:", error);
        }
    }

    private handleError(error: any): void {
        console.error("Stream error:", error);
        this.isConnected = false;
    }

    private handleDisconnect(subscribeRequest: SubscribeRequest): void {
        console.log("Stream disconnected");
        this.isConnected = false;
        this.reconnect(subscribeRequest);
    }

    private processBuffers(obj: any): any {
        if (!obj) return obj;
        if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
            return bs58.default.encode(obj); // Encode Buffers to base58
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.processBuffers(item));
        }
        if (typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj).map(([k, v]) => [k, this.processBuffers(v)])
            );
        }
        return obj;
    }
}


// Transaction monitoring implementation
async function monitorTransactions() {
    const manager = new GrpcStreamManager(
        process.env.GRPC_ENDPOINT || "your-grpc-url",
        process.env.GRPC_AUTH_TOKEN || "your-grpc-token",
        handleTransactionUpdate
    );

    const subscribeRequest: SubscribeRequest = {
        transactions: {
            client: {
                accountInclude: ["2DPAtwB8L12vrMRExbLuyGnC7n2J5LNoZQSejeQGpwkr"],
                accountExclude: [],
                accountRequired: [],
                vote: false,
                failed: false
            }
        },
        commitment: CommitmentLevel.PROCESSED,
        accounts: {},
        accountsDataSlice: [],
        blocks: {},
        blocksMeta: {},
        entry: {},
        slots: {},
        transactionsStatus: {}
    };

    await manager.connect(subscribeRequest);
}
const wallet = new NodeWallet(Keypair.generate());
const p = new AnchorProvider(connection, wallet);
const bonkProgram: Program<Bonk> = new Program(idlBonk as Bonk, p);
function handleTransactionUpdate(data: any): void {
    if(!data.transaction){
        return;
    }
    const eventIxs = data.transaction.transaction.meta.innerInstructions[0].instructions;

    for (const eventIx of eventIxs) {
        const rawData = utils.bytes.bs58.decode(eventIx.data);
        const base64Data = base64.encode(rawData.subarray(8));
        const event = bonkProgram.coder.events.decode(base64Data);
        if (event != null) {
            if (event.name == "tradeEvent") {
                if ('migrate' in event.data.poolStatus) {
                    bonkProgram.account.poolState.fetch(event.data.poolState).then(
                        (poolState) => {
                            const token = poolState.baseMint;
                            for (const tgId of send_ids) {
                                bot.sendMessage(tgId, `Lets'Bonk Complete!!\nComplete at ${new Date()} \nhttps://letsbonk.fun/token/${token}`);
                            }
                        }
                    );

                }
            }
        }
    }
}

monitorTransactions().catch(console.error);