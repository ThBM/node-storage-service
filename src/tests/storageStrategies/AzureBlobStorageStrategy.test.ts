import chai from "chai";
import {StorageService} from "../..";
import {AzureBlobStorageStrategy} from "../..";
import {BlobServiceClient, StorageSharedKeyCredential} from "@azure/storage-blob";
const config = require("../../../config/config.test.json");

const options = {
    url: config.azure.config.url,
    account: config.azure.config.account,
    accountKey: config.azure.config.accountKey,
    container: config.azure.container
};


const blobServiceClient = new BlobServiceClient(
  options.url,
  new StorageSharedKeyCredential(options.account, options.accountKey)
);
const containerClient = blobServiceClient.getContainerClient(options.container);


const azureBlobStorageStrategy = new AzureBlobStorageStrategy(options);
const storageService = new StorageService(azureBlobStorageStrategy);
const testFile1 = Buffer.from("Hello world!", "utf8");
const testFile2 = Buffer.from("Hello world! It's me.", "utf8");

describe('AzureBlobStorageStrategy', function() {

    before(async () => {
        //Recreate container
        const containers = blobServiceClient.listContainers();
        for await (const container of containers) {
            if (container.name === options.container) {
                await containerClient.delete();
                await containerClient.create();
                break;
            }
        }
    })

    it('should store the file', function() {
        return storageService.put("test.txt", testFile1)
            .then(_ => {
                const blockBlobClient = containerClient.getBlockBlobClient("test.txt");
                return blockBlobClient.downloadToBuffer();
            })
            .then(result => chai.expect(result.toString()).equal(testFile1.toString()));
    });

    it('should store the file and create folder', function() {
        return storageService.put("some/directory/test.txt", testFile1)
          .then(_ => {
              const blockBlobClient = containerClient.getBlockBlobClient("some/directory/test.txt");
              return blockBlobClient.downloadToBuffer();
          })
          .then(result => chai.expect(result.toString()).equal(testFile1.toString()));
    });

    it('should replace existing file', function() {
        return storageService.put("test.txt", testFile2)
          .then(_ => {
              const blockBlobClient = containerClient.getBlockBlobClient("test.txt");
              return blockBlobClient.downloadToBuffer();
          })
          .then(result => chai.expect(result.toString()).equal(testFile2.toString()));
    });

    it('should get file content', function() {
        return storageService.get("test.txt")
            .then(result => chai.expect(result.toString()).equal(testFile2.toString()));
    });

    it('should list all files with prefix', async function () {
        await storageService.put("some/test.txt", testFile1);
        await storageService.put("some/other/very/long/test.txt", testFile1);

        return storageService.list("some")
            .then(files => chai.expect(files).to.eql(["some/directory/test.txt", "some/other/very/long/test.txt", "some/test.txt"]))
    });

    it('should delete file', function() {
        return storageService.delete("test.txt")
            .then(_ => {
                const blockBlobClient = containerClient.getBlockBlobClient("test.txt");
                return blockBlobClient.downloadToBuffer();
            })
            .then(_ => {
                throw new Error("Should not be here")
            })
          .catch(err => chai.expect(err).not.null);
    });

});
