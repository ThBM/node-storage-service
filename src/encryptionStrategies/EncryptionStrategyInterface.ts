export interface EncryptionStrategyInterface {
    encrypt: (buffer: Buffer) => Promise<Buffer>
    decrypt: (buffer: Buffer) => Promise<Buffer>
}