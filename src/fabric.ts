/*
 * SPDX-License-Identifier: Apache-2.0
 */
import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Network, Signer, signers } from '@hyperledger/fabric-gateway';
import { promises as fs } from 'fs';
import * as path from 'path';

import { FabricConfig } from './fabricconfig';
import * as crypto from 'crypto';
import { TextDecoder, TextEncoder } from 'util';
import JSONIDAdapter from './jsonid-adapter';
import { ConnectionHelper } from './fabirc-connection-profile';
import { logger } from './logger';

const utf8Decoder = new TextDecoder();

/** Helper class for handling connections to Fabric or IBP */
export default class Fabric {
    client!: grpc.Client;
    /**
     * Return general information
     */
    getInfo(): string {
        let str = `Fabric Configuration "${this.cliName}" \n`;
        str += `Channel:        ${this.channel} \n`;
        str += `Contract:       ${this.contractId} \n`;
        // str += `Peer Endpoint:  ${this.cfg.gateway.peerEndpoint} \n`;
        // str += `mspid:          ${this.cfg.mspId} \n`;
        // str += `Id Cert:        ${this.cfg.userCertificate} \n`;
        // str += `Id Private Key: ${this.cfg.userPrivateKey} \n`;
        return str;
    }

    private cliName: string;

    constructor(cliName: string, cfg: FabricConfig) {
        this.cliName = cliName;
        this.cfg = cfg;
    }

    private cfg: FabricConfig;

    private gateway: Gateway | undefined;
    private network: Network | undefined;
    private userName = '';
    private channel = '';
    private contractId = '';
    private connected = false;
    private contract: Contract | undefined;

    static async newFabric(cliName: string, cfg: FabricConfig): Promise<Fabric> {
        return new Fabric(cliName, cfg);
    }

    async newGrpcConnection(): Promise<grpc.Client> {
        if (this.cfg.gateway) {
            logger.debug(this.cfg.gateway, 'creating new gRPC connection  gateway');
            const tlsRootCert = await fs.readFile(this.cfg.gateway.tlsCertFile);
            const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
            if (this.cfg.gateway.sslHostNameOverride) {
                return new grpc.Client(this.cfg.gateway.peerEndpoint, tlsCredentials, {
                    'grpc.ssl_target_name_override': this.cfg.gateway.sslHostNameOverride,
                });
            } else {
                return new grpc.Client(this.cfg.gateway.peerEndpoint, tlsCredentials);
            }
        } else if (this.cfg.indirect && this.cfg.indirect.connectionProfileFile) {
            // create from, profile
            let peerEndpoint = '';
            const profile = ConnectionHelper.loadProfile(this.cfg.indirect.connectionProfileFile);
            if (this.cfg.indirect.peerName) {
                peerEndpoint = profile.peers[this.cfg.indirect.peerName].url;
            } else {
                peerEndpoint = profile.peers[Object.keys(profile.peers)[0]].url;
            }

            return new grpc.Client(peerEndpoint, grpc.credentials.createInsecure());
        } else {
            throw new Error('not enough information to create grpc connection');
        }
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
        this.client = await this.newGrpcConnection();

        let identity;
        let signer;

        // if there is an 'indirect' configuration, with a wallet and wallet user specified
        // load that user via the JSONIDAdapter
        if (this.cfg.indirect && this.cfg.indirect.wallet && this.cfg.indirect.walletuser) {
            logger.debug('Using indirect');
            const jsonAdapter: JSONIDAdapter = new JSONIDAdapter(path.resolve(this.cfg.indirect.wallet));
            identity = await jsonAdapter.getIdentity(this.cfg.indirect.walletuser);
            signer = await jsonAdapter.getSigner(this.cfg.indirect.walletuser);
        } else if (this.cfg.gateway) {
            logger.debug('Using gateway');
            // this is the gateway specificiation
            identity = await this.newIdentity();
            signer = await this.newSigner();
        } else {
            throw new Error('Insufficient configuration to create an identity for connection');
        }

        // Set connection options and connect
        this.gateway = connect({
            client: this.client,
            identity,
            signer,
            // Default timeouts for different gRPC calls
            evaluateOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            endorseOptions: () => {
                return { deadline: Date.now() + 15000 }; // 15 seconds
            },
            submitOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            commitStatusOptions: () => {
                return { deadline: Date.now() + 60000 }; // 1 minute
            },
        });
        logger.debug('Connected');
        this.connected = true;
        return 'Connected';
    }

    public isConnected(): boolean {
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

        this.network = this.gateway!.getNetwork(this.channel);
        this.contract = this.network.getContract(this.contractId);
        const issueResponse = await this.contract.evaluateTransaction(fnName, ...args);
        return this.bytesAsString(issueResponse);
    }

    /**
     * Issue a 'submit'
     *
     * @param fnName
     * @param args
     */
    public async submit(fnName: string, args: string[]): Promise<string> {
        if (!this.connected) {
            await this.establish();
        }

        this.network = this.gateway!.getNetwork(this.channel);
        this.contract = this.network.getContract(this.contractId);

        const issueResponse = await this.contract.submitTransaction(fnName, ...args);
        return this.bytesAsString(issueResponse);
    }

    /** private function to convert from the binary array to a string */
    bytesAsString(bytes?: Uint8Array): string {
        return utf8Decoder.decode(bytes);
    }

    /** Shutdown */
    public destroy(): void {
        if (this.gateway) {
            this.gateway.close();
            this.connected = false;
        }
    }

    /**
     * Create the runtime identity from the supplied files
     * @returns new Identity
     */
    async newIdentity(): Promise<Identity> {
        let certificate;
        let mspId;
        const enc = new TextEncoder();
        if (this.cfg.gateway!.userIdFile) {
            const id = JSON.parse(await fs.readFile(this.cfg.gateway!.userIdFile, 'utf-8'));

            certificate = enc.encode(id['credentials']['certificate']);
            mspId = id['mspId'];
        } else {
            certificate = await fs.readFile(this.cfg.gateway!.userCertificateFile!);
            mspId = this.cfg.gateway!.mspId;
        }

        return { mspId, credentials: certificate };
    }

    async newSigner(): Promise<Signer> {
        let privateKeyPem;
        if (this.cfg.gateway!.userIdFile) {
            const id = JSON.parse(await fs.readFile(this.cfg.gateway!.userIdFile, 'utf-8'));
            privateKeyPem = id['credentials']['privateKey'];
        } else {
            const files = await fs.readdir(this.cfg.gateway!.userPrivateKeyFile!);
            const keyPath = path.resolve(this.cfg.gateway!.userPrivateKeyFile!, files[0]);
            privateKeyPem = await fs.readFile(keyPath);
        }

        const privateKey = crypto.createPrivateKey(privateKeyPem);

        return signers.newPrivateKeySigner(privateKey);
    }
}
