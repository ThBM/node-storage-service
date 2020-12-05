import {BlobServiceClient, StorageSharedKeyCredential, ContainerClient} from "@azure/storage-blob"
import { PassThrough } from "stream";
import {StorageStrategyInterface} from "./StorageStrategyInterface";


interface AzureBlobStorageStrategyOptions {
  url: string // https://${options.account}.blob.core.windows.net
  account: string
  accountKey: string
  container: string
}

export class AzureBlobStorageStrategy implements StorageStrategyInterface {

  private containerClient: ContainerClient;

  constructor(options: AzureBlobStorageStrategyOptions) {
    const blobServiceClient = new BlobServiceClient(
      options.url,
      new StorageSharedKeyCredential(options.account, options.accountKey)
    );
    this.containerClient = blobServiceClient.getContainerClient(options.container);
  }

  async delete(key: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.delete();
    return;
  }

  async get(key: string): Promise<Buffer> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    return blockBlobClient.downloadToBuffer();
  }

  async list(prefix: string): Promise<string[]> {
    let iter = await this.containerClient.listBlobsFlat({prefix});
    const items = [];
    for await (let blob of iter) {
      items.push(blob.name)
    }
    return items;
  }

  async put(key: string, content: Buffer): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    await blockBlobClient.upload(content, content.length);
  };

  async getStream(key: string): Promise<NodeJS.ReadableStream> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(key);
    const download = await blockBlobClient.download();
    if(!download.readableStreamBody) throw "File not found";

    return download.readableStreamBody
  }

  async putStream(key: string): Promise<NodeJS.WritableStream> {
    const stream = new PassThrough({emitClose: false})
    this.containerClient.getBlockBlobClient(key).uploadStream(stream)
    .then(() => stream.emit("close"));
    return stream;
  }
}