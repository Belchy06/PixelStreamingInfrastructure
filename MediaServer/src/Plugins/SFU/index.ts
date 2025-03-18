// Copyright

import * as OS from 'os';
import { EventEmitter } from "@epicgames-ps/lib-pixelstreamingcommon-ue5.5";
import { IPlugin, PluginRegistry } from "../../PluginRegistry"
import { ISFUConfig, ISFUListenIP, ISFURouterConfig, ISFUWebrtcTransportConfig, SFUServer } from "@epicgames-ps/lib-pixelstreamingsignalling-ue5.5";

export class PluginSFU extends EventEmitter implements IPlugin {
    ID: string;
    config: any;

    sfuServer?: SFUServer;

    constructor() {
        super();
        this.ID = "SFU";

        PluginRegistry.get().add(this);
    }

    initialize(config: any): void {
        this.config = config;

        if (config.enabled) {
            const routerOptions: ISFURouterConfig = {
                codecs: []
            };

            if (config.mediasoup && config.mediasoup.router && config.mediasoup.router.media_codecs) {
                for (const codec of config.mediasoup.router.media_codecs) {
                    routerOptions.codecs.push({
                        kind: codec.kind,
                        mimeType: codec.mime_type,
                        clockRate: codec.clock_rate,
                        channels: codec.channels ? codec.channels : undefined,
                        parameters: codec.parameters ? codec.parameters : undefined
                    });
                }
            }

            const webRtcTransportOptions: ISFUWebrtcTransportConfig = {
                listenIps: [],
                initialAvailableOutgoingBitrate: config.mediasoup.webrtc_transport.initial_available_outgoing_bitrate
            }

            let passedPublicIP: string | undefined = undefined;
            if (passedPublicIP) {
                webRtcTransportOptions.listenIps.push({ ip: "0.0.0.0", announcedIp: passedPublicIP });
            } else {
                webRtcTransportOptions.listenIps = this.getLocalListenIps();

            }

            const sfuOptions: ISFUConfig = {
                SFUId: config.sfu_id,
                subscribeStreamerId: config.subscribe_streamer_id,
                signallingURL: config.signalling_url,
                retrySubscribeDelaySecs: config.retry_subscribe_delay_secs,
                enableSVC: config.enable_svc,
                worker: {
                    rtcMinPort: config.mediasoup.worker.rtc_min_port,
                    rtcMaxPort: config.mediasoup.worker.rtc_max_port,
                    logLevel: config.mediasoup.worker.log_level,
                    logTags: config.mediasoup.worker.log_tags
                },
                router: routerOptions,
                webrtcTransport: webRtcTransportOptions
            };

            this.sfuServer = new SFUServer(sfuOptions);
        }
    }

    private getLocalListenIps() {
        const listenIps: ISFUListenIP[] = [];
        if (typeof window === 'undefined') {
            const networkInterfaces = OS.networkInterfaces()
            if (networkInterfaces) {
                for (const [key, addresses] of Object.entries(networkInterfaces)) {
                    (addresses as OS.NetworkInterfaceInfo[]).forEach(address => {
                        if (address.family === 'IPv4') {
                            listenIps.push({ ip: address.address, announcedIp: undefined })
                        }
                        /* ignore link-local and other special ipv6 addresses.
                         * https://www.iana.org/assignments/ipv6-address-space/ipv6-address-space.xhtml
                         */
                        else if (address.family === 'IPv6' && address.address[0] !== 'f') {
                            listenIps.push({ ip: address.address, announcedIp: undefined })
                        }
                    })
                }
            }
        }
        if (listenIps.length === 0) {
            listenIps.push({ ip: '127.0.0.1', announcedIp: undefined })
        }
        return listenIps
    }
}

export default new PluginSFU();