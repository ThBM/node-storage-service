import chai from "chai";
import {StorageService} from "../..";
import {S3StorageStrategy} from "../..";

const options = {
    awsConfig: {
        accessKeyId: 'minioadmin' ,
        secretAccessKey: 'minioadmin' ,
        endpoint: 'http://127.0.0.1:9000' ,
        s3ForcePathStyle: true,
        signatureVersion: 'v4'
    },
    bucket: "test"
};
const s3StorageStrategy = new S3StorageStrategy(options);

const storageService = new StorageService(s3StorageStrategy);
const testFile1 = Buffer.from("Hello world!", "utf8");
const testFile2 = Buffer.from("Hello world! It's me.", "utf8");


import AWS from 'aws-sdk';

AWS.config.update({region: "us-west-2"});
var s3  = new AWS.S3({
    accessKeyId: 'minioadmin' ,
    secretAccessKey: 'minioadmin' ,
    endpoint: 'http://127.0.0.1:9000' ,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4'
});

describe('S3StorageStrategy', function() {

    it('should store the file in S3', function() {
        return storageService.put("test.txt", testFile1)
            .then(_ => new Promise<Buffer>((resolve, reject) => s3.getObject({Bucket: options.bucket, Key: "test.txt"}, (err, data) => {
                if(err) return reject(err);
                return resolve(data.Body as Buffer);
            })))
            .then(result => {
                chai.expect(result.toString()).equal(testFile1.toString());
            })
    });

    it('should store the file in S3 and create folder', function() {
        return storageService.put("some/directory/test.txt", testFile1)
            .then(_ => new Promise<Buffer>((resolve, reject) => s3.getObject({Bucket: options.bucket, Key: "some/directory/test.txt"}, (err, data) => {
                if(err) return reject(err);
                return resolve(data.Body as Buffer);
            })))
            .then(result => {
                chai.expect(result.toString()).equal(testFile1.toString());
            })
    });

    it('should replace existing file', function() {
        return storageService.put("test.txt", testFile2)
            .then(_ => new Promise<Buffer>((resolve, reject) => s3.getObject({Bucket: options.bucket, Key: "test.txt"}, (err, data) => {
                    if(err) return reject(err);
                    return resolve(data.Body as Buffer);
                })))
            .then(result => {
                chai.expect(result.toString()).equal(testFile2.toString());
            })
    });

    it('should get file content', function () {
        return storageService.get("test.txt")
            .then(result => chai.expect(result.toString()).equal(testFile2.toString()))
    });

    it('should list all files with prefix', async function () {
        await storageService.put("some/test.txt", testFile1);
        await storageService.put("some/other/very/long/test.txt", testFile1);

        return storageService.list("some")
            .then(files => chai.expect(files).to.eql(["some/directory/test.txt", "some/other/very/long/test.txt", "some/test.txt"]))
    });

    it('should delete file', function() {
        return storageService.delete("test.txt")
            .then(_ => new Promise(resolve => s3.getObject({Bucket: options.bucket, Key: "test.txt"}, err => {
                    chai.expect(err).not.null;
                    return resolve();
                })))
    });

});