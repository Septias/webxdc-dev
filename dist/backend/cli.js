#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const program_1 = require("./program");
const program = (0, program_1.createProgram)({
    injectFrontend: (app) => {
        // in production we serve the static files ourselves
        // XXX annoying we're also serving dist/backend and dist/webxdc
        app.use(express_1.default.static(path_1.default.resolve(__dirname, "..")));
    },
    injectSim: (app) => {
        // in production we serve the static files from within the dist directory
        app.use(express_1.default.static(path_1.default.resolve(__dirname, "../webxdc")));
    },
    getIndexHtml: () => {
        return path_1.default.resolve(__dirname, "..", "index.html");
    },
});
program.parse();
