
# runhfsc - Development REPL for Fabric/IBP

A simple CLI for testing smart contracts from the command line. Quick and simple general purpose
application. 

Usable with Hyperledger Fabric version2 or IBM Blockchain Platform

[![asciicast](https://asciinema.org/a/345618.svg)](https://asciinema.org/a/345618)


## Installation

It's a nodejs v12 application, so install that first.

```bash
npm install -g @hyperledgendary/runhfsc
```

## Usage

You need to have available the 'Gateway' JSON or YAML connection profile, and have an 'Application' wallet with an identity to use.

Run `runhfsc` with options to specify these. If you give relative paths, then they are assumed to tbe related to `~/.ibpwallets` for the wallet, and `~/.ibpgateways` for the gateway

```bash
runhfsc --wallet org1 --gateway org1/Gateway.json
[default] <user>@<channel>:<contractid> - $ 
```

The command prompt you are presented with tells you the user you are currently connected with, and the channel and the contract that you are targetting. 

(aside the default indicates a label marking the combination of wallet and gateway - not fully implemented yet)

To be able to 'evaluate' or 'submit' a transaction,  you need to specify a user, channel and contract.

```bash
[default] <user>@<channel>:<contractid> - $ user appid
User set to appid
Connected to Fabric 
```

Then the channel
```bash
[default] appid@<channel>:<contractid> - $ channel mychannel
Channel set to mychannel
```

Then the contract
```bash
[default] appid@mychannel:<contractid> - $ contract fabcar
Contract set to fabcar
```

Now to run a transaction

## Run transactions
Transactions can either by 'evaluated' - a query type operation only sent to one peer - or 'submited' - where the transaction is sent to all required peers for execution and endorsement.

Two commands `evaluate` and `submit` are available, with the same syntax

```bash
[default] appid@mychannel:fabcar - $ evaluate queryAllCars '[]'
Submitted args []
> [{"Key":"CAR0","Record":{"color":"blue","docType":"car","make":"Toyota","model":"Prius","owner":"Tomoko"}},{"Key":"CAR1","Record":{"color":"red","docType":"car","make":"Ford","model":"Mustang","owner":"Brad"}},{"Key":"CAR2","Record":{"color":"green","docType":"car","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"Key":"CAR3","Record":{"color":"yellow","docType":"car","make":"Volkswagen","model":"Passat","owner":"Max"}},{"Key":"CAR4","Record":{"color":"black","docType":"car","make":"Tesla","model":"S","owner":"Adriana"}},{"Key":"CAR5","Record":{"color":"purple","docType":"car","make":"Peugeot","model":"205","owner":"Michel"}},{"Key":"CAR6","Record":{"color":"white","docType":"car","make":"Chery","model":"S22L","owner":"Aarav"}},{"Key":"CAR7","Record":{"color":"violet","docType":"car","make":"Fiat","model":"Punto","owner":"Pari"}},{"Key":"CAR8","Record":{"color":"indigo","docType":"car","make":"Tata","model":"Nano","owner":"Valeria"}},{"Key":"CAR9","Record":{"color":"brown","docType":"car","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```

Note the parameters to the function MUST be a JSON format string - in this case this is empty.
To give arguments, for example...

```bash
[default] appid@mychannel:fabcar # $ evaluate queryCar '["CAR1"]'
Submitted args ["CAR1"]
> {"color":"red","docType":"car","make":"Ford","model":"Mustang","owner":"Brad"}
```

Add the `@json` option to get the output formatted

```bash
default] appid@mychannel:fabcar # $ evaluate @json queryCar '["CAR1"]'
Submitted args ["CAR1"]
> {
  color: 'red',
  docType: 'car',
  make: 'Ford',
  model: 'Mustang',
  owner: 'Brad'
}
```

To `submit` a transaction, eg to update an owner
```bash 
[default] appid@mychannel:fabcar - $ evaluate queryCar '["CAR9"]'
Submitted queryCar  CAR9
> {"color":"brown","docType":"car","make":"Holden","model":"Barina","owner":"fred"}
[default] appid@mychannel:fabcar # $ submit changeCarOwner '["CAR9","BILL"]'
Submitted changeCarOwner  CAR9,BILL
> 
[default] appid@mychannel:fabcar # $ evaluate queryCar '["CAR9"]'
Submitted queryCar  CAR9
> {"color":"brown","docType":"car","make":"Holden","model":"Barina","owner":"BILL"}
```

### metadata
There is a shortcut to get hold of metadata of the contract. This lets you see for example what transactions can be run.

```bash
[default] appid@mychannel:fabcar # $ metadata
> {
  '$schema': 'https://fabric-shim.github.io/release-1.4/contract-schema.json',
  contracts: {
    FabCar: {
      name: 'FabCar',
      contractInstance: { name: 'FabCar', default: true },
      transactions: [
        { name: 'initLedger', tags: [ 'submitTx' ] },
        { name: 'queryCar', tags: [ 'submitTx' ] },
        { name: 'createCar', tags: [ 'submitTx' ] },
        { name: 'queryAllCars', tags: [ 'submitTx' ] },
        { name: 'changeCarOwner', tags: [ 'submitTx' ] }
      ],
      info: { title: '', version: '' }
    },
    'org.hyperledger.fabric': {
      name: 'org.hyperledger.fabric',
      contractInstance: { name: 'org.hyperledger.fabric' },
      transactions: [ { name: 'GetMetadata' } ],
      info: { title: '', version: '' }
    }
  },
  info: { version: '1.0.0', title: 'fabcar' },
  components: { schemas: {} }
}
```