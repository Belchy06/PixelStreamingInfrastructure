import http from 'http';
import https from 'https';
import * as wslib from 'ws';
import { StreamerConnection } from './StreamerConnection';
import { PlayerConnection } from './PlayerConnection';
import { SFUConnection } from './SFUConnection';
import { Logger } from '../../Logger';
import { StreamerRegistry } from './StreamerRegistry';
import { PlayerRegistry } from './PlayerRegistry';
import { Messages, MessageHelpers, SignallingProtocol } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';
import { stringify, beautify } from '../../Utils';

export type PlayerConfig = {
} & ( 
    // Only one of these three members needs to be specified
    | { httpServer: http.Server, httpsServer?: never, playerPort?: never } // An http server to use for player connections rather than a port.
    | { httpServer?: never, httpsServer: https.Server, playerPort?: never } // An https server to use for player connections rather than a port.
    | { httpServer?: never, httpsServer?: never, playerPort: number } // The port to listen on for player connections.
)
/**
 * An interface describing the possible options to pass when creating
 * a new SignallingServer object.
 */
export interface IServerConfig {
    // The port to listen on for streamer connections.
    streamerPort: number;

    playerConfig: PlayerConfig;

    // The port to listen on for SFU connections. If not supplied SFU connections will be disabled.
    sfuPort?: number;

    // The peer configuration object to send to peers in the config message when they connect.
    peerOptions: unknown;

    // Additional websocket options for the streamer listening websocket.
    streamerWsOptions?: wslib.ServerOptions;

    // Additional websocket options for the player listening websocket.
    playerWsOptions?: wslib.ServerOptions;

    // Additional websocket options for the SFU listening websocket.
    sfuWsOptions?: wslib.ServerOptions;

    // Max number of players per streamer.
    maxSubscribers?: number;
}

export type ProtocolConfig = {
    [key: string]: any;
};

/**
 * The main signalling server object.
 * Contains a streamer and player registry and handles setting up of websockets
 * to listen for incoming connections.
 */
export class SignallingServer {
    config: IServerConfig;
    protocolConfig: ProtocolConfig;
    streamerRegistry: StreamerRegistry;
    playerRegistry: PlayerRegistry;
    startTime: Date;

    /**
     * Initializes the server object and sets up listening sockets for streamers
     * players and optionally SFU connections.
     * @param config - A collection of options for this server.
     */
    constructor(config: IServerConfig) {
        Logger.debug('Started SignallingServer with config: %s', beautify(config));

        this.config = config;
        this.streamerRegistry = new StreamerRegistry();
        this.playerRegistry = new PlayerRegistry();
        this.protocolConfig = {
            protocolVersion: SignallingProtocol.SIGNALLING_VERSION,
            peerConnectionOptions: this.config.peerOptions || {}
        };
        this.startTime = new Date();

        // Streamer connections
        const streamerServer = new wslib.WebSocketServer({
            port: config.streamerPort,
            backlog: 1,
            ...config.streamerWsOptions
        });
        streamerServer.on('connection', this.onStreamerConnected.bind(this));
        Logger.info(`Listening for streamer connections on port ${config.streamerPort}`);

        // Player connections
        const server = config.playerConfig.httpServer || config.playerConfig.httpsServer;
        const playerServer = new wslib.WebSocketServer({
            server: server,
            port: server ? undefined : config.playerConfig.playerPort,
            ...config.playerWsOptions
        });
        playerServer.on('connection', this.onPlayerConnected.bind(this));
        if (!server) {
            Logger.info(`Listening for player connections on port ${config.playerConfig.playerPort}`);
        }

        // Optional SFU connections
        if (config.sfuPort) {
            const sfuServer = new wslib.WebSocketServer({
                port: config.sfuPort,
                backlog: 1,
                ...config.sfuWsOptions
            });
            sfuServer.on('connection', this.onSFUConnected.bind(this));
            Logger.info(`Listening for SFU connections on port ${config.sfuPort}`);
        }
    }

    private onStreamerConnected(ws: wslib.WebSocket, request: http.IncomingMessage) {
        Logger.info(`New streamer connection: %s`, request.socket.remoteAddress);

        const newStreamer = new StreamerConnection(this, ws, request.socket.remoteAddress);
        newStreamer.maxSubscribers = this.config.maxSubscribers || 0;

        // add it to the registry and when the transport closes, remove it.
        this.streamerRegistry.add(newStreamer);
        newStreamer.transport.on('close', () => {
            this.streamerRegistry.remove(newStreamer);
            Logger.info(
                `Streamer %s (%s) disconnected.`,
                newStreamer.streamerId,
                request.socket.remoteAddress
            );
        });

        // because peer connection options is a general field with all optional fields
        // it doesnt play nice with mergePartial so we just add it verbatim
        const message: Messages.config = MessageHelpers.createMessage(Messages.config, this.protocolConfig);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message.peerConnectionOptions = this.protocolConfig['peerConnectionOptions'];
        newStreamer.sendMessage(message);
    }

    private onPlayerConnected(ws: wslib.WebSocket, request: http.IncomingMessage) {
        Logger.info(`New player connection: %s (%s)`, request.socket.remoteAddress, request.url);

        const newPlayer = new PlayerConnection(this, ws, request.socket.remoteAddress);

        // add it to the registry and when the transport closes, remove it
        this.playerRegistry.add(newPlayer);
        newPlayer.transport.on('close', () => {
            this.playerRegistry.remove(newPlayer);
            Logger.info(`Player %s (%s) disconnected.`, newPlayer.playerId, request.socket.remoteAddress);
        });

        // because peer connection options is a general field with all optional fields
        // it doesnt play nice with mergePartial so we just add it verbatim
        const message: Messages.config = MessageHelpers.createMessage(Messages.config, this.protocolConfig);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message.peerConnectionOptions = this.protocolConfig['peerConnectionOptions'];
        newPlayer.sendMessage(message);
    }

    private onSFUConnected(ws: wslib.WebSocket, request: http.IncomingMessage) {
        Logger.info(`New SFU connection: %s`, request.socket.remoteAddress);
        const newSFU = new SFUConnection(this, ws, request.socket.remoteAddress);

        // SFU acts as both a streamer and player
        this.streamerRegistry.add(newSFU);
        this.playerRegistry.add(newSFU);
        newSFU.transport.on('close', () => {
            this.streamerRegistry.remove(newSFU);
            this.playerRegistry.remove(newSFU);
            Logger.info(`SFU %s (%s) disconnected.`, newSFU.streamerId, request.socket.remoteAddress);
        });

        // because peer connection options is a general field with all optional fields
        // it doesnt play nice with mergePartial so we just add it verbatim
        const message: Messages.config = MessageHelpers.createMessage(Messages.config, this.protocolConfig);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message.peerConnectionOptions = this.protocolConfig['peerConnectionOptions'];
        newSFU.sendMessage(message);
    }
}
