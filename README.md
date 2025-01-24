# Open Silicon Tutorials

![silicon-opencohort](https://github.com/user-attachments/assets/b3dd4cc5-6e11-48a3-be82-172e0dd712ae)

- [**Overview**](#overview)
- [**Information**](#information)
- [**How to launch**](#how-to-launch)
- [**Open Cohort Method**](#open-cohort-methods-description)
    - Set Up Cohort (by Signer)
        - [Mint Cohort](#mint-cohort)
        - [Set Cohort Grant](#set-cohort-grant)
    - Cohort Member Management (by Signer)
        - [Add Member](#add-member)
        - [Remove Member](#remove-member)
    - Snapshot for Airdrop (by Signer)
        - [Initialize Snapshot](#initialize-snapshot)
        - [Prepare Snapshot](#prepare-snapshot)
        - [Submit Snapshot](#submit-snapshot)
    - etc.
        - [Update Identity](#update-identity)
- [**Named Wallet Method**](#named-wallet-methods-description)
    - Deploy
        - [Deploy Wallet](#deploy-wallet)
    - Wallet Management
        - [Add Property](#add-property)
        - [Remove Property](#remove-property)
        - [Change Info](#change-info)
        - [Activate Wallet](#activate-wallet)
    - Wallet Owner Example
        - [Send Wallet Assets](#send-wallet-assets)
    - [Functions Not Included in the Examples](#functions-not-included-in-the-examples)
- [**Open Silicon Procotol Manager (Optional)**](#open-silicon-procotol-manager-optional)


## Overview
 OpenCohort is a separate closely integrated with Silicon that categorizes users to support business applications, manage Web3 communities, and enhance social interactions with like-minded individuals.  

This is a collection of **script examples for deploying and managing OpenCohort and Named Wallets**. Basic functionality required for initial setup is provided as script examples. If you'd like to add more features, feel free to refer to the [**contract**](#https://github.com/0xSilicon/opencohort-contracts) and [**API documentation**](#https://api-cohort.silicon.network/docs) provided in the "Information" section below and customize as needed.  


## Information
- open cohort contracts: https://github.com/0xSilicon/opencohort-contracts
- open cohort docs : https://docs.silicon.network/about/opencohort
- open cohort api swagger : https://api-cohort.silicon.network/docs
- silicon public endpoint : https://docs.silicon.network/user-guide/network

## How to launch
1. Copy `.env.example`
```
cp .env.example .env
```
2. Fill `.env` with PRIVATE_KEY, SILICON, OPENCOHORT
```
PRIVATE_KEY: private key for cohort managing
(ex, PRIVATE_KEY=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff )
```
3. Install package
```
yarn or npm install
```
4. Fill the config in the file you'll run in the src directory, then execute it.
```
node src/${script}
```

## Open Cohort Methods Description
### Mint Cohort
Script for minting a cohort item.
To execute this script, ETH is required to cover the gas fees.

```
CohortType
- 1: Address
- 2: Identity
```
------------------------------
### Set Cohort Grant
Script for setting cohort config.
To execute this script, ETH is required to cover the gas fees.

```
// The cohort item ID to set in the grant config
const cohortId = "0"; 

// The address to receive the grant reward
const grantee = "0x0000000000000000000000000000000000000000";

// MAX: 1000, DENOMINATOR: 10000 (ex, grantRate:100 -> 1% grant reward )
const grantRate = "0";
```
------------------------------
### Add member
Add an address to a specific cohort. If the address is already a member, only the weight will be updated.
- path: `/cohort/${cohortId}/member/add`
- method: `POST`
- request body example
```
{
  // Request expiration time ( seconds, ex, currentTimestamp + 300 )
  "validUntil": 1234,
  
  // {address or identity}:{weight} mapping
  "members":{
    "0x0000000000000000000000000000000000000400":"1",
    "0x0000000000000000000000000000000000000500":"2"
  },
	
  // Signature value for the request
  "signature": "0xabcsafbasdb..."
}
```
- signingHash
```
function makeAddMembersHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        addressList,
        weightList,
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'address[]', 'uint256[]', 'uint256'],
        ['OpenCohort:Add', cohort, chainId, cohortId, addressList, weightList, validUntil]
    );
    return keccak256(dataBytes);
}
const dataHash = makeAddMembersHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
---------------------------
### Remove member
Remove an address from a specific cohort. If the address does not exist, ignore the request.
- path: `/cohort/${cohortId}/member/remove`
- method: `POST`
- request body example
```
{
  // Request expiration time ( seconds, ex, currentTimestamp + 300 )
  "validUntil": 1234,
  
  // {address or identity} list
  "members":[
    "0x0000000000000000000000000000000000000400",
    "0x0000000000000000000000000000000000000500"
  ],
	
  // Signature value for the request
  "signature": "0xabcsafbasdb..."
}
```
- signingHash
```
makeRemoveMembersHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        members,
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'address[]', 'uint256'],
        ['OpenCohort:Remove', cohort, chainId, cohortId, members, validUntil]
    );
    return keccak256(dataBytes);
}
const dataHash = makeRemoveMembersHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
---------------------------
### Update identity
Map an actual address to an identity within a specific cohort and submit a signature for that mapping.
- path: `/identity/update`
- method: `POST`
- request body example
```
{
  // Request expiration time ( seconds, ex, currentTimestamp + 300 )
  "validUntil": 1234,

  "signer": "0x0000000000000000000000000000000000000000"
  
  // {identity}:{address} mapping
  "identities":{
    "0x0000000000000000000000000000000000000400":["0xAAAAAAA","0xSIGNATURE_R_S_V"], // V= 0x1b or 0x1c
    "0x0000000000000000000000000000000000000500":["0xAddress","0xSIGNATURE_R_S_V"]
  },
	
  // Signature value for the request
  "signature": "0xabcsafbasdb..."
}
```
- signingHash for identitiy
```
makeIdentityHash(dto) {
    const {
        cohort,
        chainId,
        uniqueKey,
        beneficiary
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'address', 'address'],
        ['OpenCohort:Identity', cohort, chainId, uniqueKey, beneficiary]
    );
    return keccak256(dataBytes);
}
const dataHash = makeIdentityHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
- signingHash for updateIdentity request
```
makeUpdateIdentityHash(dto) {
    const {
        cohort,
        chainId,
        identityList,
        addressList,
        signatureList, // using makeIdentityHash function
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'address[]', 'address[]', 'bytes[]', 'uint256'],
        ["OpenCohort:UpdateIdentity", cohort, chainId, identityList, addressList, signatureList, validUntil]
    );
    return keccak256(dataBytes);
}
const dataHash = makeUpdateIdentityHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
---------------------------
### Initialize Snapshot
Finalize the snapshot data for nonce 0 of the cohort created with the provided MerkleRoot and generate the snapshot.
- path: `/cohort/{cohortId}/snapshot/initialize`
- method: `POST`
- request body example
```
{
  // Request expiration time ( seconds, ex, currentTimestamp + 300 )
  "validUntil": 1234,

  // Signature value for the request
  "signature": "0xabcsafbasdb..."
}
```
- signingHash
```
makeInitializeSnapshotHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'uint256'],
        ['OpenCohort:Initialize', cohort, chainId, cohortId, validUntil]
    );
    return keccak256(dataBytes);
}
const dataHash = makeInitializeSnapshotHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
---------------------------
### Prepare Snapshot
Request the necessary information to generate a finalized snapshot of the currently managed address list.
- path: `/cohort/{cohortId}/snapshot/prepare`
- method: `POST`
- request body example
```
{
  // Request expiration time ( seconds, ex, currentTimestamp + 300 )
  "validUntil": 1234,

  // Specify the snapshot time for the current data
  snapshotTime": 1718266039,

  // Signature value for the request
  "signature": "0xabcsafbasdb..."
}
```
- signingHash
```
makePrepareSnapshotHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        snapshotTime,
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
        ['OpenCohort:Prepare', cohort, chainId, cohortId, snapshotTime, validUntil]
    );
    return keccak256(dataBytes);
}
const dataHash = makePrepareSnapshotHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
- response ( Information used for submitSnapshot )
```
{
  statusCode: 200,
  data: {
    signatureInfo: {
      "address": "0x0000000000000000000000000000000000000700",
      "cohortId":{cohortId},
      "merkleRoot":"0xd0e15e9b115375b9725e57604121792e871db3128dc0c5683601d8288f755930",
      "timestamp":1718266039, // snapshot time (For rollup, return the value exactly as requested in the request)
      "prover":"https://api-cohort.silicon.network",
      "totalWeight":10000000,
      "nonce":1, // snapshot nonce
    },

    // Timeout for executing submitSnapshot.
    // After this time, submission with the given data will no longer be possible,
    // and a new prepare request will be required.
    expiredAt: 1728021711
  }
}
```
---------------------------
### Submit Snapshot
Receive the signature for the snapshot awaiting signature through prepare, finalize the snapshot data, and also store the Rollup data.
- path: `/cohort/{cohortId}/snapshot/submit`
- method: `POST`
- request body example
```
{
  // Request expiration time ( seconds, ex, currentTimestamp + 300 )
  "validUntil": 1234,

  // Specify the snapshot time for the current data
  snapshotTime": 1718266039,

  // Snapshot signature for rollup
  "snapshotSignature": "0xasdghioegqoeipwmngoiadsjmg",

  // Signature value for the request
  "signature": "0xabcsafbasdb..."
}
```
- signingHash for snapshot (rollup)
```
makeSubmitSnapshotHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        snapshotTime,
        snapshotSignature,
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'uint256', 'bytes', 'uint256'],
        ['OpenCohort:Submit', cohort, chainId, cohortId, snapshotTime, snapshotSignature, validUntil]
    );
    return keccak256(dataBytes);
}

makeRollupHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        nonce,
        merkleRoot,
        totalWeight,
        totalCount,
        prover,
        snapshotTime,
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'uint256', 'bytes32', 'uint256', 'uint256', 'string', 'uint256'],
        ['OpenCohort:Rollup', cohort, chainId, cohortId, nonce, merkleRoot, totalWeight, totalCount, prover, snapshotTime]
    );
    return keccak256(dataBytes);
}
const dataHash = makeRollupHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
- signingHash for submitSnapshot request
```
makeSubmitSnapshotHash(dto) {
    const {
        cohort,
        chainId,
        cohortId,
        snapshotTime,
        snapshotSignature,
        validUntil
    } = dto;

    const dataBytes = defaultAbiCoder.encode(
        ['string', 'address', 'uint256', 'uint256', 'uint256', 'bytes', 'uint256'],
        ['OpenCohort:Submit', cohort, chainId, cohortId, snapshotTime, snapshotSignature, validUntil]
    );
    return keccak256(dataBytes);
}
const dataHash = makeSubmitSnapshotHash(dto);
const signingHash = makeEthereumSignedHash(dataHash);
```
<br>
<br>

## Named Wallet Methods Description
These scripts serve as examples for deploying or setting up the Named Wallet service. Since they are primarily used for sending transactions, you will need to ensure that **you have enough ETH to cover the gas fees**. For detailed explanations of the functions, please refer to the [link](#https://docs.silicon.network/about/opencohort/build-on-opencohort/developer/cohort).

### Interacting with [`WalletFactory.sol`](#https://github.com/0xSilicon/opencohort-contracts/blob/main/contracts/namedWallet/WalletFactory.sol) 
- Contract Address: `0x5F53CD20ecE6605c62a3525E1031b1d87Be05D80`
  
#### Deploy Wallet
Send transaction for deploy Named Wallet. You can check the detailed information of the deployed Named Wallets by running the [001_checkWalletList.js](./src/wallet/signer/001_checkWalletList.js). 
```
function deployWallet(
    address virtualAddress,
    WalletInfo memory walletInfo,
    string[] calldata keys,
    string[] calldata values
) external returns (address)
```

<br>

#### Activate Wallet
Send transaction to activate Named Wallet. The activateWallet function is used to activate a named wallet by associating a signer, virtual address, and owner with a valid signature. This operation ensures that the wallet is properly initialized and ready for use.
```
function activateWallet(
    address signer,
    address virtualAddress,
    address owner,
    bytes calldata signature
) external
```

<br>

### Interacting with [`NamedWallet.sol`](#https://github.com/0xSilicon/opencohort-contracts/blob/main/contracts/namedWallet/NamedWallet.sol)

#### Add Property
Send transaction to add properties to deployed Named Wallet. This function can only be executed by the account that deployed the Named Wallet, referred to as the signer.

```
function addPropertyBatch(string[] calldata keys, string[] calldata values) external onlySignerOrFactory
```

<br>

#### Remove Property
Send transaction to remove property to deployed Named Wallet.
```
function removeProperty(string calldata key) external onlySigner
```

<br>

#### Change Info
Send transaction to modify Named Wallet's metadata.
```
function changeInfo(string memory _name, string memory _image, string memory _description) external onlySigner
```

<br>

#### Send Wallet Assets
Send a transaction to execute these functions to transfer tokens, but they can only be used after activateWallet has been executed and the owner of the named wallet has been set.
```
function transferTo(address to, uint256 amount) public payable onlyOwner
function transferTokenTo(address token, address to, uint256 amount) public onlyOwner
```

<br>

#### Functions Not Included in the Examples
- `WalletFactory.sol`
```
function computeAddress(address signer, address virtualAddress) external view returns (address) 
function getSalt(address signer, address virtualAddress) external pure returns
function getDataHash(address virtualAddress, address owner) external view returns (bytes32)
```

<br>

- `NamedWallet.sol`
```
function changeTaxRate(uint256 rate_) external onlySigner
```

<br>
<br>

## Open Silicon Procotol Manager (Optional)
The Open Silicon Protocol Manager streamlines the management of both Cohort and Named Wallet services, allowing users to deploy and manage them together in one place. By integrating these services, it simplifies the deployment process, reduces complexity, and ensures easier coordination and scalability across multiple accounts and configurations. A simple script is provided to [deploy](./src/optional/000_deployManagerContract.js) the Silicon Protocol Manager Contract and [execute](./src/optional/100_executeManagerContract.js) its functions.

