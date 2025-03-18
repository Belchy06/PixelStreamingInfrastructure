import fs from 'fs';
import path from 'path';
import {
    InitLogging,
    Logger,
} from '@epicgames-ps/lib-pixelstreamingsignalling-ue5.5';
import { beautify, IProgramOptions } from './Utils';
import { Command, Option } from 'commander';
import { PluginRegistry } from './PluginRegistry';
// Use require so the plugin is constructed in the export and self registered
require('./Plugins/SFU');
require('./Plugins/SignallingServer');
require('./Plugins/WebServer');

// eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
const pjson = require('../package.json');

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
// possible config file options
let config_file: IProgramOptions = {};
const configArgsParser = new Command()
    .option('--no_config', 'Skips the reading of the config file. Only CLI options will be used.', false)
    .option(
        '--config_file <path>',
        'Sets the path of the config file.',
        `${path.resolve(__dirname, '..', 'config.json')}`
    )
    .helpOption(false)
    .allowUnknownOption() // ignore unknown options as we are doing a minimal parse here
    .parse()
    .opts();
// If we do not get passed `--no_config` then attempt open the config file
if (!configArgsParser.no_config) {
    try {
        if (fs.existsSync(configArgsParser.config_file)) {
            Logger.info(`Config file configured as: ${configArgsParser.config_file}`);
            const configData = fs.readFileSync(configArgsParser.config_file, { encoding: 'utf8' });
            config_file = JSON.parse(configData);
        } else {
            // Even though proper logging is not intialized, logging here is better than nothing.
            Logger.info(`No config file found at: ${configArgsParser.config_file}`);
        }
    } catch (error: unknown) {
        Logger.error(error);
    }
}

// Ensure the config file has the correct minimum required structure
if (config_file) {
    if (!config_file.plugins) {
        config_file.plugins = {};
    }

    if (!config_file.plugins.signalling_server) {
        config_file.plugins.signalling_server = {
            enabled: false
        }
    }

    if (!config_file.plugins.web_server) {
        config_file.plugins.web_server = {
            enabled: false
        }
    }

    if (!config_file.plugins.SFU) {
        config_file.plugins.SFU = {
            enabled: false
        }
    }
}

const program = new Command();
program
    .name('node dist/index.js')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .description(pjson.description)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .version(pjson.version);

// For any switch that doesn't take an argument, like --serve, its important to give it a default value.
// Without the default, not supplying the default will mean the option is `undefined` in
// `cli_option`s` and loading from the configuration file will not work as intended.
// The way the configuration file works is that if it is found it will parsed for key/values that match
// the argument names specified below. If one is found it will become the new default value for that option.
// This allow the user to have values in the configuration file but also override them by specifying an argument on the command line.
program
    .option('--log_folder <path>', 'Sets the path for the log files.', config_file.log_folder || 'logs')
    .addOption(
        new Option('--log_level_console <level>', 'Sets the logging level for console messages.')
            .choices(['debug', 'info', 'warning', 'error'])
            .default(config_file.log_level_console || 'info')
    )
    .addOption(
        new Option('--log_level_file <level>', 'Sets the logging level for log files.')
            .choices(['debug', 'info', 'warning', 'error'])
            .default(config_file.log_level_file || 'info')
    )
    .addOption(
        new Option(
            '--console_messages [detail]',
            'Displays incoming and outgoing signalling messages on the console.'
        )
            .choices(['basic', 'verbose', 'formatted'])
            .preset(config_file.console_messages || 'basic')
    )
    .helpOption('-h, --help', 'Display this help text.')
    .allowUnknownOption() // ignore unknown options which will allow versions to be swapped out into existing scripts with maybe older/newer options
    .parse();

// parsed command line options
const cli_options: IProgramOptions = program.opts();
const options: IProgramOptions = { ...cli_options, ...config_file };

// save out new configuration (unless disabled)
if (options.save) {
    // dont save certain options
    const save_options = { ...options };
    delete save_options.no_config;
    delete save_options.config_file;
    delete save_options.save;

    // save out the config file with the current settings
    fs.writeFile(configArgsParser.config_file, beautify(save_options), (error: any) => {
        if (error) throw error;
    });
}

InitLogging({
    logDir: options.log_folder,
    logMessagesToConsole: options.console_messages,
    logLevelConsole: options.log_level_console,
    logLevelFile: options.log_level_file
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
Logger.info(`${pjson.name} v${pjson.version} starting...`);
if (options.log_config) {
    Logger.info('Config:');
    for (const key in options) {
        Logger.info(`"${key}": "${beautify(options[key])}"`);
    }
}

function initializePlugin(pluginId: string, config: any) {
    const plugin = PluginRegistry.get().find('web_server');
    if (!plugin) {
        Logger.error(`Unable to find web_server plugin. Is it registered?`);
        return;
    }
    plugin.initialize(config);
}

// The existing plugins must be loaded in this order regardless of the order they appear in the 
// config json
if (options.plugins.web_server) {
    initializePlugin('web_server', options.plugins.web_server);
    delete options.plugins.web_server;
}

if (options.plugins.signalling_server) {
    initializePlugin('signalling_server', options.plugins.signalling_server);
    delete options.plugins.signalling_server;
}

if (options.plugins.SFU) {
    initializePlugin('SFU', options.plugins.SFU);
    delete options.plugins.SFU;
}

// Load remaining plugins
for (const [key, value] of Object.entries(options.plugins)) {
    initializePlugin(key, value);
}


// if (options.stdin) {
//     // initInputHandler(options, signallingServer!);
// }

