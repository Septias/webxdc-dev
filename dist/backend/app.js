"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPeer = exports.createFrontend = void 0;
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const body_parser_1 = __importDefault(require("body-parser"));
const SIMULATOR_PATHS = ["/webxdc.js", "/webxdc", "/webxdc/.websocket"];
const CONTENT_SECURITY_POLICY = `default-src 'self';\
style-src 'self' 'unsafe-inline' blob: ;\
font-src 'self' data: blob: ;\
script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ;\
img-src 'self' data: blob: ;`;
function createFrontend(appInfo, instances, injectFrontend, getIndexHtml) {
    const expressApp = (0, express_1.default)();
    const wsInstance = (0, express_ws_1.default)(expressApp);
    const app = wsInstance.app;
    // inject how to serve the frontend; this is
    // different in dev mode and in production
    injectFrontend(app);
    app.use(body_parser_1.default.json());
    app.get("/app-info", (req, res) => {
        res.json({
            name: appInfo.manifest.name,
            iconUrl: appInfo.icon ? "/icon" : null,
            sourceCodeUrl: appInfo.manifest.sourceCodeUrl,
            manifestFound: appInfo.manifest.manifestFound,
            toolVersion: appInfo.toolVersion,
        });
    });
    app.get("/icon", (req, res) => {
        if (appInfo.icon == null) {
            res.sendStatus(404);
            return;
        }
        res.send(appInfo.icon.buffer);
    });
    app.get("/instances", (req, res) => {
        res.json(instances.list());
    });
    app.post("/instances", (req, res) => {
        const instance = instances.add();
        instance.start();
        res.json({
            id: instance.id,
            port: instance.port,
            url: instance.url,
            color: instance.color,
        });
    });
    app.delete("/instances/:id", (req, res) => {
        instances.delete(parseInt(req.params.id));
        res.json(instances.list());
    });
    app.post("/clear", (req, res) => {
        instances.clear();
        res.json({
            status: "ok",
        });
    });
    app.post("/fake-update", (req, res) => {
        const instanceId = Array.from(instances.instances.keys())[0];
        const instance = instances.instances.get(instanceId);
        instance === null || instance === void 0 ? void 0 : instance.webXdc.sendUpdate({ payload: req.body }, "fake update");
        res.json({
            status: "ok",
        });
    });
    app.ws("/webxdc-message", (ws, req) => {
        instances.onMessage((message) => {
            ws.send(JSON.stringify(message));
        });
    });
    // fallback to send index.html to serve frontend router
    app.get("*", (req, res) => {
        res.sendFile(getIndexHtml());
    });
    return app;
}
exports.createFrontend = createFrontend;
function createPeer(options) {
    const expressApp = (0, express_1.default)();
    const wsInstance = (0, express_ws_1.default)(expressApp);
    // layer the simulated directory with webxdc tooling in front of webxdc path
    // this has to be injected as it differs between dev and production
    options.injectSim(wsInstance.app);
    const location = options.location;
    if (options.csp) {
        wsInstance.app.use((req, res, next) => {
            const contentSecurityPolicy = getContentSecurityPolicy(location, options.instanceUrl);
            res.setHeader("Content-Security-Policy", contentSecurityPolicy);
            next();
        });
    }
    if (location.type === "url") {
        // serve webxdc project from URL by proxying
        const filter = (pathname) => {
            // make sure we don't proxy any path to do with the simulator
            return !SIMULATOR_PATHS.includes(pathname);
        };
        wsInstance.app.use("/", (0, http_proxy_middleware_1.createProxyMiddleware)(filter, {
            target: location.url,
            ws: false,
        }));
    }
    else {
        // serve webxdc project from directory
        wsInstance.app.use(express_1.default.static(location.path));
    }
    return wsInstance;
}
exports.createPeer = createPeer;
function getContentSecurityPolicy(location, instanceUrl) {
    const connectSrcUrls = [];
    // Safari/webkit at least up to version 15.5 has a bug that makes
    // "connect-src 'self'" incorrectly not allow access for web sockets
    // https://github.com/w3c/webappsec-csp/issues/7
    // we work around it by explicitly adding the instance URL to connect-src
    // When this has been fixed in Safara, this line can be removed
    connectSrcUrls.push(wsUrl(instanceUrl));
    if (location.type === "url") {
        // allow connection to websockets on proxied host, so that we
        // support HMR with systems like vite
        connectSrcUrls.push(wsUrl(location.url));
    }
    let policy = CONTENT_SECURITY_POLICY;
    if (connectSrcUrls.length === 0) {
        return policy;
    }
    return policy + `connect-src ${connectSrcUrls.join(" ")} ;`;
}
function wsUrl(httpUrl) {
    return httpUrl.replace("http://", "ws://");
}
