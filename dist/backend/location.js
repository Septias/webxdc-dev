"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = exports.LocationError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const unpack_1 = require("./unpack");
class LocationError extends Error {
}
exports.LocationError = LocationError;
function getLocation(location) {
    if (location.startsWith("http://") || location.startsWith("https://")) {
        return { type: "url", url: location, dispose: () => { } };
    }
    const parts = location.split("/").filter((part) => part !== "");
    const lastPart = parts[parts.length - 1];
    if (!fs_1.default.existsSync(location)) {
        throw new LocationError(`Not a file or directory: ${location}`);
    }
    const stats = fs_1.default.statSync(location);
    if (location.endsWith(".xdc") && stats.isFile()) {
        const path = (0, unpack_1.createTempDir)();
        try {
            (0, unpack_1.unpack)(location, path);
        }
        catch (e) {
            throw new LocationError(`Not a valid xdc zip file: ${location}`);
        }
        if (!hasIndexHtml(path)) {
            throw new LocationError(`Invalid xdc file (no index.html file inside): ${location}`);
        }
        return {
            type: "xdc",
            path,
            filePath: location,
            derivedName: lastPart.slice(0, lastPart.length - ".xdc".length),
            dispose: () => {
                fs_1.default.rmSync(path, { recursive: true });
            },
        };
    }
    if (!stats.isDirectory()) {
        throw new LocationError(`Not an xdc file or a directory: ${location}`);
    }
    if (!hasIndexHtml(location)) {
        throw new LocationError(`Invalid xdc dir (no index.html file): ${location}`);
    }
    return {
        type: "directory",
        path: location,
        derivedName: lastPart,
        dispose: () => { },
    };
}
exports.getLocation = getLocation;
function hasIndexHtml(location) {
    const p = (0, path_1.resolve)(location, "index.html");
    if (!fs_1.default.existsSync(p)) {
        return false;
    }
    return fs_1.default.statSync(p).isFile();
}
