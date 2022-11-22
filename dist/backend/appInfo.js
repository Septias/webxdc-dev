"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolVersion = exports.getAppInfoUrl = exports.getAppInfo = exports.AppInfoError = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const toml_1 = __importDefault(require("toml"));
// have to use v2 otherwise end up in config hell because v3 is ESM only
const node_fetch_1 = __importDefault(require("node-fetch"));
const package_json_1 = __importDefault(require("../package.json"));
const waitOn_1 = require("./waitOn");
const APP_INFO_TIMEOUT = 5000;
class AppInfoError extends Error {
}
exports.AppInfoError = AppInfoError;
function getAppInfo(location) {
    return __awaiter(this, void 0, void 0, function* () {
        if (location.type === "url") {
            try {
                yield (0, waitOn_1.waitOnUrl)(location.url, APP_INFO_TIMEOUT);
            }
            catch (e) {
                throw new AppInfoError(`Timeout. Could not access URL: ${location.url}`);
            }
            return getAppInfoUrl(location, node_fetch_1.default);
        }
        return {
            location,
            manifest: getManifestInfoFromDir(location.path, location.derivedName),
            icon: getIconInfoFromDir(location.path),
            toolVersion: getToolVersion(),
        };
    });
}
exports.getAppInfo = getAppInfo;
function getAppInfoUrl(location, fetch) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            location,
            manifest: yield getManifestInfoFromUrl(location.url, fetch),
            icon: yield getIconInfoFromUrl(location.url, fetch),
            toolVersion: getToolVersion(),
        };
    });
}
exports.getAppInfoUrl = getAppInfoUrl;
function getToolVersion() {
    return package_json_1.default.version || "Unknown";
}
exports.getToolVersion = getToolVersion;
function getManifestInfoFromUrl(url, fetch) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!url.endsWith("/")) {
            url = url + "/";
        }
        const response = yield fetch(url + "manifest.toml");
        if (!response.ok) {
            return {
                name: "Unknown (running from URL)",
                sourceCodeUrl: undefined,
                manifestFound: false,
            };
        }
        const body = yield response.text();
        const parsed = tomlParse(body);
        return {
            name: parsed.name || "No entry in manifest.toml (running from URL)",
            sourceCodeUrl: parsed.source_code_url,
            manifestFound: true,
        };
    });
}
function getIconInfoFromUrl(url, fetch) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!url.endsWith("/")) {
            url = url + "/";
        }
        const pngBuffer = yield readUrlBuffer(url + "icon.png", fetch);
        if (pngBuffer != null) {
            return {
                buffer: pngBuffer,
                contentType: "image/png",
            };
        }
        const jpgBuffer = yield readUrlBuffer(url + "icon.jpg", fetch);
        if (jpgBuffer != null) {
            return {
                buffer: jpgBuffer,
                contentType: "image/jpeg",
            };
        }
        return null;
    });
}
function getManifestInfoFromDir(dir, fallbackName) {
    const tomlBuffer = readFileBuffer(path_1.default.join(dir, "manifest.toml"));
    if (tomlBuffer === null) {
        return {
            name: fallbackName,
            sourceCodeUrl: undefined,
            manifestFound: false,
        };
    }
    const parsed = tomlParse(tomlBuffer.toString());
    const name = parsed.name || fallbackName;
    return {
        name,
        sourceCodeUrl: parsed.source_code_url,
        manifestFound: true,
    };
}
function tomlParse(s) {
    try {
        return toml_1.default.parse(s);
    }
    catch (e) {
        throw new AppInfoError("Invalid manifest.toml, please check the format");
    }
}
function getIconInfoFromDir(dir) {
    const pngBuffer = readFileBuffer(path_1.default.resolve(dir, "icon.png"));
    if (pngBuffer != null) {
        return { buffer: pngBuffer, contentType: "image/png" };
    }
    const jpgBuffer = readFileBuffer(path_1.default.resolve(dir, "icon.jpg"));
    if (jpgBuffer != null) {
        return { buffer: jpgBuffer, contentType: "image/jpeg" };
    }
    return null;
}
function readFileBuffer(location) {
    if (!fs_1.default.existsSync(location)) {
        return null;
    }
    const stats = fs_1.default.statSync(location);
    if (!stats.isFile()) {
        return null;
    }
    return fs_1.default.readFileSync(location);
}
function readUrlBuffer(url, fetch) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        if (!response.ok) {
            return null;
        }
        const ab = yield response.arrayBuffer();
        return Buffer.from(ab);
    });
}
