import {EncryptionStrategyInterface} from "./EncryptionStrategyInterface";
import * as crypto from "crypto";

const algorithm = "aes-256-cbc";

export class AES256EncryptionStrategy implements EncryptionStrategyInterface {
    private key: Buffer;
    private iv: Buffer;

    constructor(key: Buffer, iv: Buffer) {
        this.key = key;
        this.iv = iv;
    }

    encrypt(buffer: Buffer): Promise<Buffer> {
        const cipher = crypto.createCipheriv(algorithm, this.key, this.iv);
        let encrypted = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return Promise.resolve(encrypted);
    }

    decrypt(buffer: Buffer): Promise<Buffer> {
        const decipher = crypto.createDecipheriv(algorithm, this.key, this.iv);
        let decrypted = decipher.update(buffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return Promise.resolve(decrypted);
    }
}