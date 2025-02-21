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
    const cohortId = "1";
    /////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/cohort/config`)).data;

    const validUntil = parseInt(Date.now() / 1000) + 300;

    const dataHash = utils.makeRemoveAllMembersHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(dataHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${OPEN_COHORT_ENDPOINT}/cohort/${cohortId}/member/remove/all`,
        method: 'POST',
        body: {
            validUntil: validUntil,
            signature: signature.hex
        },
        json: true
    });
    console.log(res);
})();
