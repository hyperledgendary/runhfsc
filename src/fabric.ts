/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { Wallets, Gateway, Wallet, Network, Contract } from 'fabric-network';
// import { pathToFileURL } from 'url';
import * as os from 'os';

import { getGatewayProfile } from './util';

/** Helper class for handling connections to Fabric or IBP */
export default class Fabric {
    /**
     * Return general information
     */
    getInfo(): string {
        let str = `Identity: ${this.userName} \n`;
        str += `Channel: ${this.channel} \n`;
        str += `Contract: ${this.contractId} \n`;
        str += `Connection: ${this.connectionProfile.displayName}`;
        return str;
    }

    private cliName: string;

    constructor(cliName: string, wallet: Wallet, connectionProfile: any) {
        this.cliName = cliName;
        this.mywallet = wallet;
        this.connectionProfile = connectionProfile;
    }

    private mywallet: Wallet;
    private gateway: Gateway | undefined;
    private network: Network | undefined;
    private connectionProfile: any;
    private userName = '';
    private channel = '';
    private contractId = '';
    private connected = false;
    private contract: Contract | undefined;

    static async newFabric(cliName: string, walletPath: string, connectionPath: string): Promise<Fabric> {
        let wp = path.resolve(walletPath);
        if (!fs.existsSync(wp)) {
            // so doesn't exist so try to check a default location
            const homeWalletPath = path.join(os.homedir(), '.ibpwallets', walletPath);
            if (!fs.existsSync(homeWalletPath)) {
                // give up
                throw new Error(`Can not locate wallet ${wp} or ${homeWalletPath}`);
            } else {
                wp = homeWalletPath;
            }
        }

        const wallet = await Wallets.newFileSystemWallet(wp);
        // Load connection profile; will be used to locate a gateway

        let cp = path.resolve(connectionPath);
        if (!fs.existsSync(cp)) {
            // so doesn't exist so try to check a default location
            const gatewayPath = path.join(os.homedir(), '.ibpgateways', connectionPath);
            if (!fs.existsSync(gatewayPath)) {
                // give up
                throw new Error(`Can not locate wallet ${wp}`);
            } else {
                cp = gatewayPath;
            }
        }

        if (fs.statSync(cp).isDirectory()) {
            cp = path.join(cp, 'gateway.json');
        }

        return new Fabric(cliName, wallet, getGatewayProfile(cp));
    }

    public getCliName(): string {
        return this.cliName;
    }

    public setUser(userName: string): void {
        this.userName = userName;
    }

    public getUser(): string {
        return this.userName;
    }

    public setChannel(channel: string): void {
        this.channel = channel;
    }

    public getChannel(): string {
        return this.channel;
    }

    public setContractId(contract: string): void {
        this.contractId = contract;
    }

    public getContractId(): string {
        return this.contractId;
    }

    /**
     * Establish the connection based on the current values
     */
    public async establish(): Promise<string> {
        // disconnect the gateway if it exists
        if (this.gateway) {
            this.gateway.disconnect();
        }
        // A gateway defines the peers used to access Fabric networks
        this.gateway = new Gateway();

        if (this.userName === '') {
            return 'UserName required';
        }

        if (this.channel === '') {
            return 'Channel required';
        }

        if (this.contractId === '') {
            return 'Contract required';
        }

        // Set connection options; identity and wallet
        const connectionOptions = {
            identity: this.userName,
            wallet: this.mywallet,
            discovery: { enabled: true, asLocalhost: false },
        };

        // Connect to gateway using application specified parameters
        await this.gateway.connect(this.connectionProfile, connectionOptions);
        this.connected = true;
        return 'Connected';
    }

    public getConnected(): boolean {
        return this.connected;
    }

    /**
     * Issue an 'evaluate'
     *
     * @param fnName
     * @param args
     */
    public async evaluate(fnName: string, args: string[]): Promise<string> {
        if (!this.connected) {
            await this.establish();
        }

        if (!this.gateway || !this.channel) {
            throw new Error('Not properly connected');
        }
        this.network = await this.gateway.getNetwork(this.channel);
        this.contract = await this.network.getContract(this.contractId);

        const issueResponse = await this.contract.evaluateTransaction(fnName, ...args);
        return issueResponse.toString();
    }

    /**
     * Issue a 'submit'
     *
     * @param fnName
     * @param args
     */
    public async submit(fnName: string, args: string[]): Promise<string> {
        if (!this.contract) {
            await this.establish();
        }
        if (this.contract) {
            // log({msg:fnName,val:args});
            console.log(args);
            const issueResponse = await this.contract.submitTransaction(fnName, ...args);
            return issueResponse.toString();
        }
        return '';
    }

    public destroy(): void {
        if (this.gateway) {
            this.gateway.disconnect();
        }
    }
}
