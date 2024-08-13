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
    const memberDto = [];
    /////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${openCohort}/cohort/config`)).data;

    const validUntil = parseInt(Date.now() / 1000) + 300;

    const dataHash = utils.makeRemoveMembersHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        members: memberDto,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(dataHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${openCohort}/cohort/${cohortId}/member/remove`,
        method: 'POST',
        body: {
            validUntil: validUntil,
            signature: signature.hex,
            members: memberDto
        },
        json: true
    });
    console.log(res);
})();
