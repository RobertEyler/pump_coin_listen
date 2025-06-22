import { PublicKey } from "@solana/web3.js";

const mint = new PublicKey("7WAFfQAEaB4Gpp4xRvbjHmS6mLPSdJjtTB3NTiLdpump");
const pump = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

const [pool]= PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"),mint.toBuffer()],pump);

console.log("pool:",pool.toBase58());