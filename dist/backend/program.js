"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProgram = void 0;
const commander_1 = require("commander");
const run_1 = require("./run");
const appInfo_1 = require("./appInfo");
function parsePort(value) {
    const result = Number(value);
    if (isNaN(result)) {
        throw new commander_1.InvalidArgumentError("not a number");
    }
    if (result < 0 || result > 65535) {
        throw new commander_1.InvalidArgumentError("port number out of range");
    }
    return result;
}
function createProgram(inject) {
    const program = new commander_1.Command();
    program
        .name("webxdc-dev")
        .description("Tool simulate Webxdc in the browser")
        .version((0, appInfo_1.getToolVersion)());
    program
        .command("run")
        .argument("<location>", "URL with dev server, path to .xdc file, or path to webxdc dist directory")
        .option("-p, --port <port>", "start port for webxdc-dev UI, instance ports are incremented by one each", parsePort, 7000)
        .option("--no-csp", "run instances without CSP applied")
        .option("-v, --verbose", "Print all messages sent and received by instances", false)
        .description("Run webxdc-dev simulator with webxdc from dev server URL, .xdc file or dist directory")
        .action((location, options) => {
        (0, run_1.run)(location, { basePort: options.port, csp: options.csp, verbose: options.verbose }, inject);
    });
    return program;
}
exports.createProgram = createProgram;
