export interface StorageStrategyInterface {
    get: (key: string) => Promise<Buffer>
    put: (key: string, content: Buffer) => Promise<void>
    delete: (key: string) => Promise<void>
}