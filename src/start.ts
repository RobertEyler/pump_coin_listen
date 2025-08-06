
import { bonkSub } from "./bonk/grpc-bonk";
import { pumpSub } from "./pump";

const starter: Promise<any>[]= [bonkSub(),pumpSub()];

Promise.all(starter).then();