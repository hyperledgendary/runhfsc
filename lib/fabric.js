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
            return new Fabric(cliName, wallet, (0, util_1.getGatewayProfile)(cp));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFicmljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZhYnJpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUlBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsbURBQTZFO0FBRTdFLHlCQUF5QjtBQUV6QixpQ0FBMkM7QUFHM0MsTUFBcUIsTUFBTTtJQWN2QixZQUFZLE9BQWUsRUFBRSxNQUFjLEVBQUUsaUJBQXNCO1FBVTNELGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBWnRCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUMvQyxDQUFDO0lBZEQsT0FBTztRQUNILElBQUksR0FBRyxHQUFHLGFBQWEsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO1FBQzFDLEdBQUcsSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQztRQUNyQyxHQUFHLElBQUksYUFBYSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUM7UUFDekMsR0FBRyxJQUFJLGVBQWUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQW9CRCxNQUFNLENBQU8sU0FBUyxDQUFDLE9BQWUsRUFBRSxVQUFrQixFQUFFLGNBQXNCOztZQUM5RSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUVwQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFD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QU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDN0UsT0FBTyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDbkM7WUFDRCxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVNLE9BQU87UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztDQUNKO0FBbExELHlCQWtMQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBXYWxsZXRzLCBHYXRld2F5LCBXYWxsZXQsIE5ldHdvcmssIENvbnRyYWN0IH0gZnJvbSAnZmFicmljLW5ldHdvcmsnO1xuLy8gaW1wb3J0IHsgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5cbmltcG9ydCB7IGdldEdhdGV3YXlQcm9maWxlIH0gZnJvbSAnLi91dGlsJztcblxuLyoqIEhlbHBlciBjbGFzcyBmb3IgaGFuZGxpbmcgY29ubmVjdGlvbnMgdG8gRmFicmljIG9yIElCUCAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmFicmljIHtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZ2VuZXJhbCBpbmZvcm1hdGlvblxuICAgICAqL1xuICAgIGdldEluZm8oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHN0ciA9IGBJZGVudGl0eTogJHt0aGlzLnVzZXJOYW1lfSBcXG5gO1xuICAgICAgICBzdHIgKz0gYENoYW5uZWw6ICR7dGhpcy5jaGFubmVsfSBcXG5gO1xuICAgICAgICBzdHIgKz0gYENvbnRyYWN0OiAke3RoaXMuY29udHJhY3RJZH0gXFxuYDtcbiAgICAgICAgc3RyICs9IGBDb25uZWN0aW9uOiAke3RoaXMuY29ubmVjdGlvblByb2ZpbGUuZGlzcGxheU5hbWV9YDtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsaU5hbWU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGNsaU5hbWU6IHN0cmluZywgd2FsbGV0OiBXYWxsZXQsIGNvbm5lY3Rpb25Qcm9maWxlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5jbGlOYW1lID0gY2xpTmFtZTtcbiAgICAgICAgdGhpcy5teXdhbGxldCA9IHdhbGxldDtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uUHJvZmlsZSA9IGNvbm5lY3Rpb25Qcm9maWxlO1xuICAgIH1cblxuICAgIHByaXZhdGUgbXl3YWxsZXQ6IFdhbGxldDtcbiAgICBwcml2YXRlIGdhdGV3YXk6IEdhdGV3YXkgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBuZXR3b3JrOiBOZXR3b3JrIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgY29ubmVjdGlvblByb2ZpbGU6IGFueTtcbiAgICBwcml2YXRlIHVzZXJOYW1lID0gJyc7XG4gICAgcHJpdmF0ZSBjaGFubmVsID0gJyc7XG4gICAgcHJpdmF0ZSBjb250cmFjdElkID0gJyc7XG4gICAgcHJpdmF0ZSBjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIGNvbnRyYWN0OiBDb250cmFjdCB8IHVuZGVmaW5lZDtcblxuICAgIHN0YXRpYyBhc3luYyBuZXdGYWJyaWMoY2xpTmFtZTogc3RyaW5nLCB3YWxsZXRQYXRoOiBzdHJpbmcsIGNvbm5lY3Rpb25QYXRoOiBzdHJpbmcpOiBQcm9taXNlPEZhYnJpYz4ge1xuICAgICAgICBsZXQgd3AgPSBwYXRoLnJlc29sdmUod2FsbGV0UGF0aCk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyh3cCkpIHtcbiAgICAgICAgICAgIC8vIHNvIGRvZXNuJ3QgZXhpc3Qgc28gdHJ5IHRvIGNoZWNrIGEgZGVmYXVsdCBsb2NhdGlvblxuICAgICAgICAgICAgY29uc3QgaG9tZVdhbGxldFBhdGggPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmlicHdhbGxldHMnLCB3YWxsZXRQYXRoKTtcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhob21lV2FsbGV0UGF0aCkpIHtcbiAgICAgICAgICAgICAgICAvLyBnaXZlIHVwXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGxvY2F0ZSB3YWxsZXQgJHt3cH0gb3IgJHtob21lV2FsbGV0UGF0aH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd3AgPSBob21lV2FsbGV0UGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdhbGxldCA9IGF3YWl0IFdhbGxldHMubmV3RmlsZVN5c3RlbVdhbGxldCh3cCk7XG4gICAgICAgIC8vIExvYWQgY29ubmVjdGlvbiBwcm9maWxlOyB3aWxsIGJlIHVzZWQgdG8gbG9jYXRlIGEgZ2F0ZXdheVxuXG4gICAgICAgIGxldCBjcCA9IHBhdGgucmVzb2x2ZShjb25uZWN0aW9uUGF0aCk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhjcCkpIHtcbiAgICAgICAgICAgIC8vIHNvIGRvZXNuJ3QgZXhpc3Qgc28gdHJ5IHRvIGNoZWNrIGEgZGVmYXVsdCBsb2NhdGlvblxuICAgICAgICAgICAgY29uc3QgZ2F0ZXdheVBhdGggPSBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnLmlicGdhdGV3YXlzJywgY29ubmVjdGlvblBhdGgpO1xuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGdhdGV3YXlQYXRoKSkge1xuICAgICAgICAgICAgICAgIC8vIGdpdmUgdXBcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbG9jYXRlIHdhbGxldCAke3dwfWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjcCA9IGdhdGV3YXlQYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZzLnN0YXRTeW5jKGNwKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICBjcCA9IHBhdGguam9pbihjcCwgJ2dhdGV3YXkuanNvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBGYWJyaWMoY2xpTmFtZSwgd2FsbGV0LCBnZXRHYXRld2F5UHJvZmlsZShjcCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDbGlOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsaU5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFVzZXIodXNlck5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLnVzZXJOYW1lID0gdXNlck5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFVzZXIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlck5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldENoYW5uZWwoY2hhbm5lbDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENoYW5uZWwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhbm5lbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q29udHJhY3RJZChjb250cmFjdDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29udHJhY3RJZCA9IGNvbnRyYWN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb250cmFjdElkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRyYWN0SWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXN0YWJsaXNoIHRoZSBjb25uZWN0aW9uIGJhc2VkIG9uIHRoZSBjdXJyZW50IHZhbHVlc1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBlc3RhYmxpc2goKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgZ2F0ZXdheSBpZiBpdCBleGlzdHNcbiAgICAgICAgaWYgKHRoaXMuZ2F0ZXdheSkge1xuICAgICAgICAgICAgdGhpcy5nYXRld2F5LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBIGdhdGV3YXkgZGVmaW5lcyB0aGUgcGVlcnMgdXNlZCB0byBhY2Nlc3MgRmFicmljIG5ldHdvcmtzXG4gICAgICAgIHRoaXMuZ2F0ZXdheSA9IG5ldyBHYXRld2F5KCk7XG5cbiAgICAgICAgaWYgKHRoaXMudXNlck5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ1VzZXJOYW1lIHJlcXVpcmVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNoYW5uZWwgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ0NoYW5uZWwgcmVxdWlyZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY29udHJhY3RJZCA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiAnQ29udHJhY3QgcmVxdWlyZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IGNvbm5lY3Rpb24gb3B0aW9uczsgaWRlbnRpdHkgYW5kIHdhbGxldFxuICAgICAgICBjb25zdCBjb25uZWN0aW9uT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGlkZW50aXR5OiB0aGlzLnVzZXJOYW1lLFxuICAgICAgICAgICAgd2FsbGV0OiB0aGlzLm15d2FsbGV0LFxuICAgICAgICAgICAgZGlzY292ZXJ5OiB7IGVuYWJsZWQ6IHRydWUsIGFzTG9jYWxob3N0OiBmYWxzZSB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbm5lY3QgdG8gZ2F0ZXdheSB1c2luZyBhcHBsaWNhdGlvbiBzcGVjaWZpZWQgcGFyYW1ldGVyc1xuICAgICAgICBhd2FpdCB0aGlzLmdhdGV3YXkuY29ubmVjdCh0aGlzLmNvbm5lY3Rpb25Qcm9maWxlLCBjb25uZWN0aW9uT3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuICdDb25uZWN0ZWQnO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbm5lY3RlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJc3N1ZSBhbiAnZXZhbHVhdGUnXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZm5OYW1lXG4gICAgICogQHBhcmFtIGFyZ3NcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZXZhbHVhdGUoZm5OYW1lOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5lc3RhYmxpc2goKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5nYXRld2F5IHx8ICF0aGlzLmNoYW5uZWwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHByb3Blcmx5IGNvbm5lY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubmV0d29yayA9IGF3YWl0IHRoaXMuZ2F0ZXdheS5nZXROZXR3b3JrKHRoaXMuY2hhbm5lbCk7XG4gICAgICAgIHRoaXMuY29udHJhY3QgPSBhd2FpdCB0aGlzLm5ldHdvcmsuZ2V0Q29udHJhY3QodGhpcy5jb250cmFjdElkKTtcblxuICAgICAgICBjb25zdCBpc3N1ZVJlc3BvbnNlID0gYXdhaXQgdGhpcy5jb250cmFjdC5ldmFsdWF0ZVRyYW5zYWN0aW9uKGZuTmFtZSwgLi4uYXJncyk7XG4gICAgICAgIHJldHVybiBpc3N1ZVJlc3BvbnNlLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXNzdWUgYSAnc3VibWl0J1xuICAgICAqXG4gICAgICogQHBhcmFtIGZuTmFtZVxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHN1Ym1pdChmbk5hbWU6IHN0cmluZywgYXJnczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udHJhY3QpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXN0YWJsaXNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29udHJhY3QpIHtcbiAgICAgICAgICAgIC8vIGxvZyh7bXNnOmZuTmFtZSx2YWw6YXJnc30pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYXJncyk7XG4gICAgICAgICAgICBjb25zdCBpc3N1ZVJlc3BvbnNlID0gYXdhaXQgdGhpcy5jb250cmFjdC5zdWJtaXRUcmFuc2FjdGlvbihmbk5hbWUsIC4uLmFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIGlzc3VlUmVzcG9uc2UudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmdhdGV3YXkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2F0ZXdheS5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=