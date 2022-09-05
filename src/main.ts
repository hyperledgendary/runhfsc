#!/usr/bin/env node
/*
SPDX-License-Identifier: Apache-2.0
*/

import * as sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { CLI } from 'cliffy';
import Fabric from './fabric';

import prettyjson from 'prettyjson';
import * as util from 'util';
import * as path from 'path';
import { existsSync, readFileSync } from 'fs';

import * as env from 'env-var';
import { FabricConfig } from './fabricconfig';
import chalk = require('chalk');

import * as yargs from 'yargs';

import jsonata from 'jsonata';

import { logger } from './logger';

logger.debug('Starting runhfsc...');

const log = ({ msg = '>', val = '', error = false }: { msg?: string; val?: string; error?: boolean }): void => {
    if (error) {
        console.log(chalk.redBright(msg) + ' ' + val);
    } else {
        console.log(chalk.blue.bold(msg) + ' ' + val);
    }
};

const pjson = readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;

const cmdLine: any = yargs
    .help()
    .wrap(null)
    .alias('v', 'version')
    .version(`runhfsc v${version}`)
    .help()
    .strict()
    .options({
        config: {
            alias: 'c',
            describe: 'configuration file',
            type: 'string',
            default: env.get('RUNHFSC_CONFIG').asString(),
        },
    }).argv;

let configPath = cmdLine.config;

/** Two 'maps' defined, one for the configurations loaded from the file, the second
 * for instances of the Fabric class - that interfaces with the SDKs
 */
interface FabricInstance {
    [key: string]: Fabric;
}

/** Config file is a map listing a name against a configuration */
interface FabricConfigs {
    [key: string]: FabricConfig;
}

const fabrics: FabricInstance = {};
let fabricConfigs: FabricConfigs;
let current = 'default';

let cli: CLI;

console.log(
    chalk.blue.bold(`
                     __    ____         
   _______  ______  / /_  / __/_________
  / ___/ / / / __ \\/ __ \\/ /_/ ___/ ___/
 / /  / /_/ / / / / / / / __(__  ) /__  
/_/   \\__,_/_/ /_/_/ /_/_/ /____/\\___/  
`) +
        `
runhfsc ${version}
`,
);

/* Create a simple prompt */
const getPrompt = (): string => {
    const fabric = fabrics[current];
    if (!fabric) {
        return '[] > ';
    }

    const user = '';

    let channel = fabric.getChannel();
    channel = chalk.yellow(channel === '' ? '<channel>' : channel);

    let contractId = fabric.getContractId();
    contractId = chalk.yellow(contractId === '' ? '<contractid>' : contractId);

    const connected = fabric.isConnected() ? chalk.green('#') : chalk.gray('-');

    return chalk`{blue [${current}]} ${user}${channel}:${contractId} ${connected} $ `;
};

const actionWrapper = async (params: any, options: any, func: any): Promise<void> => {
    try {
        await func(params, options);
    } catch (e: any) {
        log({ val: e.message, error: true });
    }
    cli.setDelimiter(getPrompt());
};

/** Main function */
const main = async () => {
    if (!configPath) {
        log({ msg: 'No configuration file specified, assuming runhfsc.cfg in current directory' });
        configPath = path.resolve('./runhfsc.json');
        // log({ msg: 'RUNHFSC_CONFIG file location must be specified', error: true });
        // process.exit(1);
    }

    if (existsSync(configPath)) {
        log({ msg: `Reading configuration from `, val: configPath });
        fabricConfigs = JSON.parse(readFileSync(path.resolve(configPath), 'utf-8'));
    } else {
        throw new Error(`Unable to read ${configPath}`);
    }

    log({ msg: `For help type 'help'   \n ` });

    // Use the default configuration to start with
    fabrics[current] = await Fabric.newFabric('default', fabricConfigs['default']);
    cli = new CLI({ input: process.stdin }).setDelimiter(getPrompt());

    // define each command
    cli.addCommand('info', {
        description: 'Summary of the current settings',
        options: [],
        parameters: [],
        action: () => {
            if (fabrics[current]) {
                log({ val: fabrics[current].getInfo() });
            }
        },
    });

    cli.addCommand('config', {
        description: 'swap configuration',
        options: [],
        parameters: [{ label: 'configid', description: 'configuration id' }],
        action: async (params, _options) => {
            if (params.configid) {
                if (Object.keys(fabricConfigs).includes(params.configid as string)) {
                    current = params.configid;
                    fabrics[current] = await Fabric.newFabric(current, fabricConfigs[current]);
                    log({ msg: 'Configuration set to', val: current });
                } else {
                    log({ msg: `Configuration "${params.configid}" not found` });
                }
            } else {
                log({ val: JSON.stringify(fabricConfigs) });
            }
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('configs', {
        description: 'list configurations',
        options: [],
        parameters: [],
        action: async (_params, _options) => {
            log({ msg: `Available configurations from ${configPath}`, val: '\n' + prettyjson.render(fabricConfigs) });
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('quit', {
        description: 'Quit',
        options: [],
        aliases: ['q'],
        parameters: [],
        action: () => {
            Object.values(fabrics).forEach((f) => {
                f.destroy();
            });
            process.exit(0);
        },
    });

    cli.addCommand('connect', {
        description: 'Connect to Peer Endpoint with Identity',
        options: [],
        action: async (_params, _options) => {
            const response = await fabrics[current].establish();
            log({ msg: 'Connected to Fabric' + response });
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('channel', {
        description: 'Set channel',
        options: [],
        parameters: [{ label: 'channel', description: 'Channel name' }],
        action: (params, _options) => {
            fabrics[current].setChannel(params.channel);
            log({ msg: 'Channel set to', val: params.channel });
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('contract', {
        description: 'Set contract',
        options: [],
        parameters: [{ label: 'contract', description: 'contract name' }],
        action: (params, _options) => {
            fabrics[current].setContractId(params.contract);
            log({ msg: 'Contract set to', val: params.contract });
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('submit', {
        description: 'Submit transactions',
        options: [{ label: 'json', description: 'Format output data as JSON' }],
        parameters: [
            { label: 'txname', description: 'Transaction name' },
            {
                label: 'args',
                description: 'JSON format string ',
                optional: true,
            },
            {
                label: 'private',
                description: 'Private data map',
                optional: true,
            },
        ],
        action: async (params, options) => {
            if (!params.args) {
                params.args = '[]';
            }
            const args: string[] = JSON.parse(params.args);
            console.log(args);

            const txArgs = args.map((v) => JSON.stringify(v));

            log({ msg: `Submitted ${params.txname} `, val: txArgs.join(',') });

            const result = await fabrics[current].submit(params.txname, txArgs);
            if (options.json) {
                log({ val: util.inspect(JSON.parse(result), false, 6, true) });
            } else {
                log({ val: result });
            }

            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('evaluate', {
        description: 'Evaluate transactions',
        parameters: [
            { label: 'txname', description: 'Transaction name' },
            {
                label: 'args',
                description: 'JSON format string ',
                optional: true,
            },
            {
                label: 'private',
                description: 'Private data map',
                optional: true,
            },
        ],
        options: [{ label: 'json', description: 'Format output data as JSON' }],
        action: async (params, options) => {
            if (!params.args) {
                params.args = '[]';
            }
            const args: string[] = JSON.parse(params.args);
            log({ msg: `Submitted ${params.txname} `, val: args.join(',') });

            try {
                const result = await fabrics[current].evaluate(params.txname, args);
                if (options.json) {
                    log({ val: util.inspect(JSON.parse(result), false, 6, true) });
                } else {
                    log({ val: result });
                }
            } catch (e) {
                log({ val: (e as any).toString() });
            }
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('metadata', {
        description: 'Display the metadata for the current contract',
        parameters: [{ label: 'Query', description: 'Simple query string (jsonata) ', optional: true }],
        action: async (_params, _options) =>
            actionWrapper(_params, _options, async () => {
                logger.debug('Submiting for evaluate org.hyperledger.fabric:GetMetadata ');
                try {
                    const result = await fabrics[current].evaluate('org.hyperledger.fabric:GetMetadata', []);
                    let metadataJSON = JSON.parse(result);
                    if (_params['Query']) {
                        const expression = jsonata(_params['Query']);
                        metadataJSON = expression.evaluate(metadataJSON);
                    }
                    log({ val: util.inspect(metadataJSON, false, 8, true) });
                } catch (error) {
                    logger.debug(error);
                    log({ val: (error as any).toString() });
                }
                cli.setDelimiter(getPrompt());
            }),
    });
    cli.show();
};

main().catch((e: any) => {
    console.log(e);
    process.exit(1);
});
