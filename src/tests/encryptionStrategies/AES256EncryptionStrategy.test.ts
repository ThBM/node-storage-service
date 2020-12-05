import chai from "chai";
import {StorageService} from "../..";
import {LocalStorageStrategy} from "../..";
import {AES256EncryptionStrategy} from "../..";
import fs from "fs";
import crypto from "crypto";
import path from "path";
const config = require("../../../config/config.test.json");

const dir = path.join(__dirname , "../../..", config.local.dir);
const localStorageStrategy = new LocalStorageStrategy(dir);

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encryptionStrategy = new AES256EncryptionStrategy(key, iv);

const storageService = new StorageService(localStorageStrategy, {encryptionStrategy});

const testFile1 = Buffer.from("Hello world!", "utf8");

describe('AES256EncryptionStrategy', function() {

    it('should store encrypted file', function() {
        storageService.put("testEncrypted.txt", testFile1)
            .then(_ => fs.promises.readFile(dir + "/testEncrypted.txt"))
            .then(result => chai.expect(result.toString()).not.eql(testFile1.toString()));
    });

    it('should get decrypted file content', function() {
        return storageService.get("testEncrypted.txt")
            .then(result => chai.expect(result.toString(), testFile1.toString()));
    });

    it('should not work with read and write stream', async function () {
        chai.expect(() => storageService.getStream("longText.txt")).to.throw()
        chai.expect(() => storageService.putStream("longText.txt")).to.throw()
    });
});