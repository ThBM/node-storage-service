import {StorageStrategyInterface} from "./StorageStrategyInterface";
import {S3} from 'aws-sdk';


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
    put(key: string, content: Buffer): Promise<void> {
        return new Promise(((resolve, reject) => {
            this.s3.putObject({Key: key, Body: content, Bucket: this.bucket}, (err) => {
                if (err) return reject(err);
                return resolve();
            })
        }))
    };

}