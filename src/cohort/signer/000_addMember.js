require("module-alias/register");
const { OPEN_COHORT_ENDPOINT } = require('./config');
const Utils = require("@utils");
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

(async() => {
    const privateKey = process.env.PRIVATE_KEY;

    //////////////////////////////////////////
    // CONFIG
    const cohortId = "";
    const memberDto = {}
    //////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/cohort/config`)).data;

    const addressList = Object.keys(memberDto);
    const weightList = [];
    for(let address of addressList){
        weightList.push(memberDto[address]);
    }

    const validUntil = parseInt(Date.now() / 1000) + 300;

    const dataHash = utils.makeAddMembersHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        cohortId: cohortId,
        addressList: addressList,
        weightList: weightList,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(dataHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${OPEN_COHORT_ENDPOINT}/cohort/${cohortId}/member/add`,
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
