const Utils = require('../lib/utils');
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

const Web3 = require('web3');

(async() => {
    const privateKey = process.env.PRIVATEKEY;
    const silicon = process.env.SILICON;
    const openCohort = process.env.OPENCOHORT;

    ////////////////////////////////////
    // CONFIG
    const cohortId = "0";
    const grantee = "0x0000000000000000000000000000000000000000";
    const grantRate = "0"; // MAX: 1000, DENOMINATOR: 10000
    ////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${openCohort}/cohort/config`)).data;
    const cohortAddress = cohortConfig.cohort;

    const node = new Web3(silicon);
    const cohortABI = utils.getCohortABI();
    const cohort = new node.eth.Contract(cohortABI, cohortAddress);

    const grantConfig = [grantRate, grantee]

    const address = utils.getAddress(privateKey);
    const nonce = await node.eth.getTransactionCount(address, "pending");

    const gasPrice = parseInt(parseInt(await node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(await cohort.methods.setCohortGrant(cohortId, grantConfig).estimateGas({from: address, to: cohortAddress}) * 1.2);

    const data = cohort.methods.setCohortGrant(cohortId, grantConfig).encodeABI();

    const txData = {
        nonce: nonce,
        from: address,
        to: cohortAddress,
        value: 0,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: data
    };

    const signedTx = await node.eth.accounts.signTransaction(txData, privateKey);
    const tx = await node.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`setCohortGrant: ${tx.transactionHash}`);
})();
