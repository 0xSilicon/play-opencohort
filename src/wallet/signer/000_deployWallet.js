require('module-alias/register');
const Utils = require("@utils");
const utils = new Utils();

require("dotenv").config();

(async () => {
    // Required Configuration: These values must be provided for the script to work.
    //////////////////////////////////////////////////////////////////////////////////////////
    // It can be freely specified as long as it is 40 characters long, similar to an EVM address.
    // (ex, "0x1111111111111111111111111111111111111111")
    const virtualAddress = "";
    const walletInfo = {
        name: "Test Named Wallet0", // wallet name
        image: "Test Image", // wallet image
        description: "Wallet Description", // wallet description
        rate: 0, // wallet fee rate | MAX: 1000, DENOMINATOR: 10000
    };
    // 
    const properties = {
        category: "1", // wallet category
        // You can add more properties to this object as needed
    };
    //////////////////////////////////////////////////////////////////////////////////////////

    if(!properties.category) {
        throw new Error("Category is required");
    }

    const signer = await utils.getAccount(process.env.PRIVATE_KEY);

    const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(
        (await utils.walletFactory.methods
            .deployWallet(
                virtualAddress,
                walletInfo,
                Object.keys(properties),
                Object.values(properties)
            )
            .estimateGas({ from: signer.address, to: utils.walletFactory._address })) * 1.2
    );

    const data = utils.walletFactory.methods
        .deployWallet(
            virtualAddress,
            walletInfo,
            Object.keys(properties),
            Object.values(properties)
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
    const walletCount = await utils.walletFactory.methods.walletCount(signer.address).call();
    console.log(`* Signer's Wallet Count: ${walletCount}`);
    console.log(`* Signer's Wallet List:`);
    for(let i = 0; i < walletCount; i++) {
        let virtualAddress = await utils.walletFactory.methods.walletList(signer.address, i).call();
        let walletAddress = await utils.walletFactory.methods.computeAddress(signer.address, virtualAddress).call();
        console.log(`Wallet[${i}]: ${virtualAddress}(virtual), ${walletAddress}(wallet)`);
    }
    console.log("================================================================================");
})();
