"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcessor = void 0;
const color_1 = require("./color");
class Client {
    constructor(processor, id) {
        this.processor = processor;
        this.id = id;
        this.updateListener = null;
        this.clearListener = null;
        this.updateSerial = null;
        this.deleteListener = null;
    }
    sendUpdate(update, descr) {
        this.processor.distribute(this.id, update, descr);
    }
    connect(listener, serial, clearListener = () => true, deleteListener = () => true) {
        this.processor.onMessage({
            type: "connect",
            instanceId: this.id,
            instanceColor: (0, color_1.getColorForId)(this.id),
            timestamp: Date.now(),
        });
        this.setClearListener(() => {
            const hasReceived = clearListener();
            if (hasReceived) {
                this.processor.onMessage({
                    type: "clear",
                    instanceId: this.id,
                    instanceColor: (0, color_1.getColorForId)(this.id),
                    timestamp: Date.now(),
                });
            }
            return hasReceived;
        });
        const updateListener = (updates) => {
            const hasReceived = listener(updates);
            if (hasReceived) {
                for (const [update, descr] of updates) {
                    this.processor.onMessage({
                        type: "received",
                        update: update,
                        instanceId: this.id,
                        instanceColor: (0, color_1.getColorForId)(this.id),
                        timestamp: Date.now(),
                        descr,
                    });
                }
            }
            return hasReceived;
        };
        this.deleteListener = deleteListener;
        this.updateListener = updateListener;
        this.updateSerial = serial;
        this.processor.catchUp(updateListener, serial);
    }
    setClearListener(listener) {
        this.clearListener = listener;
        this.clear();
    }
    receiveUpdate(update, descr) {
        if (this.updateListener == null || this.updateSerial == null) {
            return;
        }
        // don't send the update if it's not required
        if (update.serial <= this.updateSerial) {
            return;
        }
        this.updateListener([[update, descr]]);
    }
    clear() {
        if (this.clearListener == null ||
            this.processor.clearInstanceIds.has(this.id)) {
            return;
        }
        this.clearListener();
        this.processor.clearInstanceIds.add(this.id);
    }
    // sends a message to the all clients to shut down
    delete() {
        if (this.deleteListener == null) {
            return;
        }
        this.deleteListener();
    }
}
class Processor {
    constructor(onMessage) {
        this.onMessage = onMessage;
        this.clients = [];
        this.currentSerial = 0;
        this.updates = [];
        this.clearInstanceIds = new Set();
    }
    createClient(id) {
        const client = new Client(this, id);
        this.clients.push(client);
        return client;
    }
    removeClient(id) {
        let client_index = this.clients.findIndex((client) => client.id == id);
        this.clients[client_index].delete();
        this.clients.splice(client_index, 1);
    }
    distribute(instanceId, update, descr) {
        this.currentSerial++;
        const receivedUpdate = Object.assign(Object.assign({}, update), { serial: this.currentSerial, max_serial: this.updates.length + 1 });
        this.updates.push([receivedUpdate, descr]);
        this.onMessage({
            type: "sent",
            instanceId: instanceId,
            instanceColor: (0, color_1.getColorForId)(instanceId),
            update: receivedUpdate,
            timestamp: Date.now(),
            descr,
        });
        for (const client of this.clients) {
            client.receiveUpdate(receivedUpdate, descr);
        }
    }
    clear() {
        this.clearInstanceIds = new Set();
        for (const client of this.clients) {
            client.clear();
        }
        this.updates = [];
        this.currentSerial = 0;
    }
    catchUp(updateListener, serial) {
        const maxSerial = this.updates.length;
        updateListener(this.updates
            .slice(serial)
            .map(([update, descr]) => [Object.assign(Object.assign({}, update), { max_serial: maxSerial }), descr]));
    }
}
function createProcessor(onMessage = () => { }) {
    return new Processor(onMessage);
}
exports.createProcessor = createProcessor;
