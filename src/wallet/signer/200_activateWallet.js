require('module-alias/register');
const Utils = require("@utils");
const utils = new Utils();

require("dotenv").config();

const Web3 = require("web3");

(async () => {
    // Required Configuration: These values must be provided for the script to work.
    //////////////////////////////////////////////////////////////////////////////////////////
    const virtualAddress = "0x1111111111111111111111111111111111111111";
    const newOwnerAddress = "" // new wallet owner address
    //////////////////////////////////////////////////////////////////////////////////////////

    const signer = await utils.getAccount(process.env.PRIVATE_KEY);
    const wallet = await utils.getWallet(walletAddress);

    let walletAddress = await utils.walletFactory.methods.computeAddress(signer.address, virtualAddress).call();

    console.log(`* Current Wallet(${walletAddress}) Owner Address: ${await wallet.methods.owner().call()}`);

    const dataHash = await utils.walletFactory.methods.getDataHash(virtualAddress, newOwnerAddress).call();
    const signingHash = utils.makeEthereumSignedHash(dataHash);
    const signature = utils.signEC(signer.pk, signingHash);

    const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(
        (await utils.walletFactory.methods
            .activateWallet(
                signer.address,
                virtualAddress,
                newOwnerAddress,
                signature.hex
            )
            .estimateGas({ from: signer.address, to: utils.walletFactory._address })) * 1.2
    );

    const data = utils.walletFactory.methods
        .activateWallet(
            signer.address,
            virtualAddress,
            newOwnerAddress,
            signature.hex
        )
        .encodeABI();

    const signedTx = await utils.node.eth.accounts.signTransaction(
        {
            nonce: signer.nonce,
            from: signer.address,
            to: utils.walletFactory._address,
            value: 0,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            data: data,
        },
        signer.pk
    );
    const tx = await utils.node.eth.sendSignedTransaction(signedTx.rawTransaction);

    

    console.log("==================================== Result ====================================");
    console.log(`* Transaction Hash: ${tx.transactionHash}`);
    console.log(`* New Wallet(${walletAddress}) Owner Address: ${await wallet.methods.owner().call()}`);
    console.log("================================================================================");
})();
