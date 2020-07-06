import { Wallet } from 'fabric-network';
export default class Fabric {
    getInfo(): string;
    private cliName;
    constructor(cliName: string, wallet: Wallet, connectionProfile: any);
    private mywallet;
    private gateway;
    private network;
    private connectionProfile;
    private userName;
    private channel;
    private contractId;
    private connected;
    private contract;
    static newFabric(cliName: string, walletPath: string, connectionPath: string): Promise<Fabric>;
    getCliName(): string;
    setUser(userName: string): void;
    getUser(): string;
    setChannel(channel: string): void;
    getChannel(): string;
    setContractId(contract: string): void;
    getContractId(): string;
    establish(): Promise<string>;
    getConnected(): boolean;
    evaluate(fnName: string, args: string[]): Promise<string>;
    submit(fnName: string, args: string[]): Promise<string>;
    destroy(): void;
}
