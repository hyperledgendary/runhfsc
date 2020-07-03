/*
SPDX-License-Identifier: Apache-2.0
*/

// Bring key classes into scope, most importantly Fabric SDK network class
import * as fs from 'fs';

import { Wallets, Gateway, Wallet, Network, Contract } from 'fabric-network';

export default class Fabric {
    getInfo(): string {
        let str = `Identity: ${this.userName} \n`;
        str += `Channel: ${this.channel} \n`;
        str += `Contract: ${this.contractId} \n`;
        str += `Connection: ${this.connectionProfile.displayName}`;
        return str;
    }

    private cliName: string;
    //
    constructor(cliName: string, wallet: Wallet, connectionProfile: any) {
        this.cliName = cliName;
        this.mywallet = wallet;
        this.connectionProfile = connectionProfile;
    }


    private mywallet: Wallet;
    private gateway: Gateway | undefined;
    private network: Network | undefined;
    private connectionProfile: any;
    private userName: string = '';
    private channel: string = '';
    private contractId: string = '';

    private contract: Contract | undefined;



    static async newFabric(cliName: string, walletPath: string, connectionPath: string) {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        // Load connection profile; will be used to locate a gateway
        const connectionProfile = JSON.parse(fs.readFileSync(connectionPath, 'utf8'));
        return new Fabric(cliName, wallet, connectionProfile);
    }


    getCliName() {
        return this.cliName;
    }

    setUser(userName: string) {
        this.userName = userName;
    }

    setChannel(channel: string) {
        this.channel = channel;
    }

    setContract(contract: string) {
        this.contractId = contract;
    }

    // A wallet stores a collection of identities for use

    async establish() {
        // Main try/catch block
        if (this.gateway) {
            this.gateway.disconnect();
        }
        // A gateway defines the peers used to access Fabric networks
        this.gateway = new Gateway();

        if (this.userName === '') {
            return "UserName required";
        }

        if (this.channel === '') {
            return "Channel required";
        }

        if (this.contractId === '') {
            return "Contract required";
        }

        // Set connection options; identity and wallet
        const connectionOptions = {
            identity: this.userName,
            wallet: this.mywallet,
            discovery: { enabled: true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await this.gateway.connect(this.connectionProfile, connectionOptions);
        this.network = await this.gateway.getNetwork(this.channel);
        this.contract = await this.network.getContract(this.contractId);

    }

    async evaluate(fnName: string, args: string[]): Promise<string> {
        if (!this.contract) {
            await this.establish();
        }
        if (this.contract) {
            const issueResponse = await this.contract.evaluateTransaction(fnName, ...args);
            return issueResponse.toString();
        }
        return "failed";
    }

    async submit(fnName: string, args: string[]): Promise<string> {
        if (!this.contract) {
            await this.establish();
        }
        if (this.contract) {
            const issueResponse = await this.contract.submitTransaction(fnName, ...args);
            return issueResponse.toString();

        }
        return "failed";

    }

    destroy() {
        if (this.gateway) {
            this.gateway.disconnect();
        }

    }

    

}
