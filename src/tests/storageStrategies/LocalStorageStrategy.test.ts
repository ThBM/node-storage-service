import chai from "chai";
import {StorageService} from "../..";
import {LocalStorageStrategy} from "../..";
import fs from "fs";
import path from "path";
const config = require("../../../config/config.test.json");

const dir = path.join(__dirname , "../../..", config.local.dir);
const localStorageStrategy = new LocalStorageStrategy(dir);
const storageService = new StorageService(localStorageStrategy);
const testFile1 = Buffer.from("Hello world!", "utf8");
const testFile2 = Buffer.from("Hello world! It's me.", "utf8");

var text = ""
for (let i = 0; i<1e6; i++) {
    text += "Hello world\n";
}
const testFileLong = Buffer.from(text, "utf8");

describe('LocalStorageStrategy', function() {

    before(async () => {
        const exists = await fs.existsSync(dir);
        if(exists) {
            await fs.promises.rmdir(dir, {recursive: true});
        }
        await fs.promises.mkdir(dir, {recursive: true});
    })

    it('should store the file in local storage', function() {
        return storageService.put("test.txt", testFile1)
            .then(_ => fs.promises.readFile(dir + "/test.txt"))
            .then(result => chai.expect(result.toString()).equal(testFile1.toString()));
    });

    it('should store the file in local storage and create folder', function() {
        return storageService.put("some/directory/test.txt", testFile1)
          .then(_ => fs.promises.readFile(dir + "/some/directory/test.txt"))
          .then(result => chai.expect(result.toString()).equal(testFile1.toString()));
    });

    it('should replace existing file', function() {
        return storageService.put("test.txt", testFile2)
            .then(_ => fs.promises.readFile(dir + "/test.txt"))
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
            .then(_ => fs.access(dir + "/test.txt", err => chai.expect(err).not.null))
    });

    it('should work with read and write stream', async function () {
        await storageService.put("longText.txt", testFileLong)
        const readStream = await storageService.getStream("longText.txt");
        const writeStream = await storageService.putStream("copyLongText.txt")
        readStream.pipe(writeStream);
        return new Promise((resolve, reject) => {
            readStream.on('end', async () => {
                const data = await storageService.get("copyLongText.txt")
                try {
                    chai.expect(data.toString()).equal(testFileLong.toString());
                } catch (e) {
                    reject(e)
                }
                resolve()
            })
        })
    }).timeout(5000);

});
