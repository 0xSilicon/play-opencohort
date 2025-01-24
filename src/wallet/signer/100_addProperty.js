require("module-alias/register");
const Utils = require("@utils");
const utils = new Utils();

require("dotenv").config();

(async () => {
    // Required Configuration: These values must be provided for the script to work.
    //////////////////////////////////////////////////////////////////////////////////////////
    const walletAddress = "";
    const properties = {
        propertyKey: "propertyValue",
    };
    //////////////////////////////////////////////////////////////////////////////////////////

    const wallet = await utils.getWallet(walletAddress);
    const signer = await utils.getAccount(process.env.PRIVATE_KEY);

    const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(
        (await wallet.methods
            .addPropertyBatch(
                Object.keys(properties),
                Object.values(properties)
            )
            .estimateGas({ from: signer.address, to: walletAddress })) * 1.2
    );

    const data = wallet.methods
        .addPropertyBatch(Object.keys(properties), Object.values(properties))
        .encodeABI();

    const signedTx = await utils.node.eth.accounts.signTransaction(
        {
            nonce: signer.nonce,
            from: signer.address,
            to: walletAddress,
            value: 0,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            data: data,
        },
        signer.pk
    );

    console.log("==================================== Result ====================================");
    const tx = await utils.node.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`* Transaction Hash: ${tx.transactionHash}`);
    console.log("================================================================================");
})();
