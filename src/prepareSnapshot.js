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
    /////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${openCohort}/cohort/config`)).data;

    const snapshotTime = parseInt(Date.now() / 1000);
    const validUntil = parseInt(Date.now() / 1000) + 300;

    const dataHash = utils.makePrepareSnapshotHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        snapshotTime: snapshotTime,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(dataHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${openCohort}/cohort/${cohortId}/snapshot/prepare`,
        method: 'POST',
        body: {
            snapshotTime: snapshotTime,
            validUntil: validUntil,
            signature: signature.hex,
        },
        json: true
    });
    console.log(res);
})();
