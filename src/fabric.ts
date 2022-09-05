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
import { ConnectionHelper } from './fabric-connection-profile';
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

        if (cfg.defaultChannel) {
            this.channel = cfg.defaultChannel;
        }

        if (cfg.defaultContract) {
            this.contractId = cfg.defaultContract;
        }
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
        if ('peerEndpoint' in this.cfg.endpoint) {
            logger.debug(this.cfg, 'creating new gRPC connection  gateway');

            if (this.cfg.tlsEnabled) {
                const tlsRootCert = await fs.readFile(this.cfg.endpoint.tlsCertFile);
                const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
                if (this.cfg.endpoint.sslHostNameOverride) {
                    return new grpc.Client(this.cfg.endpoint.peerEndpoint, tlsCredentials, {
                        'grpc.ssl_target_name_override': this.cfg.endpoint.sslHostNameOverride,
                    });
                } else {
                    return new grpc.Client(this.cfg.endpoint.peerEndpoint, tlsCredentials);
                }
            } else {
                logger.debug('Not using tls');
                return new grpc.Client(this.cfg.endpoint.peerEndpoint, grpc.credentials.createInsecure());
            }
        } else if ('connectionProfileFile' in this.cfg.endpoint) {
            const cp = await ConnectionHelper.loadProfile(this.cfg.endpoint.connectionProfileFile);
            return await ConnectionHelper.newGrpcConnection(cp, this.cfg.tlsEnabled);
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
        if ('wallet' in this.cfg.identity) {
            logger.debug('Using wallet');

            const jsonAdapter: JSONIDAdapter = new JSONIDAdapter(path.resolve(this.cfg.identity.wallet));
            identity = await jsonAdapter.getIdentity(this.cfg.identity.walletuser);
            signer = await jsonAdapter.getSigner(this.cfg.identity.walletuser);
        } else if ('userPrivateKeyFile' in this.cfg.identity) {
            logger.debug('Using gateway');
            // this is the gateway specificiation
            const certificate = await fs.readFile(this.cfg.identity.userCertificateFile);
            identity = {
                mspId: this.cfg.identity.mspId,
                credentials: certificate,
            };

            const files = await fs.readdir(this.cfg.identity.userPrivateKeyFile);
            const keyPath = path.resolve(this.cfg.identity.userPrivateKeyFile, files[0]);
            logger.debug(keyPath);
            const privateKeyPem = await fs.readFile(keyPath);
            logger.debug(privateKeyPem);
            const privateKey = crypto.createPrivateKey(privateKeyPem);
            signer = signers.newPrivateKeySigner(privateKey);
        } else if ('idFile' in this.cfg.identity) {
            const dir = path.dirname(this.cfg.identity.idFile);
            const idfile = path.basename(this.cfg.identity.idFile);

            const jsonAdapter: JSONIDAdapter = new JSONIDAdapter(path.resolve(dir), this.cfg.identity.mspId);
            identity = await jsonAdapter.getIdentity(idfile);
            signer = await jsonAdapter.getSigner(idfile);

            // this is the gateway specificiation
            // const id = JSON.parse(await fs.readFile(this.cfg.identity.idFile, 'utf-8'));
            // const enc = new TextEncoder();
            // const certificate = enc.encode(id['credentials']['certificate']);
            // identity = {
            //     mspId: id['mspId'],
            //     credentials: certificate,
            // };

            // const privateKeyPem = id['credentials']['privateKey'];

            // const privateKey = crypto.createPrivateKey(privateKeyPem);
            // signer = signers.newPrivateKeySigner(privateKey);
        } else {
            throw new Error('Insufficient configuration to create an identity for connection');
        }

        logger.debug(identity, 'identity');
        logger.debug('Signer');
        logger.debug(signer, 'signer');
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
        console.log(args);
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
}
