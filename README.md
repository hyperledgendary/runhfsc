
# runhfsc - Development REPL for Fabric/IBP

A simple CLI for testing smart contracts from the command line. Quick and simple general purpose application.

Usable with Hyperledger Fabric version2 or IBM Blockchain Platform


## Installation

It's a nodejs v16 application, so install that first.

```bash
npm install -g @hyperledgendary/runhfsc
```

## Usage

The invoking command line is very simple

```
Options:
      --help     Show help  [boolean]
  -c, --config   configuration file  [string] [default: "./testConfig.json"]
  -v, --version  Show version number  [boolean]
```

Essentially just the location of the configuration file, setting the environment variable `RUNHFSC_CONFIG` can also be used and it will update the default. In Docker containers, use the environment variable. On a local command line, the `-c` option is often easier.

`RUNHFSC_LOG=$(pwd)/_cfg/debug.log` will control the location of the debug log file.

## Configuration File

_Dev Notes_
- should the config file be in yaml (or even CUE?)
- JSON schema?

The structure of the config file is important; it is a JSON object with separate named configurations to connect to different Fabric Networks.

In the example below, there are three `default` `k8s` and `vscode`. With the advent of the new Peer Gateway and Gateway client SDKs the conection information is presented differently.  The `gateway` is indicating that this is how the information should be understand. The `indirect` is indicating that the information should be understood from the previous generation of SDKs - namely using connection profiles and wallets.


```
{
    "default": {
        "gateway": {
            "tlsCertPath": "/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.co
m/peers/peer0.org1.example.com/tls/ca.crt",
            "peerEndpoint": "localhost:7051",
            "userPrivateKey": "/home/matthew/github.com/hyperledger/fa
bric-samples/test-network/organizations/peerOrganizations/org1.example
.com/users/User1@org1.example.com/msp/keystore",
            "userCertificate": "/home/matthew/github.com/hyperledger/f
abric-samples/test-network/organizations/peerOrganizations/org1.exampl
e.com/users/User1@org1.example.com/msp/signcerts/cert.pem",
            "sslHostNameOverride": "peer0.org1.example.com",
            "mspId": "Org1MSP"
        }
    },
    "k8s":{
        "gateway":{
            "tlsCertFile": "./_cfg/tlsca-signcert.pem",
            "peerEndpoint": "org1-peer1.vcap.me",
            "userIdFile": "./_cfg/appuser_org1.id"
        }
    },
    "vscode": {
        "indirect": {
            "wallet": "./_cfg/Org1",
            "walletuser": "Org1 Admin",
            "profile": "./_cfg/Nx01Org1GatewayConnection.json"
        }
    }
}
```

Running `runhsc -c myConfig.json` (with the above config file)

```

                     __    ____
   _______  ______  / /_  / __/_________
  / ___/ / / / __ \/ __ \/ /_/ ___/ ___/
 / /  / /_/ / / / / / / / __(__  ) /__
/_/   \__,_/_/ /_/_/ /_/_/ /____/\___/

runhfsc 0.0.4

Reading configuration from  ./testConfig.json
For help type 'help'

[default] <channel>:<contractid> - $
```

The default configuration is used. Entering the command `configs` shows the configs available

```
Available configurations from ./testConfig.json
default:
  gateway:
    tlsCertPath:         /home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    peerEndpoint:        localhost:7051
    userPrivateKey:      /home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore
    userCertificate:     /home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem
    sslHostNameOverride: peer0.org1.example.com
    mspId:               Org1MSP
k8s:
  gateway:
    tlsCertFile:  ./_cfg/tlsca-signcert.pem
    peerEndpoint: org1-peer1.vcap.me
    userIdFile:   ./_cfg/appuser_org1.id
vscode:
  indirect:
    wallet:     ./_cfg/Org1
    walletuser: Org1 Admin
    profile:    ./_cfg/Nx01Org1GatewayConnection.json
```

_note you might ask how the k8s values have arrived on a local disk..._

To swap configs, eg to use the test-network-k8s.

```
$ config k8s
Configuration set to k8s
```

Let's assume that the `test-network-k8s` is up, channel created, contract deploy, and the application config maps created

```
cd fabric-samples/test-network-k8s
./network kind
./network up
./network channel create
./network chaincode deploy
./network application
```

We can then set the channel and contract name

```
[default] <channel>:<contractid> - $ config k8s
Configuration set to k8s
[k8s] <channel>:<contractid> - $ channel mychannel
Channel set to mychannel
[k8s] mychannel:<contractid> - $ contract asset-transfer-basic
Contract set to asset-transfer-basic
[k8s] mychannel:asset-transfer-basic - $
```

As an initial test, the contract metadata can be retrieved.(only a portion is show below)

```
[k8s] mychannel:asset-transfer-basic - $ metadata
> {
  info: { title: 'undefined', version: 'latest' },
  contracts: {
    SmartContract: {
      info: { title: 'SmartContract', version: 'latest' },
      name: 'SmartContract',
      transactions: [
        {
          parameters: [ { name: 'param0', schema: [Object] } ],
          tag: [ 'submit' ],
          ....
```

There is an `initLedger` transaction function, let's run that now, followed by a `getAllAssets`

```
[k8s] mychannel:asset-transfer-basic # $ submit initLedger
Submitted initLedger
>
evaluate @json getAllAssets
Submitted getAllAssets
> [
  {
    Key: 'asset1',
    Record: {
      ID: 'asset1',
      color: 'blue',
      size: 5,
      owner: 'Tomoko',
      appraisedValue: 300
    }
  },
  ....
```
The `@json` says to format out the JSON response.


To get a single asset

```
evaluate readAsset '["asset6"]'
Submitted readAsset  asset6
> {"ID":"asset6","color":"white","size":15,"owner":"Michel","appraisedValue":800}
```

> Note the arguments are in JSON array format.... and don't forget to enclose the whole thing in ' '

