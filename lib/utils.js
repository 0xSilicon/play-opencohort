const { SILICON_RPC, OPEN_COHORT_ENDPOINT } = require('@config');
const fs = require('fs');
const { defaultAbiCoder, keccak256 } = require('ethers/lib/utils');
const { ecsign } = require('ethereumjs-util');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const request = require('request-promise');

const Web3 = require("web3");

const walletFactoryAddress = "0x301000b48Ea6E54607ac94a7d10017d8476066a9";
const openNameTagAddress = "0xE4D8deA5B6E693D0beCC0491bEe0fA8795810abe";

class Utils {
    constructor() {
        this.endpoint = SILICON_RPC;
        this.init();
    }

    async init() {
        this.node = new Web3(this.endpoint);
        this.walletFactory = new this.node.eth.Contract(this.getWalletFactoryABI(), walletFactoryAddress);
    }

    async getWallet(walletAddress) {
        return new this.node.eth.Contract(this.getWalletABI(), walletAddress);
    }

    async getManagerDeployer(managerDeployerAddress) {
        return new this.node.eth.Contract(this.getABI("SiliconProtocolManagerDeployer"), managerDeployerAddress);
    }

    async getManager(managerAddress) {
        return new this.node.eth.Contract(this.getABI("SiliconProtocolManager"), managerAddress);
    }

    async getOpenNameTag() {
        return new this.node.eth.Contract(this.getOpenNameTagABI(), openNameTagAddress);
    }

    async getAccount(pk) {
        const address = this.getAddress(pk);
        const nonce = await this.node.eth.getTransactionCount(address, "pending");
        console.log(`* EVM Address: ${address}, nonce: ${nonce}`);
        return {
            pk,
            address: address,
            nonce,
            sign: async (hash) => {
                return this.signEC(pk, hash);
            }
        }
    }

    async getCohortConfig() {
        return JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/cohort/config`)).data;
    }

    async getCommonConfig() {
        return JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/common/config`)).data;
    }

    hexStringToBuffer(str) {
        return Buffer.from(str.replace("0x", ""), 'hex');
    }

    getABI(contractName) {
        return JSON.parse(fs.readFileSync(`./abi/${contractName}.json`));
    }

    getCohortABI() {
        return this.getABI("Cohort");
    }

    getOpenNameTagABI() {
        return this.getABI("OpenNameTag");
    }

    getWalletABI() {
        return this.getABI("Wallet");
    }

    getWalletFactoryABI() {
        return this.getABI("WalletFactory");
    }

    getAddress(pk) {
        if(typeof(pk) === 'string'){
            pk = this.hexStringToBuffer(pk);
        }

        const key = ec.keyFromPrivate(pk);
        const publicKey = "0x" + key.getPublic(false, 'hex').slice(2);

        const publicHash = keccak256(publicKey);
        return `0x${publicHash.slice(-40)}`;
    }

    signEC(pk, hash) {
        if(typeof(hash) === 'string'){
            hash = this.hexStringToBuffer(hash);
        }

        if(typeof(pk) === 'string'){
            pk = this.hexStringToBuffer(pk);
        }

        let signature = ecsign(hash, pk);

        let v = '0x' + signature.v.toString(16, 2);
        let r = '0x' + signature.r.toString('hex');
        let s = '0x' + signature.s.toString('hex');
        let hex = `${r}${signature.s.toString('hex')}${signature.v.toString(16,2)}`;

        return { v, r, s, hex };
    }

    makeEthereumSignedHash(hash) {
        if(typeof(hash) === 'string'){
            hash = this.hexStringToBuffer(hash);
        }

        const signingBytes = Buffer.concat([
            Buffer.from('\x19Ethereum Signed Message:\n32', 'ascii'),
            hash
        ])
        return keccak256(signingBytes);
    }

    makeAddMembersHash(dto) {
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

    makeUpdateIdentityHash(dto) {
        const {
            cohort,
            chainId,
            identityList,
            addressList,
            signatureList,
            validUntil
        } = dto;

        const dataBytes = defaultAbiCoder.encode(
            ['string', 'address', 'uint256', 'address[]', 'address[]', 'bytes[]', 'uint256'],
            ["OpenCohort:UpdateIdentity", cohort, chainId, identityList, addressList, signatureList, validUntil]
        );
        return keccak256(dataBytes);
    }

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
}

module.exports = Utils;
