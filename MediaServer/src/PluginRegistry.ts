import { EventEmitter } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';
import { Logger } from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.5';

/**
 * An interface that describes a plugin that can be added to the
 * plugin registry.
 */
export interface IPlugin extends EventEmitter {
    ID: string;
    config: any;

    initialize(config: any): void;
}

export class PluginRegistry extends EventEmitter {
    static #instance: PluginRegistry;

    plugins: IPlugin[];

    public static get(): PluginRegistry {
        if (!PluginRegistry.#instance) {
            PluginRegistry.#instance = new PluginRegistry();
        }

        return PluginRegistry.#instance;
    }

    private constructor() {
        super();
        this.plugins = [];
    }

    public add(plugin: IPlugin): boolean {
        if (this.find(plugin.ID)) {
            Logger.error(`PluginRegistry: Tried to register plugin ${plugin.ID}  but that plugin is already registered.`)
            return false;
        }

        Logger.info(`PluginRegistry: Registering plugin ${plugin.ID}`);
        this.plugins.push(plugin);

        return true;
    }

    public remove(plugin: IPlugin): boolean {
        const index = this.plugins.indexOf(plugin);
        if (index == -1) {
            Logger.debug(`PluginRegistry: Tried to remove plugin ${plugin.ID} but it doesn't exist`);
            return false;
        }

        this.plugins.splice(index, 1);
        return true;
    }

    public find(pluginId: string): IPlugin | undefined {
        return this.plugins.find((plugin) => plugin.ID == pluginId);
    }
}
