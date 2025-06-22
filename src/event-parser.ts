import { Buffer } from "buffer";
// @ts-ignore
import { Layout } from "buffer-layout";
import { IEventLogMsg, PROGRAM_LOG_PARAMS } from "./constants";
import { Pump } from "pump-public-docs/idl/pump";
import * as pumpIdl from "pump-public-docs/idl/pump.json";
import { convertIdlToCamelCase, IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";
import { IdlCoder } from "@coral-xyz/anchor/dist/cjs/coder/borsh/idl";
/**
 * @description event 转换器,负责将筛选,并交给eventDbProcessor处理
 */
export class EventParser {
    private readonly layouts: Map<string, { discriminator: number[]; layout: Layout; }>

    constructor() {
        let layouts = new Map<string, { discriminator: number[]; layout: Layout; }>;
        let idl1 = convertIdlToCamelCase(pumpIdl as Pump);
        if (idl1.events) {
            const types: IdlTypeDef[] = idl1.types;
            if (!types) {
                throw new Error("Events require `idl.types`");
            }
            idl1.events.map((ev) => {
                const typeDef: IdlTypeDef | undefined = types.find((ty) => ty.name === ev.name);
                if (!typeDef) {
                    throw new Error(`Event not found: ${ev.name}`);
                }
                layouts.set(ev.name, {
                    discriminator: ev.discriminator, layout: IdlCoder.typeDefLayout({ typeDef, types }),
                });
            });
        }
        this.layouts = layouts;
    }
    async dealLogs(logs: string[], txId: string) {
        for (const log of logs) {
            if (log.startsWith(PROGRAM_LOG_PARAMS.PREFIX_OF_LOG) || log.startsWith(PROGRAM_LOG_PARAMS.PREFIX_OF_DATA)) {
                const logStr = log.startsWith(PROGRAM_LOG_PARAMS.PREFIX_OF_LOG) ? log.slice(PROGRAM_LOG_PARAMS.PREFIX_OF_LOG.length) : log.slice(PROGRAM_LOG_PARAMS.PREFIX_OF_DATA.length);
                await this.handleLogStr({
                    log: logStr,
                    txId: txId
                });
            }
        }
    }

    async handleLogStr(eventLog: IEventLogMsg) {
        const logArr = Buffer.from(eventLog.log, 'base64');
        for (const [name, layout] of this.layouts) {
            const givenDisc = logArr.subarray(0, 8);
            const matches = givenDisc.equals(Buffer.from(layout.discriminator));
            if (matches) {
                const txId = eventLog.txId
                let parseData= { ...layout.layout.decode(logArr.subarray(givenDisc.length)), tx:txId };
                if (name == "createEvent"){
                    console.log(parseData)
                }
                break;
            }
        }
    }
}