import chai from "chai";
import {StorageService} from "../..";
import {LocalStorageStrategy} from "../..";
import fs from "fs";

const dir = __dirname + "/../../../var/files";
const localStorageStrategy = new LocalStorageStrategy(dir);
const storageService = new StorageService(localStorageStrategy);
const testFile1 = Buffer.from("Hello world!", "utf8");
const testFile2 = Buffer.from("Hello world! It's me.", "utf8");

describe('LocalStorageStrategy', function() {

    it('should store the file in local storage', function() {
        return storageService.put("test.txt", testFile1)
            .then(_ => fs.promises.readFile(dir + "/test.txt"))
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

    it('should delete file', function() {
        return storageService.delete("test.txt")
            .then(_ => fs.access(dir + "/test.txt", err => chai.expect(err).not.null))
    });

});