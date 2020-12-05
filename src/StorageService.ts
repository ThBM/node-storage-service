import {StorageStrategyInterface} from "./storageStrategies/StorageStrategyInterface";
import {EncryptionStrategyInterface} from "./encryptionStrategies/EncryptionStrategyInterface";

export interface StorageServiceOptions {
    encryptionStrategy?: EncryptionStrategyInterface
}

export class StorageService {
    private storageStrategy: StorageStrategyInterface;
    private encryptionStrategy?: EncryptionStrategyInterface;

    constructor(storageStrategy: StorageStrategyInterface, options?: StorageServiceOptions) {
        this.storageStrategy = storageStrategy;
        if (options) {
            this.encryptionStrategy = options.encryptionStrategy
        }
    }

    public get(key: string) {
        return this.storageStrategy.get(key)
            .then(file => this.encryptionStrategy ? this.encryptionStrategy.decrypt(file) : Promise.resolve(file));
    }

    public put(key: string, content: Buffer) {
        return this.encryptionStrategy ? this.encryptionStrategy.encrypt(content).then(content => this.storageStrategy.put(key, content)) : this.storageStrategy.put(key, content);
    }

    public delete(key: string) {
        return this.storageStrategy.delete(key);
    }

    public list(prefix: string) {
        return this.storageStrategy.list(prefix);
    }

    public getStream(key: string) {
        if (!this.storageStrategy.getStream) throw new Error("getStream not supported for this storage strategy.");
        if (this.encryptionStrategy !== undefined) throw new Error("Streams are not supported with encryption.")

        return this.storageStrategy.getStream(key);
    }

    public putStream(key: string) {
        if (!this.storageStrategy.putStream) throw new Error("putStream not supported for this storage strategy.");
        if (this.encryptionStrategy !== undefined) throw new Error("Streams are not supported with encryption.")

        return this.storageStrategy.putStream(key);
    }
}