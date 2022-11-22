"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const location_1 = require("./location");
test("directory location with index.html", () => {
    const dir = path_1.default.resolve(__dirname, "fixtures/minimal");
    const location = (0, location_1.getLocation)(dir);
    expect(location.type).toEqual("directory");
    // help ts
    if (location.type !== "directory") {
        return;
    }
    expect(location.path).toEqual(dir);
    expect(location.derivedName).toEqual("minimal");
    expect(() => location.dispose()).not.toThrow();
});
test("directory location with index.html with trailing slash", () => {
    const dir = path_1.default.resolve(__dirname, "fixtures/minimal/");
    const location = (0, location_1.getLocation)(dir);
    expect(location.type).toEqual("directory");
    // help ts
    if (location.type !== "directory") {
        return;
    }
    expect(location.path).toEqual(dir);
    expect(location.derivedName).toEqual("minimal");
    expect(() => location.dispose()).not.toThrow();
});
test("invalid directory location without index.html", () => {
    const dir = path_1.default.resolve(__dirname, "fixtures/invalid");
    try {
        (0, location_1.getLocation)(dir);
    }
    catch (e) {
        expect(e).toBeInstanceOf(location_1.LocationError);
    }
    expect.assertions(1);
});
test("xdc file", () => {
    const filePath = path_1.default.resolve(__dirname, "fixtures/clean.xdc");
    const location = (0, location_1.getLocation)(filePath);
    expect(location.type).toEqual("xdc");
    // help ts
    if (location.type !== "xdc") {
        return;
    }
    expect(location.filePath).toEqual(filePath);
    expect(location.derivedName).toEqual("clean");
    const stats = fs_1.default.statSync(location.path);
    expect(stats.isDirectory()).toBeTruthy();
    expect(() => location.dispose()).not.toThrow();
    expect(fs_1.default.existsSync(location.path)).toBeFalsy();
});
test("xdc file with invalid zip", () => {
    const filePath = path_1.default.resolve(__dirname, "fixtures/invalid.xdc");
    try {
        (0, location_1.getLocation)(filePath);
    }
    catch (e) {
        expect(e).toBeInstanceOf(location_1.LocationError);
    }
    expect.assertions(1);
});
test("a non-xdc file cannot be handled", () => {
    const filePath = path_1.default.resolve(__dirname, "fixtures/notXdc");
    try {
        (0, location_1.getLocation)(filePath);
    }
    catch (e) {
        expect(e).toBeInstanceOf(location_1.LocationError);
    }
    expect.assertions(1);
});
test("directory is never xdc file", () => {
    const filePath = path_1.default.resolve(__dirname, "fixtures/notXdcDir.xdc");
    const location = (0, location_1.getLocation)(filePath);
    expect(location.type).toEqual("directory");
    // help ts
    if (location.type !== "directory") {
        return;
    }
    expect(location.path).toEqual(filePath);
    expect(location.derivedName).toEqual("notXdcDir.xdc");
    expect(() => location.dispose()).not.toThrow();
});
test("url", () => {
    const location = (0, location_1.getLocation)("http://example.com");
    expect(location.type).toEqual("url");
    // help ts
    if (location.type !== "url") {
        return;
    }
    expect(location.url).toEqual("http://example.com");
    expect(() => location.dispose()).not.toThrow();
});
