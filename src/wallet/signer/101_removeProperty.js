require("module-alias/register");
const Utils = require("@utils");
const utils = new Utils();

require("dotenv").config();

const Web3 = require("web3");

(async () => {
    // Required Configuration: These values must be provided for the script to work.
    //////////////////////////////////////////////////////////////////////////////////////////
    const walletAddress = "0x88049eccAFfBc68aAd449f48C8948bAF1B84b087";
    const targetPropertyKey = "propertyKey";
    //////////////////////////////////////////////////////////////////////////////////////////

    const wallet = await utils.getWallet(walletAddress);
    const signer = await utils.getAccount(process.env.PRIVATE_KEY);

    const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(
        (await wallet.methods
            .removeProperty(targetPropertyKey)
            .estimateGas({ from: signer.address, to: walletAddress })) * 1.2
    );

    const data = wallet.methods.removeProperty(targetPropertyKey).encodeABI();

    const txData = {
        nonce: signer.nonce,
        from: signer.address,
        to: walletAddress,
        value: 0,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: data,
    };

    const signedTx = await utils.node.eth.accounts.signTransaction(
        txData,
        signerPrivateKey
    );
    const tx = await utils.node.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("==================================== Result ====================================");
    console.log(`* Transaction Hash: ${tx.transactionHash}`);
    console.log("================================================================================");
})();
