// Copyright

import path from 'path';
import fs from 'fs';
import express from 'express';
import { EventEmitter } from "@epicgames-ps/lib-pixelstreamingcommon-ue5.5";
import { IPlugin, PluginRegistry } from "../../PluginRegistry"
import { IWebServerConfig, WebServer, Logger } from "@epicgames-ps/lib-pixelstreamingsignalling-ue5.5";

export class PluginWebServer extends EventEmitter implements IPlugin {
    ID: string;
    config: any;

    webServer?: WebServer;

    constructor() {
        super();
        this.ID = "web_server";

        PluginRegistry.get().add(this);
    }

    initialize(config: any): void {
        this.config = config;

        if (config.enabled) {
            const app = express();
            
            const webserverOptions: IWebServerConfig = {
                httpPort: config.http_port,
                root: config.http_root,
                homepageFile: config.homepage
            };
            if (config.https) {
                webserverOptions.httpsPort = config.https_port;
                const sslKeyPath = path.join(__dirname, '..', config.ssl_key_path);
                const sslCertPath = path.join(__dirname, '..', config.ssl_cert_path);
                if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
                    Logger.info(`Reading SSL key and cert. Key path: ${sslKeyPath} | Cert path: ${sslCertPath}`);
                    webserverOptions.ssl_key = fs.readFileSync(sslKeyPath);
                    webserverOptions.ssl_cert = fs.readFileSync(sslCertPath);
                } else {
                    Logger.warn(`No SSL key/cert found. Key path: ${sslKeyPath} | Cert path: ${sslCertPath}`);
                }
                webserverOptions.https_redirect = config.https_redirect;
            }

            this.webServer = new WebServer(app, webserverOptions);
        }
    }
}

export default new PluginWebServer();