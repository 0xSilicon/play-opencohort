require("module-alias/register");
const { OPEN_COHORT_ENDPOINT } = require('@config');
const Utils = require("@utils");
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

(async() => {
    const privateKey = process.env.PRIVATE_KEY;

    /////////////////////////////////////////
    // CONFIG
    const cohortId = "";
    const dto = {
        nonce: "",
        merkleRoot: "",
        totalWeight: "",
        totalCount: "",
        prover: 'https://api-cohort.silicon.network',
        timestamp: ""
    }
    /////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/cohort/config`)).data;

    const rollupHash = utils.makeRollupHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        nonce: dto.nonce,
        merkleRoot: dto.merkleRoot,
        totalWeight: dto.totalWeight,
        totalCount: dto.totalCount,
        prover: dto.prover,
        snapshotTime: dto.timestamp
    });
    const signingRollupHash = utils.makeEthereumSignedHash(rollupHash);
    const rollupSignature = utils.signEC(privateKey, signingRollupHash);

    const validUntil = parseInt(Date.now() / 1000) + 300;

    const submitHash = utils.makeSubmitSnapshotHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        snapshotTime: dto.timestamp,
        snapshotSignature: rollupSignature.hex,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(submitHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${OPEN_COHORT_ENDPOINT}/cohort/${cohortId}/snapshot/submit`,
        method: 'POST',
        body: {
            validUntil: validUntil,
            snapshotTime: dto.timestamp,
            snapshotSignature: rollupSignature.hex,
            signature: signature.hex
        },
        json: true
    });
    console.log(res);
})();
