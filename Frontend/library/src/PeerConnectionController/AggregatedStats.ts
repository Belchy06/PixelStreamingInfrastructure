// Copyright Epic Games, Inc. All Rights Reserved.

import { InboundRTPStats, InboundVideoStats, InboundAudioStats } from './InboundRTPStats';
import { InboundTrackStats } from './InboundTrackStats';
import { DataChannelStats } from './DataChannelStats';
import { CandidateStat } from './CandidateStat';
import { CandidatePairStats } from './CandidatePairStats';
import { OutBoundRTPStats, OutBoundVideoStats } from './OutBoundRTPStats';
import { SessionStats } from './SessionStats';
import { StreamStats } from './StreamStats';
import { CodecStats } from './CodecStats';
import { Logger } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';

/**
 * The Aggregated Stats that is generated from the RTC Stats Report
 */

type RTCStatsTypePS = RTCStatsType | 'stream' | 'media-playout' | 'track';
export class AggregatedStats {
    inboundVideoStats: InboundVideoStats;
    inboundAudioStats: InboundAudioStats;
    candidatePairs: Array<CandidatePairStats>;
    DataChannelStats: DataChannelStats;
    localCandidates: Array<CandidateStat>;
    remoteCandidates: Array<CandidateStat>;
    outBoundVideoStats: OutBoundVideoStats;
    sessionStats: SessionStats;
    streamStats: StreamStats;
    codecs: Map<string, CodecStats>;
    transportStats: RTCTransportStats;

    constructor() {
        this.inboundVideoStats = new InboundVideoStats();
        this.inboundAudioStats = new InboundAudioStats();
        this.DataChannelStats = new DataChannelStats();
        this.outBoundVideoStats = new OutBoundVideoStats();
        this.sessionStats = new SessionStats();
        this.streamStats = new StreamStats();
        this.codecs = new Map<string, CodecStats>();
    }

    /**
     * Gather all the information from the RTC Peer Connection Report
     * @param rtcStatsReport - RTC Stats Report
     */
    processStats(rtcStatsReport: RTCStatsReport) {
        this.localCandidates = new Array<CandidateStat>();
        this.remoteCandidates = new Array<CandidateStat>();
        this.candidatePairs = new Array<CandidatePairStats>();

        rtcStatsReport.forEach((stat) => {
            const type: RTCStatsTypePS = stat.type;

            switch (type) {
                case 'candidate-pair':
                    this.handleCandidatePair(stat);
                    break;
                case 'certificate':
                    break;
                case 'codec':
                    this.handleCodec(stat);
                    break;
                case 'data-channel':
                    this.handleDataChannel(stat);
                    break;
                case 'inbound-rtp':
                    this.handleInBoundRTP(stat);
                    break;
                case 'local-candidate':
                    this.handleLocalCandidate(stat);
                    break;
                case 'media-source':
                    break;
                case 'media-playout':
                    break;
                case 'outbound-rtp':
                    break;
                case 'peer-connection':
                    break;
                case 'remote-candidate':
                    this.handleRemoteCandidate(stat);
                    break;
                case 'remote-inbound-rtp':
                    break;
                case 'remote-outbound-rtp':
                    this.handleRemoteOutBound(stat);
                    break;
                case 'track':
                    this.handleTrack(stat);
                    break;
                case 'transport':
                    this.handleTransport(stat);
                    break;
                case 'stream':
                    this.handleStream(stat);
                    break;
                default:
                    Logger.Error('unhandled Stat Type');
                    Logger.Info(stat);
                    break;
            }
        });
    }

    /**
     * Process stream stats data from webrtc
     *
     * @param stat - the stats coming in from webrtc
     */
    handleStream(stat: StreamStats) {
        this.streamStats = stat;
    }

    /**
     * Process the Ice Candidate Pair Data
     * @param stat - the stats coming in from ice candidates
     */
    handleCandidatePair(stat: CandidatePairStats) {
        // Add the candidate pair to the candidate pair array
        this.candidatePairs.push(stat);
    }

    /**
     * Process the Data Channel Data
     * @param stat - the stats coming in from the data channel
     */
    handleDataChannel(stat: DataChannelStats) {
        this.DataChannelStats.bytesReceived = stat.bytesReceived;
        this.DataChannelStats.bytesSent = stat.bytesSent;
        this.DataChannelStats.dataChannelIdentifier = stat.dataChannelIdentifier;
        this.DataChannelStats.id = stat.id;
        this.DataChannelStats.label = stat.label;
        this.DataChannelStats.messagesReceived = stat.messagesReceived;
        this.DataChannelStats.messagesSent = stat.messagesSent;
        this.DataChannelStats.protocol = stat.protocol;
        this.DataChannelStats.state = stat.state;
        this.DataChannelStats.timestamp = stat.timestamp;
    }

    /**
     * Process the Local Ice Candidate Data
     * @param stat - local stats
     */
    handleLocalCandidate(stat: CandidateStat) {
        const localCandidate = new CandidateStat();
        localCandidate.label = 'local-candidate';
        localCandidate.address = stat.address;
        localCandidate.port = stat.port;
        localCandidate.protocol = stat.protocol;
        localCandidate.candidateType = stat.candidateType;
        localCandidate.id = stat.id;
        localCandidate.relayProtocol = stat.relayProtocol;
        localCandidate.transportId = stat.transportId;
        this.localCandidates.push(localCandidate);
    }

    /**
     * Process the Remote Ice Candidate Data
     * @param stat - ice candidate stats
     */
    handleRemoteCandidate(stat: CandidateStat) {
        const RemoteCandidate = new CandidateStat();
        RemoteCandidate.label = 'remote-candidate';
        RemoteCandidate.address = stat.address;
        RemoteCandidate.port = stat.port;
        RemoteCandidate.protocol = stat.protocol;
        RemoteCandidate.id = stat.id;
        RemoteCandidate.candidateType = stat.candidateType;
        RemoteCandidate.relayProtocol = stat.relayProtocol;
        RemoteCandidate.transportId = stat.transportId;
        this.remoteCandidates.push(RemoteCandidate);
    }

    /**
     * Process the Inbound RTP Audio and Video Data
     * @param stat - inbound rtp stats
     */
    handleInBoundRTP(stat: InboundRTPStats) {
        switch (stat.kind) {
            case 'video':
                // Calculate bitrate between stat updates
                if (
                    stat.bytesReceived > this.inboundVideoStats.bytesReceived &&
                    stat.timestamp > this.inboundVideoStats.timestamp
                ) {
                    this.inboundVideoStats.bitrate =
                        (8 * (stat.bytesReceived - this.inboundVideoStats.bytesReceived)) /
                        (stat.timestamp - this.inboundVideoStats.timestamp);
                    this.inboundVideoStats.bitrate = Math.floor(this.inboundVideoStats.bitrate);
                }

                // Copy members from stat into `this.inboundVideoStats`
                for (const key in stat) {
                    (this.inboundVideoStats as any)[key] = (stat as any)[key];
                }
                break;
            case 'audio':
                if (
                    stat.bytesReceived > this.inboundAudioStats.bytesReceived &&
                    stat.timestamp > this.inboundAudioStats.timestamp
                ) {
                    this.inboundAudioStats.bitrate =
                        (8 * (stat.bytesReceived - this.inboundAudioStats.bytesReceived)) /
                        (stat.timestamp - this.inboundAudioStats.timestamp);
                    this.inboundAudioStats.bitrate = Math.floor(this.inboundAudioStats.bitrate);
                }
                // Copy members from stat into `this.inboundAudioStats`
                for (const key in stat) {
                    (this.inboundAudioStats as any)[key] = (stat as any)[key];
                }
                break;
            default:
                Logger.Error(`Kind should be audio or video, we got ${stat.kind} - that's unsupported.`);
                break;
        }
    }

    /**
     * Process the outbound RTP Audio and Video Data
     * @param stat - remote outbound stats
     */
    handleRemoteOutBound(stat: OutBoundRTPStats) {
        switch (stat.kind) {
            case 'video':
                this.outBoundVideoStats.bytesSent = stat.bytesSent;
                this.outBoundVideoStats.id = stat.id;
                this.outBoundVideoStats.localId = stat.localId;
                this.outBoundVideoStats.packetsSent = stat.packetsSent;
                this.outBoundVideoStats.remoteTimestamp = stat.remoteTimestamp;
                this.outBoundVideoStats.timestamp = stat.timestamp;
                break;
            case 'audio':
                break;

            default:
                break;
        }
    }

    /**
     * Process the Inbound Video Track Data
     * @param stat - video track stats
     */
    handleTrack(stat: InboundTrackStats) {
        // we only want to extract stats from the video track
        if (stat.type === 'track' && (stat.trackIdentifier === 'video_label' || stat.kind === 'video')) {
            this.inboundVideoStats.framesDropped = stat.framesDropped;
            this.inboundVideoStats.framesReceived = stat.framesReceived;
            this.inboundVideoStats.frameHeight = stat.frameHeight;
            this.inboundVideoStats.frameWidth = stat.frameWidth;
        }
    }

    handleTransport(stat: RTCTransportStats) {
        this.transportStats = stat;
    }

    handleCodec(stat: CodecStats) {
        const codecId = stat.id;
        this.codecs.set(codecId, stat);
    }

    handleSessionStatistics(
        videoStartTime: number,
        inputController: boolean | null,
        videoEncoderAvgQP: number
    ) {
        const deltaTime = Date.now() - videoStartTime;
        this.sessionStats.runTime = new Date(deltaTime).toISOString().substr(11, 8).toString();

        const controlsStreamInput =
            inputController === null ? 'Not sent yet' : inputController ? 'true' : 'false';
        this.sessionStats.controlsStreamInput = controlsStreamInput;

        this.sessionStats.videoEncoderAvgQP = videoEncoderAvgQP;
    }

    /**
     * Check if a value coming in from our stats is actually a number
     * @param value - the number to be checked
     */
    isNumber(value: unknown): boolean {
        return typeof value === 'number' && isFinite(value);
    }

    /**
     * Helper function to return the active candidate pair
     * @returns The candidate pair that is currently receiving data
     */
    public getActiveCandidatePair(): CandidatePairStats | null {
        // Check if the RTCTransport stat is not undefined
        if (this.transportStats) {
            // Return the candidate pair that matches the transport candidate pair id
            return this.candidatePairs.find(
                (candidatePair) => candidatePair.id === this.transportStats.selectedCandidatePairId,
                null
            );
        }

        // Fall back to the selected candidate pair
        return this.candidatePairs.find((candidatePair) => candidatePair.selected, null);
    }
}
