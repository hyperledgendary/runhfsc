#!/usr/bin/env node
/*
SPDX-License-Identifier: Apache-2.0
*/
import { CLI } from 'cliffy';
import Fabric from './fabric';
import yargs = require('yargs');
import * as chalk from 'chalk';
import * as util from 'util';
import * as path from 'path';
import { readFileSync } from 'fs';

const pjson = readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8');
const version = JSON.parse(pjson).version;

const params = yargs
    .options({
        gateway: {
            type: 'string',
            description: 'Gateway profile file',
            requiresArg: true,
            required: 'true',
        },
        wallet: {
            type: 'string',
            description: 'wallet directory path',
            requiresArg: true,
            required: 'true',
        },
        user: {
            alias: 'u',
            description: 'User wallet label',
            requiresArg: true,
            default: '',
            require: false,
        },
    })
    .help()
    .wrap(null)
    .alias('v', 'version')
    .version(`ibpccl v${version}`)
    .usage('$0 --file filename')
    .help()
    .strict()
    .epilog('For usage see https://github.com/hyperledendary/runhfsc')
    .describe('v', 'show version information').argv;

interface FabricInstance {
    [key: string]: Fabric;
}

const fabrics: FabricInstance = {};
const current = 'default';

let cli: CLI;

const log = ({ msg = '>', val = '', error = false }: { msg?: string; val?: string; error?: boolean }): void => {
    if (error) {
        console.log(chalk.redBright(msg) + ' ' + val);
    } else {
        console.log(chalk.bold(msg) + ' ' + val);
    }
};

const getPrompt = (): string => {
    const fabric = fabrics[current];
    if (!fabric) {
        return '[] > ';
    }
    let user = fabric.getUser();
    user = chalk.yellow(user === '' ? '<user>' : `${user}`);

    let channel = fabric.getChannel();
    channel = chalk.yellow(channel === '' ? '<channel>' : channel);

    let contractId = fabric.getContractId();
    contractId = chalk.yellow(contractId === '' ? '<contractid>' : contractId);

    const connected = fabric.getConnected() ? chalk.green('#') : chalk.gray('-');

    return chalk`{blue [${current}]} ${user}@${channel}:${contractId} ${connected} $ `;
};

const actionWrapper = async (params: any, options: any, func: any): Promise<void> => {
    try {
        await func(params, options);
    } catch (e) {
        log({ val: e.message, error: true });
    }
    cli.setDelimiter(getPrompt());
};

const main = async (walletPath: string, connectionFile: string, user: string) => {
    fabrics[current] = await Fabric.newFabric('default', walletPath, connectionFile);
    if (user && user !== '') {
        fabrics[current].setUser(user);
    }
    cli = new CLI().setDelimiter(getPrompt());

    // cli.addCommand('fabric', {
    //     description: 'Add new wallet and connection profile',
    //     options: [],
    //     parameters: [
    //         { label: 'name', description: 'name' },
    //         { label: 'gateway', description: 'Connection Profile' },
    //         { label: 'wallet', description: 'application wallet ' },
    //     ],
    //     action: async (params, _options) => {
    //         fabrics[params.name] = await Fabric.newFabric(params.name, params.wallet, params.profile);
    //         current = params.name;
    //         cli.setDelimiter(getPrompt());
    //     },
    // });

    cli.addCommand('info', {
        description: 'Summary of the current settings',
        options: [],
        aliases: ['i'],
        parameters: [],
        action: () => {
            if (fabrics[current]) {
                log({ val: fabrics[current].getInfo() });
            }
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

    cli.addCommand('user', {
        description: 'Set user',
        options: [],
        aliases: ['u'],
        parameters: [{ label: 'username', description: 'User name' }],
        action: async (params, _options) => {
            fabrics[current].setUser(params.username);
            log({ msg: 'User set to', val: params.username });
            await fabrics[current].establish();
            log({ msg: 'Connected to Fabric' });
            cli.setDelimiter(getPrompt());
        },
    });

    cli.addCommand('channel', {
        description: 'Set channel',
        aliases: ['n'],
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
        aliases: ['c'],
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
        aliases: ['s'],
        options: [{ label: 'json', description: 'Format output data as JSON' }],
        parameters: [
            { label: 'txname', description: 'Transaction name' },
            {
                label: 'args',
                description: 'JSON format string ',
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
            log({ msg: 'Submitted args', val: params.args });

            const args = params.args;

            const result = await fabrics[current].submit(params.txname, args);
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
        aliases: ['e'],
        parameters: [
            { label: 'txname', description: 'Transaction name' },
            {
                label: 'args',
                description: 'JSON format string ',
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
            if (!params.args) {
                params.args = '[]';
            }
            log({ msg: 'Submitted args', val: params.args });
            const args = JSON.parse(params.args);

            const result = await fabrics[current].evaluate(params.txname, args);
            if (options.json) {
                log({ val: util.inspect(JSON.parse(result), false, 6, true) });
            } else {
                log({ val: result });
            }
            cli.setDelimiter(getPrompt());
        },
    });
    cli.addCommand('metadata', {
        description: 'Display the metadata for the current contract',
        aliases: ['m'],
        parameters: [],
        action: async (_params, _options) =>
            actionWrapper(_params, _options, async () => {
                const result = await fabrics[current].evaluate('org.hyperledger.fabric:GetMetadata', []);

                log({ val: util.inspect(JSON.parse(result), false, 6, true) });
                cli.setDelimiter(getPrompt());
            }),
    });
    cli.show();
};

main(params.wallet, params.gateway, params.user);
