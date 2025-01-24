require("module-alias/register");
const { OPEN_COHORT_ENDPOINT } = require('@config');
const Utils = require("@utils");
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

(async() => {
    const privateKey = process.env.PRIVATE_KEY;

    /////////////////////////////////////////
    // CONFIG: signer & identity list
    const signer = "";
    const dto = {}
    /////////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/cohort/config`)).data;

    const identities = {}
    const identityList = [];
    const addressList = [];
    const signatureList = [];
    for(let identity in dto){
        let address = dto[identity];
        const identityHash = utils.makeIdentityHash({
            cohort: cohortConfig.cohort,
            chainId: cohortConfig.chainId,
            uniqueKey: identity,
            beneficiary: address
        });
        const signingIdentityHash = utils.makeEthereumSignedHash(identityHash);
        const identitySignature = utils.signEC(privateKey, signingIdentityHash);

        identities[identity] = [address, identitySignature.hex];
        identityList.push(identity);
        addressList.push(address);
        signatureList.push(identitySignature.hex);
    }

    const validUntil = parseInt(Date.now() / 1000) + 300;

    const dataHash = utils.makeUpdateIdentityHash({
        cohort: cohortConfig.cohort,
        chainId: cohortConfig.chainId,
        identityList: identityList,
        addressList: addressList,
        signatureList: signatureList,
        validUntil: validUntil
    });
    const signingHash = utils.makeEthereumSignedHash(dataHash);
    const signature = utils.signEC(privateKey, signingHash);

    let res = await request({
        url: `${OPEN_COHORT_ENDPOINT}/identity/update`,
        method: 'POST',
        body: {
            validUntil: validUntil,
            signature: signature.hex,
            signer: signer,
            identities: identities
        },
        json: true
    });
    console.log(res);
})();
