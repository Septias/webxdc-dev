import express, { Express } from "express";
import expressWs from "express-ws";
import { createProcessor, IProcessor } from "./message";
import { WebXdc } from "../types/webxdc-types";

export type WebXdcDescription = {
  name: string;
  path: string;
};

export type InjectExpress = (app: Express) => void;

export function createFrontend(
  instances: Instances,
  injectFrontend: InjectExpress
): Express {
  const app = express();

  // inject how to serve the frontend; this is
  // different in dev mode and in production
  injectFrontend(app);

  app.get("/instances", (req, res) => {
    res.json(
      Array.from(instances.instances.values()).map((instance) => ({
        id: instance.port,
        url: `http://localhost:${instance.port}`,
      }))
    );
  });
  app.post("/instances", (req, res) => {
    const instance = instances.add();
    instance.start();
    res.json({
      status: "ok",
    });
  });
  return app;
}

export function createPeer(
  webxdc: WebXdcDescription,
  injectSim: InjectExpress
): expressWs.Application {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);

  // layer the simulated directory with webxdc tooling in front of webxdc path
  // this has to be injected as it differs between dev and production
  injectSim(wsInstance.app as unknown as Express);
  // now serve the webxdc project itself
  wsInstance.app.use(express.static(webxdc.path));

  return wsInstance.app;
}

export class Instance {
  constructor(
    public app: expressWs.Application,
    public port: number,
    public webXdc: WebXdc
  ) {}

  start() {
    this.app.listen(this.port, () => {
      console.log(`Starting Webxdc instance at port ${this.port}`);
    });
  }
}

export class Instances {
  webXdc: WebXdcDescription;
  instances: Map<number, Instance>;
  basePort: number;
  currentPort: number;
  injectSim: InjectExpress;
  processor: IProcessor;

  constructor(
    webXdc: WebXdcDescription,
    injectSim: InjectExpress,
    basePort: number
  ) {
    this.webXdc = webXdc;
    this.basePort = basePort;
    this.currentPort = basePort;
    this.instances = new Map();
    this.injectSim = injectSim;
    this.processor = createProcessor();
  }

  add(): Instance {
    this.currentPort++;
    const port = this.currentPort;
    if (this.instances.has(port)) {
      throw new Error(`Already have Webxdc instance at port: ${port}`);
    }
    const app = createPeer(this.webXdc, this.injectSim);
    const instance = new Instance(
      app,
      port,
      this.processor.createClient(port.toString())
    );

    app.ws("/webxdc", (ws, req) => {
      // XXX we set it with 0 here and that's not correct: we should
      // somehow know what the client passed along here
      // I think this requires introducing two message types so
      // we only set up the update listener when the frontend sends
      // the request
      instance.webXdc.setUpdateListener((update) => {
        console.log("gossip", update);
        ws.send(JSON.stringify(update));
      }, 0);
      // when receiving an update from this peer
      ws.on("message", (msg: string) => {
        if (typeof msg !== "string") {
          console.error(
            "webxdc: Don't know how to handle unexpected non-string data"
          );
          return;
        }
        const parsed = JSON.parse(msg);
        // XXX should validate parsed
        const update = parsed.update;
        instance.webXdc.sendUpdate(update, "update");
      });
    });
    this.instances.set(port, instance);
    return instance;
  }
}
