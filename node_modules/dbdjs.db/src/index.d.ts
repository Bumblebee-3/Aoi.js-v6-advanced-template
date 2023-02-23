import EventEmitter from "events";

export class Database extends EventEmitter {
    path: string
    tables: Array<TableOptions>
    maxFileData: number
    debug: boolean
    extension: string
    force: boolean 
    cacheMaxSize: number 
    timestamp: boolean
    saveTime: number
    allTime: number
    getTime: number
    deleteTime: number 
    cacheRouters: boolean 
    readySince: number
    routers: Map<string, string>
    ready: boolean

    constructor(options: DatabaseOptions)

    public get uptime(): number | null
    public connect(): void

    public delete(table: string, key: string): Promise<boolean>
    public all(table: string, options?: QueryOptions): Promise<RawData[]>
    public set(table: string, key: string, value: any, ttl?: number): Promise<boolean>
    public get(table: string, key: string): Promise<Data | undefined>
    private clearTable(table: string): Promise<boolean>
    public clearDatabase(): boolean

    public on<K extends keyof DatabaseEvents>(event: K, listener: (...args: DatabaseEvents[K]) => void): void
    public once<K extends keyof DatabaseEvents>(event: K, listener: (...args: DatabaseEvents[K]) => void): void
}

export interface QueryOptions {
    filter?: (data: RawData) => boolean
}

export interface RawData {
    key: string
    createdAt?: number
    updatedAt?: number
    value: any
    ttl?: number
}

export class Data {
    key: string
    createdAt?: number
    updatedAt?: number
    value: any
    ttl?: number

    constructor(data: RawData, db: Database, method: "get" | "set" | "delete" | "all")

    public toJSON(): RawData
    public update(data: RawData): Promise<boolean>
}

export class Table {
    name: string
    db: Database

    constructor(options: TableOptions, db: Database)
}


export class DebugData extends any {}

export interface DatabaseEvents {
    debug: [data: string],
    ready: [],
    tableReady: [table: Table]
}

export interface TableOptions {
    name: string
}

export interface DatabaseOptions {
    path?: string
    tables: Array<TableOptions>
    maxFileData?: number
    debug?: boolean
    extension?: string
    force?: boolean 
    cacheMaxSize?: number 
    timestamp?: boolean
    saveTime?: number
    allTime?: number
    getTime?: number
    deleteTime?: number 
    cacheRouters?: boolean 
}

 module.exports = {

  }