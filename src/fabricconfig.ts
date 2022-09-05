/*
 * SPDX-License-Identifier: Apache-2.0
 */

/** There are two 'flavours' of SDKs, the newer 'Gateway' SDK, and the
 * traditional SDKs.
 *
 * The FabricConfig interface (and matching JSON structure) allows either format to be specified
 */
export interface FabricConfig {
    identity: GatewayIdentity | IdFile | Wallet;
    endpoint: GatewayEndpoint | Profile;
    tlsEnabled: boolean;

    defaultChannel?: string;
    defaultContract?: string;
}

/**
 *
 */
export interface GatewayEndpoint {
    tlsCertFile: string;
    peerEndpoint: string;
    sslHostNameOverride?: string;
}

export interface Profile {
    connectionProfileFile: string;
    peerName: string;
}

export interface IdFile {
    idFile: string;
    mspId?: string;
}

export interface Wallet {
    wallet: string;
    walletuser: string;
}

export interface GatewayIdentity {
    userPrivateKeyFile: string;
    userCertificateFile: string;
    mspId: string;
}
