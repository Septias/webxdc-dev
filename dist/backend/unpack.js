"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempDir = exports.withTempDir = exports.unpack = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const adm_zip_1 = __importDefault(require("adm-zip"));
function unpack(xdcPath, extractLocation) {
    const zip = new adm_zip_1.default(xdcPath);
    zip.extractAllTo(extractLocation);
}
exports.unpack = unpack;
function withTempDir(fn) {
    const tmpDir = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "webxdc-dev"));
    try {
        fn(tmpDir);
    }
    finally {
        try {
            fs_1.default.rmSync(tmpDir, { recursive: true });
        }
        catch (e) {
            console.error(`An error has occurred while removing the temp dir at ${tmpDir}. Error: ${e}`);
        }
    }
}
exports.withTempDir = withTempDir;
function createTempDir() {
    return fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "webxdc-dev"));
}
exports.createTempDir = createTempDir;
