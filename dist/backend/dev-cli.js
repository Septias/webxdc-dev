"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const webpack_1 = __importDefault(require("webpack"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const program_1 = require("./program");
const webpack_dev_js_1 = __importDefault(require("../webpack.dev.js"));
const compiler = (0, webpack_1.default)(webpack_dev_js_1.default);
const program = (0, program_1.createProgram)({
    injectFrontend: (app) => {
        // in dev mode the webpack-dev-middleware serves the files for us
        // so they are automatically rebuilt
        // we do want to write to disk as the instances requires the webxdc.js
        // simulator
        app.use((0, webpack_dev_middleware_1.default)(compiler, { writeToDisk: true }));
    },
    injectSim: (app) => {
        // in dev mode we serve the files from the dist directory
        app.use(express_1.default.static(path_1.default.resolve(__dirname, "../dist/webxdc")));
    },
    getIndexHtml: () => {
        return path_1.default.resolve(__dirname, "../dist/index.html");
    },
});
program.parse();
