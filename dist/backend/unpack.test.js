"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const unpack_1 = require("./unpack");
test("withTempDir", () => {
    let createdTmpDir = null;
    (0, unpack_1.withTempDir)((tmpDir) => {
        createdTmpDir = tmpDir;
        const stats = fs_1.default.statSync(createdTmpDir);
        expect(stats.isDirectory()).toBeTruthy();
    });
    // we expect a createdTmpDir
    expect(createdTmpDir).not.toBeNull();
    // afterwards the dir is gone again
    expect(fs_1.default.existsSync(createdTmpDir)).toBeFalsy();
});
test("withTempDir with error", () => {
    let createdTmpDir = null;
    expect(() => {
        (0, unpack_1.withTempDir)((tmpDir) => {
            createdTmpDir = tmpDir;
            // an error occurs dealing with the tmpDir
            throw new Error();
        });
    }).toThrowError();
    // we expect a createdTmpDir
    expect(createdTmpDir).not.toBeNull();
    // afterwards the dir is gone again, even in the face of the error
    expect(fs_1.default.existsSync(createdTmpDir)).toBeFalsy();
});
test("unpack", () => {
    (0, unpack_1.withTempDir)((tmpDir) => {
        (0, unpack_1.unpack)(path_1.default.resolve(__dirname, "fixtures/clean.xdc"), tmpDir);
        const stats = fs_1.default.statSync(path_1.default.resolve(tmpDir, "manifest.toml"));
        expect(stats.isFile()).toBeTruthy();
    });
    expect.assertions(1);
});
