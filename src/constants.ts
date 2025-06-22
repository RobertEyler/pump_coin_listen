

export enum PROGRAM_LOG_PARAMS{
    PREFIX_OF_LOG = "Program log: ",
    PREFIX_OF_DATA = "Program data: ",
}

export interface IEventLogMsg{
    log: string;
    txId: string;
}
