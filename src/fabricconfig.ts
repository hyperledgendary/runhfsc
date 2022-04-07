/*
 * SPDX-License-Identifier: Apache-2.0
 */

/** There are two 'flavours' of SDKs, the newer 'Gateway' SDK, and the
 * traditional SDKs.
 *
 * The FabricConfig interface (and matching JSON structure) allows either format to be specified
 */
export interface FabricConfig {
    gateway?: GatewayConfig;
    indirect?: IndirectFabricConfig;
}

/**
 *
 */
export interface GatewayConfig {
    tlsCertFile: string;
    peerEndpoint: string;
    sslHostNameOverride?: string;

    userPrivateKeyFile?: string;
    userCertificateFile?: string;
    mspId?: string;

    userIdFile?: string; // json file that contains the above 3 pieces of information
}

/**
 * The v2.x wallet, and connection profile approach
 */
export interface IndirectFabricConfig {
    wallet?: string;
    walletuser?: string;
    connectionProfileFile?: string;
    peerName?: string;
}
