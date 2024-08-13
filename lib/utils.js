const fs = require('fs');
const { defaultAbiCoder, keccak256 } = require('ethers/lib/utils');
const { ecsign } = require('ethereumjs-util');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Utils {
    hexStringToBuffer(str) {
        return Buffer.from(str.replace("0x", ""), 'hex');
    }

    getCohortABI() {
        return JSON.parse(fs.readFileSync("./abi/Cohort.json"));
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
