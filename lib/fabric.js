"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const fabric_network_1 = require("fabric-network");
const os = require("os");
const util_1 = require("./util");
class Fabric {
    constructor(cliName, wallet, connectionProfile) {
        this.userName = '';
        this.channel = '';
        this.contractId = '';
        this.connected = false;
        this.cliName = cliName;
        this.mywallet = wallet;
        this.connectionProfile = connectionProfile;
    }
    getInfo() {
        let str = `Identity: ${this.userName} \n`;
        str += `Channel: ${this.channel} \n`;
        str += `Contract: ${this.contractId} \n`;
        str += `Connection: ${this.connectionProfile.displayName}`;
        return str;
    }
    static newFabric(cliName, walletPath, connectionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let wp = path.resolve(walletPath);
            if (!fs.existsSync(wp)) {
                const homeWalletPath = path.join(os.homedir(), '.ibpwallets', walletPath);
                if (!fs.existsSync(homeWalletPath)) {
                    throw new Error(`Can not locate wallet ${wp} or ${homeWalletPath}`);
                }
                else {
                    wp = homeWalletPath;
                }
            }
            const wallet = yield fabric_network_1.Wallets.newFileSystemWallet(wp);
            let cp = path.resolve(connectionPath);
            if (!fs.existsSync(cp)) {
                const gatewayPath = path.join(os.homedir(), '.ibpgateways', connectionPath);
                if (!fs.existsSync(gatewayPath)) {
                    throw new Error(`Can not locate wallet ${wp}`);
                }
                else {
                    cp = gatewayPath;
                }
            }
            if (fs.statSync(cp).isDirectory()) {
                cp = path.join(cp, 'gateway.json');
            }
            return new Fabric(cliName, wallet, util_1.getGatewayProfile(cp));
        });
    }
    getCliName() {
        return this.cliName;
    }
    setUser(userName) {
        this.userName = userName;
    }
    getUser() {
        return this.userName;
    }
    setChannel(channel) {
        this.channel = channel;
    }
    getChannel() {
        return this.channel;
    }
    setContractId(contract) {
        this.contractId = contract;
    }
    getContractId() {
        return this.contractId;
    }
    establish() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gateway) {
                this.gateway.disconnect();
            }
            this.gateway = new fabric_network_1.Gateway();
            if (this.userName === '') {
                return 'UserName required';
            }
            if (this.channel === '') {
                return 'Channel required';
            }
            if (this.contractId === '') {
                return 'Contract required';
            }
            const connectionOptions = {
                identity: this.userName,
                wallet: this.mywallet,
                discovery: { enabled: true, asLocalhost: false },
            };
            yield this.gateway.connect(this.connectionProfile, connectionOptions);
            this.connected = true;
            return 'Connected';
        });
    }
    getConnected() {
        return this.connected;
    }
    evaluate(fnName, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                yield this.establish();
            }
            if (!this.gateway || !this.channel) {
                throw new Error('Not properly connected');
            }
            this.network = yield this.gateway.getNetwork(this.channel);
            this.contract = yield this.network.getContract(this.contractId);
            const issueResponse = yield this.contract.evaluateTransaction(fnName, ...args);
            return issueResponse.toString();
        });
    }
    submit(fnName, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.contract) {
                yield this.establish();
            }
            if (this.contract) {
                console.log(args);
                const issueResponse = yield this.contract.submitTransaction(fnName, ...args);
                return issueResponse.toString();
            }
            return '';
        });
    }
    destroy() {
        if (this.gateway) {
            this.gateway.disconnect();
        }
    }
}
exports.default = Fabric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFicmljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZhYnJpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUlBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsbURBQTZFO0FBRTdFLHlCQUF5QjtBQUV6QixpQ0FBMkM7QUFHM0MsTUFBcUIsTUFBTTtJQWN2QixZQUFZLE9BQWUsRUFBRSxNQUFjLEVBQUUsaUJBQXNCO1FBVTNELGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBWnRCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUMvQyxDQUFDO0lBZEQsT0FBTztRQUNILElBQUksR0FBRyxHQUFHLGFBQWEsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO1FBQzFDLEdBQUcsSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQztRQUNyQyxHQUFHLElBQUksYUFBYSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUM7UUFDekMsR0FBRyxJQUFJLGVBQWUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQW9CRCxNQUFNLENBQU8sU0FBUyxDQUFDLE9BQWUsRUFBRSxVQUFrQixFQUFFLGNBQXNCOztZQUM5RSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUVwQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFD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QWEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQzdFLE9BQU8sYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ25DO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO0tBQUE7SUFFTSxPQUFPO1FBQ1YsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUM3QjtJQUNMLENBQUM7Q0FDSjtBQWxMRCx5QkFrTEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgV2FsbGV0cywgR2F0ZXdheSwgV2FsbGV0LCBOZXR3b3JrLCBDb250cmFjdCB9IGZyb20gJ2ZhYnJpYy1uZXR3b3JrJztcbi8vIGltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICd1cmwnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuXG5pbXBvcnQgeyBnZXRHYXRld2F5UHJvZmlsZSB9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBIZWxwZXIgY2xhc3MgZm9yIGhhbmRsaW5nIGNvbm5lY3Rpb25zIHRvIEZhYnJpYyBvciBJQlAgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZhYnJpYyB7XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGdlbmVyYWwgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICBnZXRJbmZvKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBzdHIgPSBgSWRlbnRpdHk6ICR7dGhpcy51c2VyTmFtZX0gXFxuYDtcbiAgICAgICAgc3RyICs9IGBDaGFubmVsOiAke3RoaXMuY2hhbm5lbH0gXFxuYDtcbiAgICAgICAgc3RyICs9IGBDb250cmFjdDogJHt0aGlzLmNvbnRyYWN0SWR9IFxcbmA7XG4gICAgICAgIHN0ciArPSBgQ29ubmVjdGlvbjogJHt0aGlzLmNvbm5lY3Rpb25Qcm9maWxlLmRpc3BsYXlOYW1lfWA7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGlOYW1lOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihjbGlOYW1lOiBzdHJpbmcsIHdhbGxldDogV2FsbGV0LCBjb25uZWN0aW9uUHJvZmlsZTogYW55KSB7XG4gICAgICAgIHRoaXMuY2xpTmFtZSA9IGNsaU5hbWU7XG4gICAgICAgIHRoaXMubXl3YWxsZXQgPSB3YWxsZXQ7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvblByb2ZpbGUgPSBjb25uZWN0aW9uUHJvZmlsZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG15d2FsbGV0OiBXYWxsZXQ7XG4gICAgcHJpdmF0ZSBnYXRld2F5OiBHYXRld2F5IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgbmV0d29yazogTmV0d29yayB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGNvbm5lY3Rpb25Qcm9maWxlOiBhbnk7XG4gICAgcHJpdmF0ZSB1c2VyTmFtZSA9ICcnO1xuICAgIHByaXZhdGUgY2hhbm5lbCA9ICcnO1xuICAgIHByaXZhdGUgY29udHJhY3RJZCA9ICcnO1xuICAgIHByaXZhdGUgY29ubmVjdGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBjb250cmFjdDogQ29udHJhY3QgfCB1bmRlZmluZWQ7XG5cbiAgICBzdGF0aWMgYXN5bmMgbmV3RmFicmljKGNsaU5hbWU6IHN0cmluZywgd2FsbGV0UGF0aDogc3RyaW5nLCBjb25uZWN0aW9uUGF0aDogc3RyaW5nKTogUHJvbWlzZTxGYWJyaWM+IHtcbiAgICAgICAgbGV0IHdwID0gcGF0aC5yZXNvbHZlKHdhbGxldFBhdGgpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMod3ApKSB7XG4gICAgICAgICAgICAvLyBzbyBkb2Vzbid0IGV4aXN0IHNvIHRyeSB0byBjaGVjayBhIGRlZmF1bHQgbG9jYXRpb25cbiAgICAgICAgICAgIGNvbnN0IGhvbWVXYWxsZXRQYXRoID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5pYnB3YWxsZXRzJywgd2FsbGV0UGF0aCk7XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoaG9tZVdhbGxldFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2l2ZSB1cFxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBsb2NhdGUgd2FsbGV0ICR7d3B9IG9yICR7aG9tZVdhbGxldFBhdGh9YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdwID0gaG9tZVdhbGxldFBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3YWxsZXQgPSBhd2FpdCBXYWxsZXRzLm5ld0ZpbGVTeXN0ZW1XYWxsZXQod3ApO1xuICAgICAgICAvLyBMb2FkIGNvbm5lY3Rpb24gcHJvZmlsZTsgd2lsbCBiZSB1c2VkIHRvIGxvY2F0ZSBhIGdhdGV3YXlcblxuICAgICAgICBsZXQgY3AgPSBwYXRoLnJlc29sdmUoY29ubmVjdGlvblBhdGgpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY3ApKSB7XG4gICAgICAgICAgICAvLyBzbyBkb2Vzbid0IGV4aXN0IHNvIHRyeSB0byBjaGVjayBhIGRlZmF1bHQgbG9jYXRpb25cbiAgICAgICAgICAgIGNvbnN0IGdhdGV3YXlQYXRoID0gcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgJy5pYnBnYXRld2F5cycsIGNvbm5lY3Rpb25QYXRoKTtcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhnYXRld2F5UGF0aCkpIHtcbiAgICAgICAgICAgICAgICAvLyBnaXZlIHVwXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGxvY2F0ZSB3YWxsZXQgJHt3cH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3AgPSBnYXRld2F5UGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmcy5zdGF0U3luYyhjcCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgY3AgPSBwYXRoLmpvaW4oY3AsICdnYXRld2F5Lmpzb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRmFicmljKGNsaU5hbWUsIHdhbGxldCwgZ2V0R2F0ZXdheVByb2ZpbGUoY3ApKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q2xpTmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jbGlOYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRVc2VyKHVzZXJOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy51c2VyTmFtZSA9IHVzZXJOYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRVc2VyKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnVzZXJOYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDaGFubmVsKGNoYW5uZWw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDaGFubmVsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYW5uZWw7XG4gICAgfVxuXG4gICAgcHVibGljIHNldENvbnRyYWN0SWQoY29udHJhY3Q6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbnRyYWN0SWQgPSBjb250cmFjdDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29udHJhY3RJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250cmFjdElkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVzdGFibGlzaCB0aGUgY29ubmVjdGlvbiBiYXNlZCBvbiB0aGUgY3VycmVudCB2YWx1ZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXN0YWJsaXNoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIGdhdGV3YXkgaWYgaXQgZXhpc3RzXG4gICAgICAgIGlmICh0aGlzLmdhdGV3YXkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2F0ZXdheS5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQSBnYXRld2F5IGRlZmluZXMgdGhlIHBlZXJzIHVzZWQgdG8gYWNjZXNzIEZhYnJpYyBuZXR3b3Jrc1xuICAgICAgICB0aGlzLmdhdGV3YXkgPSBuZXcgR2F0ZXdheSgpO1xuXG4gICAgICAgIGlmICh0aGlzLnVzZXJOYW1lID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuICdVc2VyTmFtZSByZXF1aXJlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaGFubmVsID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuICdDaGFubmVsIHJlcXVpcmVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbnRyYWN0SWQgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ0NvbnRyYWN0IHJlcXVpcmVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBjb25uZWN0aW9uIG9wdGlvbnM7IGlkZW50aXR5IGFuZCB3YWxsZXRcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbk9wdGlvbnMgPSB7XG4gICAgICAgICAgICBpZGVudGl0eTogdGhpcy51c2VyTmFtZSxcbiAgICAgICAgICAgIHdhbGxldDogdGhpcy5teXdhbGxldCxcbiAgICAgICAgICAgIGRpc2NvdmVyeTogeyBlbmFibGVkOiB0cnVlLCBhc0xvY2FsaG9zdDogZmFsc2UgfSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb25uZWN0IHRvIGdhdGV3YXkgdXNpbmcgYXBwbGljYXRpb24gc3BlY2lmaWVkIHBhcmFtZXRlcnNcbiAgICAgICAgYXdhaXQgdGhpcy5nYXRld2F5LmNvbm5lY3QodGhpcy5jb25uZWN0aW9uUHJvZmlsZSwgY29ubmVjdGlvbk9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiAnQ29ubmVjdGVkJztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25uZWN0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXNzdWUgYW4gJ2V2YWx1YXRlJ1xuICAgICAqXG4gICAgICogQHBhcmFtIGZuTmFtZVxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGV2YWx1YXRlKGZuTmFtZTogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGlmICghdGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXN0YWJsaXNoKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZ2F0ZXdheSB8fCAhdGhpcy5jaGFubmVsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBwcm9wZXJseSBjb25uZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5ldHdvcmsgPSBhd2FpdCB0aGlzLmdhdGV3YXkuZ2V0TmV0d29yayh0aGlzLmNoYW5uZWwpO1xuICAgICAgICB0aGlzLmNvbnRyYWN0ID0gYXdhaXQgdGhpcy5uZXR3b3JrLmdldENvbnRyYWN0KHRoaXMuY29udHJhY3RJZCk7XG5cbiAgICAgICAgY29uc3QgaXNzdWVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY29udHJhY3QuZXZhbHVhdGVUcmFuc2FjdGlvbihmbk5hbWUsIC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gaXNzdWVSZXNwb25zZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElzc3VlIGEgJ3N1Ym1pdCdcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmbk5hbWVcbiAgICAgKiBAcGFyYW0gYXJnc1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBzdWJtaXQoZm5OYW1lOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRyYWN0KSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVzdGFibGlzaCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvbnRyYWN0KSB7XG4gICAgICAgICAgICAvLyBsb2coe21zZzpmbk5hbWUsdmFsOmFyZ3N9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFyZ3MpO1xuICAgICAgICAgICAgY29uc3QgaXNzdWVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY29udHJhY3Quc3VibWl0VHJhbnNhY3Rpb24oZm5OYW1lLCAuLi5hcmdzKTtcbiAgICAgICAgICAgIHJldHVybiBpc3N1ZVJlc3BvbnNlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5nYXRld2F5KSB7XG4gICAgICAgICAgICB0aGlzLmdhdGV3YXkuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19