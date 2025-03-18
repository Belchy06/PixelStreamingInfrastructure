import { Messages } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';
import { Logger } from '../../Logger';
import { beautify } from '../../Utils';
import * as mediasoup from 'mediasoup';
import * as wslib from 'ws';
import * as mediasoupSdp from '@epicgames-ps/mediasoup-sdp-bridge';

export interface ISFUWorkerConfig {
    rtcMinPort: number;
    rtcMaxPort: number;
    logLevel: string;
    logTags: string[];
};

export interface ISFUListenIP {
    ip: string;
    announcedIp: string | undefined;
};

export interface ISFUWebrtcTransportConfig {
    listenIps: ISFUListenIP[];
    initialAvailableOutgoingBitrate: number;
};

export interface ISFUCodecConfig {
    kind: string;
    mimeType: string;
    clockRate: number;
    channels?: number;
    parameters?: Record<string, string>;
};

export interface ISFURouterConfig {
    codecs: ISFUCodecConfig[];
};

export interface ISFUConfig {
    SFUId: string;
    subscribeStreamerId?: string;
    signallingURL: string;
    retrySubscribeDelaySecs: number;
    enableSVC: boolean;
    worker: ISFUWorkerConfig;
    router: ISFURouterConfig;
    webrtcTransport: ISFUWebrtcTransportConfig;
};

class SFUStreamer {
    transport: mediasoup.types.WebRtcTransport;
    producers: mediasoup.types.Producer[];
    dataEnabled: boolean;
    multiplexChannels: boolean;

    constructor(transport: mediasoup.types.WebRtcTransport, producers: mediasoup.types.Producer[], dataEnabled: boolean, multiplexChannels: boolean) {
        this.transport = transport;
        this.producers = producers;
        this.dataEnabled = dataEnabled;
        this.multiplexChannels = multiplexChannels;
    }

    getNextSctpStreamId() {
        // TODO (william.belcher): getNextSctpStreamId is private so this works around that
        return (<any>this.transport).getNextSctpStreamId();
    }
}

class SFUDataRouter {
    MULTIPLEX_MESSAGE_ID = 199; // ID | 2 byte length | PlayerId | Original message
    CHANNEL_RELAY_STATUS_MESSAGE_ID = 198; // ID | 2 byte length | PlayerId | 1 byte flag

    transport: mediasoup.types.DirectTransport | undefined;
    producers: Record<string, mediasoup.types.DataProducer>;
    streamerProducer: mediasoup.types.DataProducer | undefined;

    constructor(mediasoupRouter: mediasoup.types.Router) {
        if (!mediasoupRouter) {
            console.error('cannot initialize direct transport, router is undefined');
            throw new Error('mediasoupRouter is undefined');
        }

        mediasoupRouter.createDirectTransport({ maxMessageSize: 262144 }).then((transport) => {
            this.transport = transport;
        });

        this.producers = {};
    }

    createMultiplexHeader(playerId: string) {
        const byteLength = 1 + 2 + playerId.length * 2;
        const buffer = Buffer.alloc(byteLength);
        let byteOffset = 0;
        buffer.writeUInt8(this.MULTIPLEX_MESSAGE_ID, byteOffset);
        byteOffset++;
        buffer.writeUInt16LE(playerId.length * 2, byteOffset);
        byteOffset += 2;
        for (let i = 0; i < playerId.length; i++) {
            buffer.writeUInt16LE(playerId.charCodeAt(i), byteOffset);
            byteOffset += 2;
        }
        return buffer;
    }

    parseMultiplexHeader(message: Buffer) {
        const type = message.readUInt8(0);
        if (type !== this.MULTIPLEX_MESSAGE_ID) {
            console.log("Received non multiplexed message type [%d]", type);
            return {
                playerId: ""
            };
        }
        const length = message.readUint16LE(1);
        const headerEnd = length + 3;
        return {
            playerId: new TextDecoder("utf-16").decode(message.subarray(3, headerEnd)),
            buffer: message.subarray(headerEnd, message.length)
        }
    }

    createRelayStatusMessage(playerId: string, status: boolean) {
        const byteLength = 1 + 2 + playerId.length * 2 + 1;
        const buffer = Buffer.alloc(byteLength);
        let byteOffset = 0;
        buffer.writeUInt8(this.CHANNEL_RELAY_STATUS_MESSAGE_ID, byteOffset);
        byteOffset++;
        buffer.writeUInt16LE(playerId.length * 2, byteOffset);
        byteOffset += 2;
        for (let i = 0; i < playerId.length; i++) {
            buffer.writeUInt16LE(playerId.charCodeAt(i), byteOffset);
            byteOffset += 2;
        }
        buffer.writeUInt8(Number(status), byteOffset);
        return buffer;
    }

    async handleStreamer(dataProducer: mediasoup.types.DataProducer) {
        const consumer = await this.transport!.consumeData({ dataProducerId: dataProducer.id });
        consumer?.on('message', (message, ppid) => {
            const relayMessage = this.parseMultiplexHeader(message);
            if (relayMessage.playerId !== "" && this.producers.hasOwnProperty(relayMessage.playerId)) {
                this.producers[relayMessage.playerId].send(relayMessage.buffer!, 53);
            }
        });

        dataProducer.on('@close', () => {
            this.streamerProducer?.close();
            this.streamerProducer = undefined;
        });

        this.streamerProducer = await this.transport!.produceData({ label: 'streamer-producer' });
        return this.streamerProducer?.id;
    }

    async handlePlayer(dataProducer: mediasoup.types.DataProducer, playerId: string) {
        this.streamerProducer?.send(this.createRelayStatusMessage(playerId, true), 53);

        const consumer = await this.transport?.consumeData({ dataProducerId: dataProducer.id });
        consumer?.on('message', (message, ppid) => {
            if (this.streamerProducer) {
                const relayMessage = Buffer.concat([this.createMultiplexHeader(playerId), message]);
                this.streamerProducer.send(relayMessage, 53);
            }
        });
        const playerProducer = await this.transport?.produceData({ label: 'player-producer' });
        this.producers[playerId] = playerProducer!;

        dataProducer.on('@close', () => {
            this.producers[playerId].close();
            delete this.producers[playerId];
            this.streamerProducer?.send(this.createRelayStatusMessage(playerId, false), 53);
        });

        return playerProducer!.id;
    }
};

export class SFUServer {
    config: ISFUConfig;

    mediasoupRouter: mediasoup.types.Router | undefined = undefined;
    dataRouter: SFUDataRouter | undefined = undefined;

    signallingConnection: wslib.WebSocket | undefined = undefined;

    streamer: SFUStreamer | undefined = undefined;

    scalabilityMode: string = "L1T1";

    constructor(config: ISFUConfig) {
        Logger.debug('SFU: Started Mediasoup SFU with config: %s', beautify(config));

        this.config = config;

        this.startMediasoup();
    }

    private startMediasoup() {
        mediasoup.createWorker({
            logLevel: this.config.worker.logLevel as mediasoup.types.WorkerLogLevel,
            logTags: this.config.worker.logTags as mediasoup.types.WorkerLogTag[],
            rtcMinPort: this.config.worker.rtcMinPort,
            rtcMaxPort: this.config.worker.rtcMaxPort,
        }).then((worker) => {
            worker.on('died', () => {
                Logger.error('SFU: mediasoup worker died (this should never happen)');
                process.exit(1);
            });

            let mediaCodecs = this.config.router.codecs as mediasoup.types.RtpCodecCapability[];
            worker.createRouter({ mediaCodecs }).then((router) => {
                this.mediasoupRouter = router;
            }).then(() => {
                this.dataRouter = new SFUDataRouter(this.mediasoupRouter!);
            }).then(() => {
                this.connect();
            });
        });
    }

    private connect() {
        Logger.debug(`SFU: Connecting to signalling server at ${this.config.signallingURL}`);

        this.signallingConnection = new wslib.WebSocket(this.config.signallingURL);

        this.signallingConnection.addEventListener('open', this.onSignallingConnectionOpen.bind(this));
        this.signallingConnection.addEventListener('error', this.onSignallingConnectionError.bind(this));
        this.signallingConnection.addEventListener('message', this.onSignallingConnectionMessage.bind(this));
        this.signallingConnection.addEventListener('close', this.onSignallingConnectionClose.bind(this));
    }
    private onSignallingConnectionOpen(event: wslib.Event) {
        Logger.info(`SFU: Connected to signalling server`);
    }

    private onSignallingConnectionError(event: wslib.ErrorEvent) {
        Logger.error(`SFU: Signalling server connection error: ${event.message}`);
    }

    private onSignallingConnectionMessage(event: wslib.MessageEvent) {
        const msg = JSON.parse(event.data as string);
        Logger.info(`SFU: ${beautify(msg)}`);

        if (msg.type == Messages.identify.typeName) {
            this.onIdentify();
        } else if (msg.type === Messages.endpointIdConfirm.typeName) {
            this.onEndpointIdConfirm();
        } else if (msg.type === Messages.streamerList.typeName) {
            this.onStreamerList(msg);
        }
        else if (msg.type === Messages.offer.typeName) {
            this.onOffer(msg);
        }
    }

    private onSignallingConnectionClose(event: wslib.CloseEvent) {
        this.onStreamerDisconnected();
        Logger.info(`SFU: Disconnected from signalling server: ${event.code} ${event.reason}`);
        Logger.info("SFU: Attempting reconnect to signalling server...");
        setTimeout(() => {
            this.connect();
        }, 2000);
    }

    private onStreamerDisconnected() {
        Logger.info("SFU: Streamer disconnected!");
    }

    private onIdentify() {
        this.signallingConnection?.send(JSON.stringify({ type: Messages.endpointId.typeName, id: this.config.SFUId }));
    }

    private onEndpointIdConfirm() {
        this.signallingConnection?.send(JSON.stringify({ type: Messages.listStreamers.typeName }));
    }

    private onStreamerList(msg: any) {
        let success = false;

        // If we're reconnecting, this SFU id will be in the streamer list. We want to remove it 
        // as we don't want to subscribe to ourself
        const index = msg.ids.indexOf(this.config.SFUId);
        if (index > -1) {
            msg.ids.splice(index, 1);
        }

        // subscribe to either the configured streamer, or if not configured, just grab the first id
        if (msg.ids.length > 0) {
            if (!!this.config.subscribeStreamerId && this.config.subscribeStreamerId.length != 0) {
                if (msg.ids.includes(this.config.subscribeStreamerId)) {
                    this.signallingConnection?.send(JSON.stringify({ type: Messages.subscribe.typeName, streamerId: this.config.subscribeStreamerId }));
                    success = true;
                }
            } else {
                this.signallingConnection?.send(JSON.stringify({ type: Messages.subscribe.typeName, streamerId: msg.ids[0] }));
                success = true;
            }
        }

        if (!success) {
            // did not subscribe to anything
            setTimeout(() => {
                this.signallingConnection?.send(JSON.stringify({ type: Messages.listStreamers.typeName }));
            }, this.config.retrySubscribeDelaySecs * 1000);
        }
    }

    private onOffer(msg: any) {
        Logger.info("Received offer from streamer");

        if (this.streamer != null) {
            this.signallingConnection?.close(1013 /* Try again later */, 'Producer is already connected');
            return;
        }

        if (msg.scalabilityMode) {
            this.scalabilityMode = msg.scalabilityMode;
        }

        this.createWebRtcTransport("Streamer").then((transport) => {
            const sdpEndpoint = mediasoupSdp.createSdpEndpoint(transport!, this.mediasoupRouter!.rtpCapabilities);
            sdpEndpoint.processOffer(msg.sdp, this.scalabilityMode).then(({ producers, dataEnabled }) => {
                const multiplex = msg.multiplex;
                const sdpAnswer = sdpEndpoint.createAnswer();
                const answer = { type: Messages.answer.typeName, sdp: sdpAnswer };

                Logger.info("SFU: Sending answer to streamer.");
                this.signallingConnection?.send(JSON.stringify(answer));
                this.streamer = new SFUStreamer(transport!, producers, dataEnabled, multiplex);
            });
        });
    }

    private async createWebRtcTransport(identifier: string) {
        const {
            listenIps,
            initialAvailableOutgoingBitrate
        } = this.config.webrtcTransport;

        const transport = await this.mediasoupRouter?.createWebRtcTransport({
            listenIps: listenIps,
            enableUdp: true,
            enableTcp: false,
            preferUdp: true,
            enableSctp: true, // datachannels
            initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate
        });

        transport?.on("icestatechange", (iceState) => this.onICEStateChange(identifier, iceState));
        transport?.on("iceselectedtuplechange", (iceTuple) => { Logger.info(`SFU: ${identifier} ICE selected tuple ${JSON.stringify(iceTuple)}`); });
        transport?.on("sctpstatechange", (sctpState) => { Logger.info(`SFU: ${identifier} SCTP state changed to ${sctpState}`); });

        return transport;
    }

    private async onICEStateChange(identifier: string, iceState: mediasoup.types.IceState) {
        Logger.info("%s ICE state changed to %s", identifier, iceState);

        if (identifier == 'Streamer' && iceState == 'completed') {
            if (this.streamer?.multiplexChannels) {
                const nextStreamerSCTPStreamId = this.streamer?.getNextSctpStreamId();
                //this will always be 0 since we are using one producer only
                Logger.info(`SFU: Attempting streamer SCTP id=${nextStreamerSCTPStreamId}`);

                const producer = await this.streamer.transport.produceData({
                    label: 'send-datachannel',
                    sctpStreamParameters: { streamId: nextStreamerSCTPStreamId, ordered: true }
                });
                (<any>this.streamer.transport)._sctpStreamIds[nextStreamerSCTPStreamId] = 1;
                const dataProducerId = await this.dataRouter!.handleStreamer(producer);
                const streamerDataConsumer = await this.streamer.transport.consumeData({ dataProducerId });
                Logger.info(`SFU: Setting up sctp for the streamer, producer sctp id ${producer.sctpStreamParameters!.streamId}, consumer sctp id ${streamerDataConsumer.sctpStreamParameters!.streamId}`);
            }

            // TODO (william.belcher): Is this required?!?
            this.signallingConnection?.send(JSON.stringify({ type: Messages.startStreaming.typeName }));
        }
    }
}