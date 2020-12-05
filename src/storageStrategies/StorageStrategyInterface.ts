export interface StorageStrategyInterface {
    get: (key: string) => Promise<Buffer>
    put: (key: string, content: Buffer) => Promise<void>
    delete: (key: string) => Promise<void>
    list: (prefix: string) => Promise<string[]>
    getStream?: (key: string) => Promise<NodeJS.ReadableStream>
    putStream?: (key: string) => Promise<NodeJS.WritableStream>
}