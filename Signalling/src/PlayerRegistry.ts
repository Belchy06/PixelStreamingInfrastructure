import { SignallingProtocol, BaseMessage, EventEmitter, Messages, MessageHelpers } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';
import { Logger } from './Logger';
import { IMessageLogger } from './LoggingUtils';
import { IStreamer } from './StreamerRegistry';

/**
 * An interface that describes a player that can be added to the
 * player registry.
 */
export interface IPlayer extends IMessageLogger {
    playerId: string;
    protocol: SignallingProtocol;
    subscribedStreamer: IStreamer | null;

    sendMessage(message: BaseMessage): void;
    getPlayerInfo(): IPlayerInfo;
}

/**
 * Used by the API to describe the current state of the player.
 */
export interface IPlayerInfo {
    playerId: string;
    type: string;
    subscribedTo: string | undefined;
    remoteAddress: string | undefined;
}

/**
 * Handles all the player connections of a signalling server and
 * can be used to lookup connections by id etc.
 * Fires events when players are added or removed.
 * Events:
 *   'added': (playerId: string) Player was added.
 *   'removed': (playerId: string) Player was removed.
 */
export class PlayerRegistry extends EventEmitter {
    private players: IPlayer[];
    private nextPlayerId: number;

    constructor() {
        super();
        this.players = [];
        this.nextPlayerId = 0;
    }

    /**
     * Assigns a unique id to the player and adds it to the registry
     */
    add(player: IPlayer): void {
        player.playerId = this.sanitizePlayerId(player.playerId); 

        this.players.push(player);;

        player.protocol.on(Messages.endpointId.typeName, this.onEndpointId.bind(this, player));
        player.sendMessage(MessageHelpers.createMessage(Messages.identify));

        this.emit('added', player.playerId);
        
        Logger.info(`Registered new player: ${player.playerId}`);
    }

    /**
     * Removes a player from the registry. Does nothing if the id
     * does not exist.
     */
    remove(player: IPlayer): void {
        const index = this.players.indexOf(player);
        if (index == -1)
        {
            return;
        }

        this.players.splice(index, 1);
        this.emit('removed', player.playerId);

        Logger.info(`Unregistered player: ${player.playerId}`);
    }

    /**
    * Tests if a player id exists in the registry.
    */
    has(playerId: string): boolean {
        return this.get(playerId) !== undefined;
    }

    /**
     * Gets a player from the registry using the player id.
     * Returns undefined if the player doesn't exist.
     */
    get(playerId: string): IPlayer | undefined {
        return this.players.find((player) => player.playerId == playerId);
    }

    listPlayers(): IPlayer[] {
        return this.players;
    }

    /**
     * Returns true when the registry is empty.
     */
    empty(): boolean {
        return this.players.length == 0;
    }

    /**
     * Gets the total number of connected players.
     */
    count(): number {
        return this.players.length;
    }

    private getUniquePlayerId(): string {
        const newPlayerId = `Player${this.nextPlayerId}`;
        this.nextPlayerId++;
        return newPlayerId;
    }

    private onEndpointId(player: IPlayer, message: Messages.endpointId): void {
        const oldId = player.playerId;

        if(!message.id)
        {
            message.id = oldId; // If the frontend doesn't specify a custom id, just the default playerId
        }
    
        // id might conflict or be invalid so here we sanitize it
        player.playerId = this.sanitizePlayerId(message.id);
    
        Logger.debug(`PlayerRegistry: Player id change. ${oldId} -> ${player.playerId}`);
    
        // because we might have sanitized the id, we confirm the id back to the player
        player.sendMessage(
            MessageHelpers.createMessage(Messages.endpointIdConfirm, { committedId: player.playerId })
        );
    }

    private sanitizePlayerId(id: string): string {
        // create a default id if none supplied
        if (!id) {
            id = this.getUniquePlayerId();
        }

        // search for existing playerId and optionally append a numeric value
        let maxPostfix = -1;
        for (const player of this.players) {
            const idMatchRegex = /^(.*?)(\d*)$/;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const [, baseId, postfix] = player.playerId.match(idMatchRegex)!;
            // if the id is numeric then base id will be empty and we need to compare with the postfix
            if ((baseId != '' && baseId != id) || (baseId == '' && postfix != id)) {
                continue;
            }
            const numPostfix = Number(postfix);
            if (numPostfix > maxPostfix) {
                maxPostfix = numPostfix;
            }
        }
        if (maxPostfix >= 0) {
            return id + (maxPostfix + 1);
        }
        return id;
    }
}
