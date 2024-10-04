# Play OpenCohort

![silicon-opencohort](https://github.com/user-attachments/assets/b3dd4cc5-6e11-48a3-be82-172e0dd712ae)

## Overview
OpenCohort is a separate closely integrated with Silicon that categorizes users to support business applications, manage Web3 communities, and enhance social interactions with like-minded individuals.

## Information
- open cohort docs : https://docs.silicon.network/about/opencohort
- open cohort api swagger : https://api-cohort.silicon.network/docs
- silicon public endpoint : https://docs.silicon.network/user-guide/network

## How to launch
1. Copy `.env.example`
```
cp .env.example .env
```
2. Fill `.env` with PRIVATEKEY, SILICON, OPENCOHORT
```
PRIVATEKEY: private key for cohort managing
(ex, PRIVATEKEY=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff )

SILICON: silicon endpoint
(mainnet: https://rpc.silicon.network, testnet: https://rpc-sepolia.silicon.network )

OPENCOHORT: OpenCohort endpoint
( mainnet: https://api-cohort.silicon.network, testnet: TBD )
```
3. Install package
```
yarn or npm install
```
4. Fill the config in the file you'll run in the src directory, then execute it.
```
node src/${script}
```

## Methods Description
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
    "0x0000000000000000000000000000000000000400":1,
    "0x0000000000000000000000000000000000000500":2
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
