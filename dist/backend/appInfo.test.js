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
const path_1 = __importDefault(require("path"));
const location_1 = require("./location");
const appInfo_1 = require("./appInfo");
test("minimal directory app info", () => __awaiter(void 0, void 0, void 0, function* () {
    const location = (0, location_1.getLocation)(path_1.default.resolve(__dirname, "fixtures", "minimal"));
    const appInfo = yield (0, appInfo_1.getAppInfo)(location);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "minimal",
        sourceCodeUrl: undefined,
        manifestFound: false,
    });
    expect(appInfo.icon).toBeNull();
}));
test("directory app info with manifest", () => __awaiter(void 0, void 0, void 0, function* () {
    const location = (0, location_1.getLocation)(path_1.default.resolve(__dirname, "fixtures", "withManifest"));
    const appInfo = yield (0, appInfo_1.getAppInfo)(location);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "With Manifest App",
        sourceCodeUrl: "http://example.com",
        manifestFound: true,
    });
    expect(appInfo.icon).toBeNull();
}));
test("directory app info with manifest but no name entry", () => __awaiter(void 0, void 0, void 0, function* () {
    const location = (0, location_1.getLocation)(path_1.default.resolve(__dirname, "fixtures", "withManifestWithoutName"));
    const appInfo = yield (0, appInfo_1.getAppInfo)(location);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "withManifestWithoutName",
        sourceCodeUrl: "http://example.com",
        manifestFound: true,
    });
    expect(appInfo.icon).toBeNull();
}));
// Would like to enable this test, but a broken manifest.toml fixture
// causes vscode to freak out with red files and I don't know how to disable
// test("directory app info with broken manifest", async () => {
//   const location = getLocation(
//     path.resolve(__dirname, "fixtures", "withBrokenManifest")
//   );
//   try {
//     await getAppInfo(location);
//   } catch (e) {
//     if (e instanceof AppInfoError) {
//       expect(e.message).toEqual(
//         "Invalid manifest.toml, please check the format"
//       );
//     } else {
//       throw e;
//     }
//   }
// });
test("directory app info with jpg icon", () => __awaiter(void 0, void 0, void 0, function* () {
    const location = (0, location_1.getLocation)(path_1.default.resolve(__dirname, "fixtures", "withJpgIcon"));
    const appInfo = yield (0, appInfo_1.getAppInfo)(location);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "withJpgIcon",
        sourceCodeUrl: undefined,
        manifestFound: false,
    });
    expect(appInfo.icon).toBeDefined();
    // help ts
    if (appInfo.icon == null) {
        return;
    }
    expect(appInfo.icon).toMatchObject({ contentType: "image/jpeg" });
}));
test("directory app info with png icon", () => __awaiter(void 0, void 0, void 0, function* () {
    const location = (0, location_1.getLocation)(path_1.default.resolve(__dirname, "fixtures", "withPngIcon"));
    const appInfo = yield (0, appInfo_1.getAppInfo)(location);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "withPngIcon",
        sourceCodeUrl: undefined,
        manifestFound: false,
    });
    expect(appInfo.icon).toBeDefined();
    // help ts
    if (appInfo.icon == null) {
        return;
    }
    expect(appInfo.icon).toMatchObject({ contentType: "image/png" });
}));
test("url app info without manifest or icon", () => __awaiter(void 0, void 0, void 0, function* () {
    const seenUrls = [];
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        seenUrls.push(url);
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    const appInfo = yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "Unknown (running from URL)",
        sourceCodeUrl: undefined,
        manifestFound: false,
    });
    expect(appInfo.icon).toBeNull();
    expect(seenUrls).toEqual([
        "http://localhost:3000/manifest.toml",
        "http://localhost:3000/icon.png",
        "http://localhost:3000/icon.jpg",
    ]);
}));
test("url app info with manifest", () => __awaiter(void 0, void 0, void 0, function* () {
    const seenUrls = [];
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        seenUrls.push(url);
        if (url.endsWith("manifest.toml")) {
            return {
                ok: true,
                text: () => __awaiter(void 0, void 0, void 0, function* () { return `name = "test"`; }),
            };
        }
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    const appInfo = yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "test",
        sourceCodeUrl: undefined,
        manifestFound: true,
    });
    expect(appInfo.icon).toBeNull();
    expect(seenUrls).toEqual([
        "http://localhost:3000/manifest.toml",
        "http://localhost:3000/icon.png",
        "http://localhost:3000/icon.jpg",
    ]);
}));
test("url app info with manifest without name", () => __awaiter(void 0, void 0, void 0, function* () {
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        if (url.endsWith("manifest.toml")) {
            return {
                ok: true,
                text: () => __awaiter(void 0, void 0, void 0, function* () { return `source_code_url = "http://example.com"`; }),
            };
        }
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    const appInfo = yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "No entry in manifest.toml (running from URL)",
        sourceCodeUrl: "http://example.com",
        manifestFound: true,
    });
}));
test("url app info with broken manifest", () => __awaiter(void 0, void 0, void 0, function* () {
    const seenUrls = [];
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        seenUrls.push(url);
        if (url.endsWith("manifest.toml")) {
            return {
                ok: true,
                text: () => __awaiter(void 0, void 0, void 0, function* () { return `not valid toml`; }),
            };
        }
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    try {
        yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    }
    catch (e) {
        if (e instanceof appInfo_1.AppInfoError) {
            expect(e.message).toEqual("Invalid manifest.toml, please check the format");
        }
        else {
            throw e;
        }
    }
    expect.assertions(1);
}));
test("url app info with manifest and source code URL", () => __awaiter(void 0, void 0, void 0, function* () {
    const seenUrls = [];
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        seenUrls.push(url);
        if (url.endsWith("manifest.toml")) {
            return {
                ok: true,
                text: () => __awaiter(void 0, void 0, void 0, function* () { return `name = "test"\nsource_code_url = "http://example.com"`; }),
            };
        }
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    const appInfo = yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "test",
        sourceCodeUrl: "http://example.com",
        manifestFound: true,
    });
    expect(appInfo.icon).toBeNull();
    expect(seenUrls).toEqual([
        "http://localhost:3000/manifest.toml",
        "http://localhost:3000/icon.png",
        "http://localhost:3000/icon.jpg",
    ]);
}));
test("url app info with png icon", () => __awaiter(void 0, void 0, void 0, function* () {
    const seenUrls = [];
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        seenUrls.push(url);
        if (url.endsWith("icon.png")) {
            return {
                ok: true,
                arrayBuffer: () => __awaiter(void 0, void 0, void 0, function* () { return []; }),
            };
        }
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    const appInfo = yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "Unknown (running from URL)",
        sourceCodeUrl: undefined,
        manifestFound: false,
    });
    expect(appInfo.icon).toMatchObject({ contentType: "image/png" });
    expect(seenUrls).toEqual([
        "http://localhost:3000/manifest.toml",
        "http://localhost:3000/icon.png",
    ]);
}));
test("url app info with jpg icon", () => __awaiter(void 0, void 0, void 0, function* () {
    const seenUrls = [];
    const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
        seenUrls.push(url);
        if (url.endsWith("icon.jpg")) {
            return {
                ok: true,
                arrayBuffer: () => __awaiter(void 0, void 0, void 0, function* () { return []; }),
            };
        }
        return {
            ok: false,
        };
    });
    fetch.isRedirect = () => false;
    const location = (0, location_1.getLocation)("http://localhost:3000");
    const appInfo = yield (0, appInfo_1.getAppInfoUrl)(location, fetch);
    expect(appInfo.location).toEqual(location);
    expect(appInfo.manifest).toEqual({
        name: "Unknown (running from URL)",
        sourceCodeUrl: undefined,
        manifestFound: false,
    });
    expect(appInfo.icon).toMatchObject({ contentType: "image/jpeg" });
    expect(seenUrls).toEqual([
        "http://localhost:3000/manifest.toml",
        "http://localhost:3000/icon.png",
        "http://localhost:3000/icon.jpg",
    ]);
}));
