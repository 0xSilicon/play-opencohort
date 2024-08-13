const Utils = require('../lib/utils');
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

(async() => {
    const privateKey = process.env.PRIVATEKEY;
    const openCohort = process.env.OPENCOHORT;

    /////////////////////////////////////////
    // CONFIG
    const cohortId = "";
    const dto = {
        nonce: "",
        merkleRoot: "",
        totalWeight: "",
        totalCount: "",
        prover: 'https://api-cohort.silicon.network',
        snapshotTime: ""
    }
    /////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${api}/cohort/config`)).data;


    const rollupHash = utils.makeRollupHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        nonce: dto.nonce,
        merkleRoot: dto.merkleRoot,
        totalWeight: dto.totalWeight,
        totalCount: dto.totalCount,
        prover: dto.prover,
        snapshotTime: dto.snapshotTime
    });
    const signingRollupHash = utils.makeEthereumSignedHash(rollupHash);
    const rollupSignature = utils.signEC(privateKey, signingRollupHash);

    const validUntil = parseInt(Date.now() / 1000) + 300;

    const submitHash = utils.makeSubmitSnapshotHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        snapshotTime: dto.snapshotTime,
        snapshotSignature: rollupSignature.hex,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(submitHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${api}/cohort/${cohortId}/snapshot/submit`,
        method: 'POST',
        body: {
            validUntil: validUntil,
            snapshotTime: dto.snapshotTime,
            snapshotSignature: rollupSignature.hex,
            signature: signature.hex
        },
        json: true
    });
    console.log(res);
})();
