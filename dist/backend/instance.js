"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instances = void 0;
const ws_1 = require("ws");
const message_1 = require("./message");
const app_1 = require("./app");
const color_1 = require("./color");
class Instance {
    constructor(app, port, url, webXdc) {
        this.app = app;
        this.port = port;
        this.url = url;
        this.webXdc = webXdc;
        this.id = port.toString();
        this.color = (0, color_1.getColorForId)(this.id);
    }
    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`Starting webxdc instance at port ${this.port}`);
        });
    }
    close() {
        this.server.close();
    }
}
class Instances {
    constructor(appInfo, injectSim, options) {
        this._onMessage = null;
        this.location = appInfo.location;
        this.appInfo = appInfo;
        this.basePort = options.basePort;
        this.csp = options.csp;
        this.currentPort = options.basePort;
        this.instances = new Map();
        this.injectSim = injectSim;
        this.processor = (0, message_1.createProcessor)((message) => {
            if (this._onMessage == null) {
                return;
            }
            if (options.verbose) {
                console.info(message);
            }
            this._onMessage(message);
        });
    }
    add() {
        this.currentPort++;
        const port = this.currentPort;
        if (this.instances.has(port)) {
            throw new Error(`Already have Webxdc instance at port: ${port}`);
        }
        const instanceUrl = `http://localhost:${port}`;
        const wsInstance = (0, app_1.createPeer)({
            location: this.location,
            injectSim: this.injectSim,
            csp: this.csp,
            instanceUrl: instanceUrl,
        });
        const app = wsInstance.app;
        const instance = new Instance(app, port, instanceUrl, this.processor.createClient(port.toString()));
        const wss = wsInstance.getWss();
        app.ws("/webxdc", (ws, req) => {
            // when receiving an update from this peer
            ws.on("message", (msg) => {
                if (typeof msg !== "string") {
                    console.error("webxdc: Don't know how to handle unexpected non-string data");
                    return;
                }
                const parsed = JSON.parse(msg);
                // XXX should validate parsed
                if (isSendUpdateMessage(parsed)) {
                    instance.webXdc.sendUpdate(parsed.update, parsed.descr);
                }
                else if (isSetUpdateListenerMessage(parsed)) {
                    instance.webXdc.connect((updates) => {
                        return broadcast(wss, JSON.stringify({
                            type: "updates",
                            updates: updates.map(([update]) => update),
                        }));
                    }, parsed.serial, () => {
                        return broadcast(wss, JSON.stringify({ type: "clear" }));
                    }, () => {
                        return broadcast(wss, JSON.stringify({ type: "delete" }));
                    });
                }
                else if (isRequestInfoMessage(parsed)) {
                    ws.send(JSON.stringify({
                        type: "info",
                        info: {
                            name: this.appInfo.manifest.name,
                            color: instance.color,
                        },
                    }));
                }
                else {
                    throw new Error(`Unknown message: ${JSON.stringify(parsed)}`);
                }
            });
        });
        this.instances.set(port, instance);
        return instance;
    }
    delete(id) {
        let instance = this.instances.get(id);
        if (instance == null) {
            throw new Error(`Instance with id ${id} can't be deleted because it does not exist`);
        }
        instance.close();
        this.processor.removeClient(instance.id);
        this.instances.delete(id);
    }
    start() {
        for (const instance of this.instances.values()) {
            instance.start();
        }
    }
    clear() {
        this.processor.clear();
    }
    onMessage(onMessage) {
        this._onMessage = onMessage;
    }
    list() {
        return Array.from(this.instances.values()).map((instance) => ({
            id: instance.id,
            port: instance.port,
            url: instance.url,
            color: instance.color,
        }));
    }
}
exports.Instances = Instances;
function broadcast(wss, data) {
    let result = false;
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
            result = true;
        }
    });
    return result;
}
function isSendUpdateMessage(value) {
    return value.type === "sendUpdate";
}
function isSetUpdateListenerMessage(value) {
    return value.type === "setUpdateListener";
}
function isRequestInfoMessage(value) {
    return value.type === "requestInfo";
}
