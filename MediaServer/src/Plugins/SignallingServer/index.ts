import { EventEmitter } from "@epicgames-ps/lib-pixelstreamingcommon-ue5.5";
import { IPlugin, PluginRegistry } from "../../PluginRegistry"
import { IServerConfig, SignallingServer } from "@epicgames-ps/lib-pixelstreamingsignalling-ue5.5";
import { PluginWebServer } from "../WebServer";
import { initialize } from 'express-openapi';
import express from 'express';

export class PluginSignallingServer extends EventEmitter implements IPlugin {
    ID: string;
    config: any;

    signallingServer?: SignallingServer;

    constructor() {
        super();
        this.ID = "signalling_server";

        PluginRegistry.get().add(this);
    }

    initialize(config: any): void {
        this.config = config;
        
        if (config.enabled) {
            const app = express();

            const WebServerPlugin = PluginRegistry.get().find("web_server") as PluginWebServer;
            const signallingServerOpts: IServerConfig = {
                streamerPort: config.streamer_port,
                peerOptions: config.peer_options,
                sfuPort: config.sfu_port,
                maxSubscribers: config.max_players,
                playerConfig: (WebServerPlugin && WebServerPlugin.webServer) ? (
                    (!WebServerPlugin.config.https || WebServerPlugin.config.https_redirect) ? 
                        { httpServer: WebServerPlugin.webServer.httpServer! } : 
                        { httpsServer: WebServerPlugin.webServer.httpsServer! }) : 
                    { playerPort: config.player_port }
            };

            this.signallingServer = new SignallingServer(signallingServerOpts);

            if (config.rest_api) {
                void initialize({
                    app,
                    docsPath: '/api-definition',
                    exposeApiDocs: true,
                    apiDoc: './apidoc/api-definition-base.yml',
                    paths: './dist/paths',
                    dependencies: {
                        signallingServer: this.signallingServer
                    }
                });
            }
        }
    }
}

export default new PluginSignallingServer();