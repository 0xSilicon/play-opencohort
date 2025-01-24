require("module-alias/register");
const Utils = require("@utils");
const utils = new Utils();

require("dotenv").config();

(async () => {
    // Required Configuration: These values must be provided for the script to work.
    //////////////////////////////////////////////////////////////////////////////////////////
    const walletAddress = "";

    const toAddress = "";
    const amount = 0; // in wei
    const isNative = true; // true: native, false: erc20
    const tokenAddress = ""; // flll if isNative is 'false'
    //////////////////////////////////////////////////////////////////////////////////////////

    const walletOwner = await utils.getAccount(process.env.PRIVATE_KEY);
    const wallet = await utils.getWallet(walletAddress);

    console.log(`* Current Wallet(${walletAddress}) Owner Address: ${await wallet.methods.owner().call()}`);

    let params;
    let transferFunction;
    if (isNative) {
        transferFunction = "transfer";
        params = [toAddress, amount];
    } else {
        transferFunction = "transferTokenTo";
        params = [tokenAddress, toAddress, amount];
    }

    const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt((await utils.walletFactory.methods[transferFunction](...params).estimateGas({ from: walletOwner.address, to: walletAddress })) * 1.2);

    const data = utils.walletFactory.methods[transferFunction](...params).encodeABI();

    const signedTx = await utils.node.eth.accounts.signTransaction(
        {
            nonce: walletOwner.nonce,
            from: walletOwner.address,
            to: walletAddress,
            value: 0,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            data: data,
        },
        walletOwner.pk
    );
    const tx = await utils.node.eth.sendSignedTransaction(
        signedTx.rawTransaction
    );

    console.log("==================================== Result ====================================");
    console.log(`* Transaction Hash: ${tx.transactionHash}`);
    console.log("================================================================================");
})();
