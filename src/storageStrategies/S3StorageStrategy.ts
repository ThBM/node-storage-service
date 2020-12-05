import {StorageStrategyInterface} from "./StorageStrategyInterface";
import {S3} from 'aws-sdk';
import { PassThrough } from "stream";


interface S3StorageStrategyOptions {
    awsConfig: S3.Types.ClientConfiguration
    bucket: string
}

export class S3StorageStrategy implements StorageStrategyInterface {

    private s3: S3;
    private bucket: string;

    constructor(options: S3StorageStrategyOptions) {
        this.s3 = new S3(options.awsConfig);
        this.bucket = options.bucket;
    }

    delete(key: string): Promise<void> {
        return new Promise(((resolve, reject) => {
            this.s3.deleteObject({Key: key, Bucket: this.bucket}, (err) => {
                if (err) return reject(err);
                return resolve();
            })
        }))
    }

    get(key: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            this.s3.getObject({Bucket: this.bucket, Key: key}, (err, data) => {
                if (err) return reject(err);
                return resolve(data.Body as Buffer);
            })
        })
    }

    list(prefix: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.s3.listObjects({Bucket: this.bucket, Prefix: prefix}, (err, data) => {
                if (err) return reject(err);
                if (!data.Contents) return resolve([]);
                const list = data.Contents.map(object => object.Key).filter(item => item !== undefined) as string[];
                return resolve(list);
            })
        })
    }

    put(key: string, content: Buffer): Promise<void> {
        return new Promise(((resolve, reject) => {
            this.s3.putObject({Key: key, Body: content, Bucket: this.bucket}, (err) => {
                if (err) return reject(err);
                return resolve();
            })
        }))
    };

    async getStream(key: string): Promise<NodeJS.ReadableStream> {
        return this.s3.getObject({ Bucket: this.bucket, Key: key }).createReadStream()
    }

    async putStream(key: string): Promise<NodeJS.WritableStream> {
        const stream = new PassThrough({emitClose: false})
        this.s3.upload({ Key: key, Body: stream, Bucket: this.bucket }, (err, data) => {
            if (err) throw err;
            stream.emit("close");
        })
        return stream;
    }

}