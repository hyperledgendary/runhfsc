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
                const issueResponse = yield this.contract.submitTransaction(fnName, ...args);
                return issueResponse.toString();
            }
            return 'failed';
        });
    }
    destroy() {
        if (this.gateway) {
            this.gateway.disconnect();
        }
    }
}
exports.default = Fabric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFicmljLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZhYnJpYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUlBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsbURBQTZFO0FBRTdFLHlCQUF5QjtBQUV6QixpQ0FBMkM7QUFHM0MsTUFBcUIsTUFBTTtJQWN2QixZQUFZLE9BQWUsRUFBRSxNQUFjLEVBQUUsaUJBQXNCO1FBVTNELGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBWnRCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUMvQyxDQUFDO0lBZEQsT0FBTztRQUNILElBQUksR0FBRyxHQUFHLGFBQWEsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDO1FBQzFDLEdBQUcsSUFBSSxZQUFZLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQztRQUNyQyxHQUFHLElBQUksYUFBYSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUM7UUFDekMsR0FBRyxJQUFJLGVBQWUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQW9CRCxNQUFNLENBQU8sU0FBUyxDQUFDLE9BQWUsRUFBRSxVQUFrQixFQUFFLGNBQXNCOztZQUM5RSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUVwQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFD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QUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQzdFLE9BQU8sYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ25DO1lBQ0QsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRU0sT0FBTztRQUNWLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDN0I7SUFDTCxDQUFDO0NBQ0o7QUFoTEQseUJBZ0xDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFdhbGxldHMsIEdhdGV3YXksIFdhbGxldCwgTmV0d29yaywgQ29udHJhY3QgfSBmcm9tICdmYWJyaWMtbmV0d29yayc7XG4vLyBpbXBvcnQgeyBwYXRoVG9GaWxlVVJMIH0gZnJvbSAndXJsJztcbmltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcblxuaW1wb3J0IHsgZ2V0R2F0ZXdheVByb2ZpbGUgfSBmcm9tICcuL3V0aWwnO1xuXG4vKiogSGVscGVyIGNsYXNzIGZvciBoYW5kbGluZyBjb25uZWN0aW9ucyB0byBGYWJyaWMgb3IgSUJQICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGYWJyaWMge1xuICAgIC8qKlxuICAgICAqIFJldHVybiBnZW5lcmFsIGluZm9ybWF0aW9uXG4gICAgICovXG4gICAgZ2V0SW5mbygpOiBzdHJpbmcge1xuICAgICAgICBsZXQgc3RyID0gYElkZW50aXR5OiAke3RoaXMudXNlck5hbWV9IFxcbmA7XG4gICAgICAgIHN0ciArPSBgQ2hhbm5lbDogJHt0aGlzLmNoYW5uZWx9IFxcbmA7XG4gICAgICAgIHN0ciArPSBgQ29udHJhY3Q6ICR7dGhpcy5jb250cmFjdElkfSBcXG5gO1xuICAgICAgICBzdHIgKz0gYENvbm5lY3Rpb246ICR7dGhpcy5jb25uZWN0aW9uUHJvZmlsZS5kaXNwbGF5TmFtZX1gO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xpTmFtZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY2xpTmFtZTogc3RyaW5nLCB3YWxsZXQ6IFdhbGxldCwgY29ubmVjdGlvblByb2ZpbGU6IGFueSkge1xuICAgICAgICB0aGlzLmNsaU5hbWUgPSBjbGlOYW1lO1xuICAgICAgICB0aGlzLm15d2FsbGV0ID0gd2FsbGV0O1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25Qcm9maWxlID0gY29ubmVjdGlvblByb2ZpbGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBteXdhbGxldDogV2FsbGV0O1xuICAgIHByaXZhdGUgZ2F0ZXdheTogR2F0ZXdheSB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIG5ldHdvcms6IE5ldHdvcmsgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBjb25uZWN0aW9uUHJvZmlsZTogYW55O1xuICAgIHByaXZhdGUgdXNlck5hbWUgPSAnJztcbiAgICBwcml2YXRlIGNoYW5uZWwgPSAnJztcbiAgICBwcml2YXRlIGNvbnRyYWN0SWQgPSAnJztcbiAgICBwcml2YXRlIGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgY29udHJhY3Q6IENvbnRyYWN0IHwgdW5kZWZpbmVkO1xuXG4gICAgc3RhdGljIGFzeW5jIG5ld0ZhYnJpYyhjbGlOYW1lOiBzdHJpbmcsIHdhbGxldFBhdGg6IHN0cmluZywgY29ubmVjdGlvblBhdGg6IHN0cmluZyk6IFByb21pc2U8RmFicmljPiB7XG4gICAgICAgIGxldCB3cCA9IHBhdGgucmVzb2x2ZSh3YWxsZXRQYXRoKTtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHdwKSkge1xuICAgICAgICAgICAgLy8gc28gZG9lc24ndCBleGlzdCBzbyB0cnkgdG8gY2hlY2sgYSBkZWZhdWx0IGxvY2F0aW9uXG4gICAgICAgICAgICBjb25zdCBob21lV2FsbGV0UGF0aCA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcuaWJwd2FsbGV0cycsIHdhbGxldFBhdGgpO1xuICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGhvbWVXYWxsZXRQYXRoKSkge1xuICAgICAgICAgICAgICAgIC8vIGdpdmUgdXBcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbG9jYXRlIHdhbGxldCAke3dwfSBvciAke2hvbWVXYWxsZXRQYXRofWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cCA9IGhvbWVXYWxsZXRQYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd2FsbGV0ID0gYXdhaXQgV2FsbGV0cy5uZXdGaWxlU3lzdGVtV2FsbGV0KHdwKTtcbiAgICAgICAgLy8gTG9hZCBjb25uZWN0aW9uIHByb2ZpbGU7IHdpbGwgYmUgdXNlZCB0byBsb2NhdGUgYSBnYXRld2F5XG5cbiAgICAgICAgbGV0IGNwID0gcGF0aC5yZXNvbHZlKGNvbm5lY3Rpb25QYXRoKTtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGNwKSkge1xuICAgICAgICAgICAgLy8gc28gZG9lc24ndCBleGlzdCBzbyB0cnkgdG8gY2hlY2sgYSBkZWZhdWx0IGxvY2F0aW9uXG4gICAgICAgICAgICBjb25zdCBnYXRld2F5UGF0aCA9IHBhdGguam9pbihvcy5ob21lZGlyKCksICcuaWJwZ2F0ZXdheXMnLCBjb25uZWN0aW9uUGF0aCk7XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZ2F0ZXdheVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2l2ZSB1cFxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBsb2NhdGUgd2FsbGV0ICR7d3B9YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNwID0gZ2F0ZXdheVBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY3ApLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIGNwID0gcGF0aC5qb2luKGNwLCAnZ2F0ZXdheS5qc29uJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEZhYnJpYyhjbGlOYW1lLCB3YWxsZXQsIGdldEdhdGV3YXlQcm9maWxlKGNwKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENsaU5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpTmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VXNlcih1c2VyTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMudXNlck5hbWUgPSB1c2VyTmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNlcigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VyTmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q2hhbm5lbChjaGFubmVsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q2hhbm5lbCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFubmVsO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRDb250cmFjdElkKGNvbnRyYWN0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb250cmFjdElkID0gY29udHJhY3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbnRyYWN0SWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udHJhY3RJZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFc3RhYmxpc2ggdGhlIGNvbm5lY3Rpb24gYmFzZWQgb24gdGhlIGN1cnJlbnQgdmFsdWVzXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGVzdGFibGlzaCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvLyBkaXNjb25uZWN0IHRoZSBnYXRld2F5IGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAodGhpcy5nYXRld2F5KSB7XG4gICAgICAgICAgICB0aGlzLmdhdGV3YXkuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEEgZ2F0ZXdheSBkZWZpbmVzIHRoZSBwZWVycyB1c2VkIHRvIGFjY2VzcyBGYWJyaWMgbmV0d29ya3NcbiAgICAgICAgdGhpcy5nYXRld2F5ID0gbmV3IEdhdGV3YXkoKTtcblxuICAgICAgICBpZiAodGhpcy51c2VyTmFtZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiAnVXNlck5hbWUgcmVxdWlyZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhbm5lbCA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiAnQ2hhbm5lbCByZXF1aXJlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jb250cmFjdElkID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuICdDb250cmFjdCByZXF1aXJlZCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgY29ubmVjdGlvbiBvcHRpb25zOyBpZGVudGl0eSBhbmQgd2FsbGV0XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25PcHRpb25zID0ge1xuICAgICAgICAgICAgaWRlbnRpdHk6IHRoaXMudXNlck5hbWUsXG4gICAgICAgICAgICB3YWxsZXQ6IHRoaXMubXl3YWxsZXQsXG4gICAgICAgICAgICBkaXNjb3Zlcnk6IHsgZW5hYmxlZDogdHJ1ZSwgYXNMb2NhbGhvc3Q6IGZhbHNlIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29ubmVjdCB0byBnYXRld2F5IHVzaW5nIGFwcGxpY2F0aW9uIHNwZWNpZmllZCBwYXJhbWV0ZXJzXG4gICAgICAgIGF3YWl0IHRoaXMuZ2F0ZXdheS5jb25uZWN0KHRoaXMuY29ubmVjdGlvblByb2ZpbGUsIGNvbm5lY3Rpb25PcHRpb25zKTtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gJ0Nvbm5lY3RlZCc7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElzc3VlIGFuICdldmFsdWF0ZSdcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmbk5hbWVcbiAgICAgKiBAcGFyYW0gYXJnc1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBldmFsdWF0ZShmbk5hbWU6IHN0cmluZywgYXJnczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBpZiAoIXRoaXMuY29ubmVjdGVkKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVzdGFibGlzaCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmdhdGV3YXkgfHwgIXRoaXMuY2hhbm5lbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgcHJvcGVybHkgY29ubmVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uZXR3b3JrID0gYXdhaXQgdGhpcy5nYXRld2F5LmdldE5ldHdvcmsodGhpcy5jaGFubmVsKTtcbiAgICAgICAgdGhpcy5jb250cmFjdCA9IGF3YWl0IHRoaXMubmV0d29yay5nZXRDb250cmFjdCh0aGlzLmNvbnRyYWN0SWQpO1xuXG4gICAgICAgIGNvbnN0IGlzc3VlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNvbnRyYWN0LmV2YWx1YXRlVHJhbnNhY3Rpb24oZm5OYW1lLCAuLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIGlzc3VlUmVzcG9uc2UudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJc3N1ZSBhICdzdWJtaXQnXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZm5OYW1lXG4gICAgICogQHBhcmFtIGFyZ3NcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc3VibWl0KGZuTmFtZTogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGlmICghdGhpcy5jb250cmFjdCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5lc3RhYmxpc2goKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb250cmFjdCkge1xuICAgICAgICAgICAgY29uc3QgaXNzdWVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY29udHJhY3Quc3VibWl0VHJhbnNhY3Rpb24oZm5OYW1lLCAuLi5hcmdzKTtcbiAgICAgICAgICAgIHJldHVybiBpc3N1ZVJlc3BvbnNlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdmYWlsZWQnO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5nYXRld2F5KSB7XG4gICAgICAgICAgICB0aGlzLmdhdGV3YXkuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19