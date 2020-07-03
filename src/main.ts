#!/usr/bin/env node
/*
SPDX-License-Identifier: Apache-2.0
*/

import { CLI } from 'cliffy';
import Fabric from './fabric';
import yargs = require('yargs');
var prettyjson = require('prettyjson');

const params = yargs.options(
    {
        gateway: { type: 'string', description: 'connection profile file path' , default :'', required :'true'},
        wallet: { type: 'string', description: 'wallet directory path', default:'', required :'true' }
    }
).argv;

interface FabricInstance {
    [key: string]: Fabric;
}

const main = async (walletPath: string, connectionFile: string) => {
    const cli = new CLI()
        .setDelimiter('[default] --> ');



    let fabrics: FabricInstance = {};
    let current: string;
    fabrics['default'] = await Fabric.newFabric('default', walletPath, connectionFile);
    current = 'default';

    cli.addCommand('fabric', {
        description: 'Add new wallet and connection profile',
        options: [],
        parameters: [
            { label: 'name', description: 'name' },
            { label: 'gateway', description: 'Connection Profile' },
            { label: 'wallet', description: 'application wallet ' }
        ],
        action: async (params, options) => {
            fabrics[params.name] = await Fabric.newFabric(params.name, params.wallet, params.profile);
            cli.setDelimiter(`[${params.name}] -->`);
        }
    });

    cli.addCommand('current', {
        description: 'Run somewhere',
        options: [],
        parameters: [],
        action: (params, options) => {
            if (fabrics[current]) {
                console.log(fabrics[current].getInfo());
            }

        }
    });

    cli.addCommand('user', {
        description: 'Set user',
        options: [],
        parameters: [{ label: 'username', description: 'User name' }],
        action: (params, options) => {
            fabrics[current].setUser(params.username);
            console.log(`User set to : ${params.username}`)
        }
    });

    cli.addCommand('channel', {
        description: 'Set channel',
        options: [],
        parameters: [{ label: 'channel', description: 'Channel name' }],
        action: (params, options) => {
            fabrics[current].setChannel(params.channel);
            console.log(`Channel set to : ${params.channel}`)
        }
    });

    cli.addCommand('contract', {
        description: 'Set contract',
        options: [],
        parameters: [{ label: 'contract', description: 'contract name' }],
        action: (params, options) => {
            fabrics[current].setContract(params.contract);
            console.log(`Contract set to : ${params.contract}`)
        }
    });

    cli.addCommand('submit', {
        description: 'Submit transactions',
        options: [],
        parameters: [
            { label: 'txname', description: 'Transaction name' },
            {
                label: 'args', description: 'JSON format string ', optional: true, type: (d) => {
                    return d.split(',').map((e) => { return e.replace(/'/g, '"') });
                }
            },
            {
                label: 'private', description: 'Private data map', optional: true, type: (d) => {
                    return d.split(',').map((e) => { return e.replace(/'/g, '"') });
                }
            }
        ],
        action: async (params, options) => {
            console.log(params)
            if (!params.args) {
                params.args = "[]";
            }

            let args = params.args;
            console.log(args)
            let result = await fabrics[current].submit(params.txname, args);
            console.log(result);
        }
    });
    cli.addCommand('evaluate', {
        description: 'Evaluate transactions',
        parameters: [
            { label: 'txname', description: 'Transaction name' },
            {
                label: 'args', description: 'JSON format string ', optional: true, type: (d) => {
                    return d.split(',').map((e) => { return e.replace(/'/g, '"') });
                }
            },
            {
                label: 'private', description: 'Private data map', optional: true, type: (d) => {
                    return d.split(',').map((e) => { return e.replace(/'/g, '"') });
                }
            }
        ],
        action: async (params, options) => {
            if (!params.args) {
                params.args = "[]";
            }

            let args = JSON.parse(params.args)

            let result = await fabrics[current].evaluate(params.txname, args);
            console.log(result);
        }
    });
    cli.addCommand('metadata',{
        description:"Display the metadata for the current contract",
        parameters: [],
        action: async(params,options) =>{
            let result = await fabrics[current].evaluate('org.hyperledger.fabric:GetMetadata', []);
            let json = JSON.stringify(JSON.parse(result),null,2);
            console.log(prettyjson.render(JSON.parse(result)));
        }
    })
    cli.show();
}

main(params.wallet, params.gateway);