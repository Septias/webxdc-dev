"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const process_1 = __importDefault(require("process"));
const open_1 = __importDefault(require("open"));
const app_1 = require("./app");
const instance_1 = require("./instance");
const location_1 = require("./location");
const appInfo_1 = require("./appInfo");
function actualRun(appInfo, options, inject) {
    const { injectFrontend, injectSim, getIndexHtml } = inject;
    const instances = new instance_1.Instances(appInfo, injectSim, options);
    const numberOfInstances = 2;
    for (let i = 0; i < numberOfInstances; i++) {
        instances.add();
    }
    const frontend = (0, app_1.createFrontend)(appInfo, instances, injectFrontend, getIndexHtml);
    frontend.listen(options.basePort, () => {
        console.log("Starting webxdc-dev frontend");
    });
    instances.start();
    (0, open_1.default)("http://localhost:" + options.basePort);
}
function run(locationStr, options, inject) {
    let location;
    try {
        location = (0, location_1.getLocation)(locationStr);
    }
    catch (e) {
        if (e instanceof location_1.LocationError) {
            console.error(e.message);
            return;
        }
        throw e;
    }
    for (const signal in ["SIGINT", "SIGTERM"]) {
        process_1.default.on(signal, () => {
            location.dispose();
        });
    }
    console.log("Starting webxdc project in:", locationStr);
    (0, appInfo_1.getAppInfo)(location)
        .then((appInfo) => {
        actualRun(appInfo, options, inject);
    })
        .catch((e) => {
        if (e instanceof appInfo_1.AppInfoError) {
            console.error(e.message);
            return;
        }
        throw e;
    });
}
exports.run = run;
