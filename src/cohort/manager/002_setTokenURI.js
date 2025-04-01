require("module-alias/register");
const { SILICON_RPC, OPEN_COHORT_ENDPOINT } = require('@config');
const Utils = require("@utils");
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

const Web3 = require('web3');

(async() => {
    const privateKey = process.env.PRIVATE_KEY;

    ////////////////////////////////////
    // CONFIG
    const cohortId = "";
    const tokenURI = ""; // Base64 or url
    ////////////////////////////////////

    const cohortConfig = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/cohort/config`)).data;
    const cohortAddress = cohortConfig.cohort;

    const node = new Web3(SILICON_RPC);
    const cohortABI = utils.getCohortABI();
    const cohort = new node.eth.Contract(cohortABI, cohortAddress);

    const address = utils.getAddress(privateKey);
    const nonce = await node.eth.getTransactionCount(address, "pending");

    const gasPrice = parseInt(parseInt(await node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(await cohort.methods.setTokenURI(cohortId, tokenURI).estimateGas({from: address, to: cohortAddress}) * 1.2);

    const data = cohort.methods.setTokenURI(cohortId, tokenURI).encodeABI();

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
    console.log(`setTokenURI: ${tx.transactionHash}`);
})();
