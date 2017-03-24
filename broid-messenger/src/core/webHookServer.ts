import * as Promise from "bluebird";
import * as bodyParser from "body-parser";
import { Logger } from "broid-utils";
import * as express from "express";
import * as http from "http";

import { IAdapterHTTPOptions } from "./interfaces";

export default class WebHookServer {
  private express: express.Application;
  private logger: Logger;
  private tokenSecret: string;
  private httpClient: http.Server;  
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(tokenSecret: string, options: IAdapterHTTPOptions, router: express.Router, logLevel?: string) {
    this.host = options && options.host || "127.0.0.1";
    this.port = options && options.port || 8080;
    this.tokenSecret = tokenSecret || "";
    this.logger = new Logger("webhook_server", logLevel || "info");
    this.setupExpress(router);
  }

  public listen() {
    this.httpClient = this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
    });
  }

  public close(): Promise<null> {
    return Promise.fromCallback((cb) => this.httpClient.close(cb));
  }

  private setupExpress(router: express.Router) {
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use("/", router);
  }
}
