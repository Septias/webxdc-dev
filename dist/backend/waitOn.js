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
exports.waitOnUrl = void 0;
const wait_on_1 = __importDefault(require("wait-on"));
function waitOnUrl(url, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, wait_on_1.default)({
            // we don't want to do a HEAD check, just a GET check
            resources: [url.replace("http:", "http-get:")],
            // workaround https://github.com/jeffbski/wait-on/issues/78#issuecomment-867813529
            headers: {
                accept: "text/html",
            },
            timeout,
        });
    });
}
exports.waitOnUrl = waitOnUrl;
