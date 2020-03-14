import fs from "fs";
import path from "path";
import {StorageStrategyInterface} from "../index";

export class LocalStorageStrategy implements StorageStrategyInterface {
    private dir: string;

    constructor(dir: string) {
        this.dir = dir;
        fs.mkdirSync(dir, { recursive: true });
    }

    delete(key: string): Promise<void> {
        return fs.promises.unlink(this.getFilepath(key));
    }

    get(key: string): Promise<Buffer> {
        return fs.promises.readFile(this.getFilepath(key));
    }

    async put(key: string, content: Buffer): Promise<void> {
        await this.createDirectory(key);
        return fs.promises.writeFile(this.getFilepath(key), content);
    }

    private async createDirectory(key: string) {
        const splitKey = key.split("/");
        splitKey.pop();
        if(splitKey.length > 0) {
            return fs.promises.mkdir(path.join(this.dir, splitKey.join("/")), {recursive: true})
        }
        return;
    }

    private getFilepath(key: string): string {
        return path.join(this.dir, key);
    }
}
