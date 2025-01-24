require('module-alias/register');
const Utils = require("@utils");
const utils = new Utils();

require("dotenv").config();

(async () => {
    const signer = await utils.getAccount(process.env.PRIVATE_KEY);

    // OpenNameTag contract allows you to view the metadata and properties of each wallet.
    let openNameTagContract = await utils.getOpenNameTag();

    console.log("==================================== Wallet View ====================================");
    const walletCount = await utils.walletFactory.methods.walletCount(signer.address).call();
    console.log(`* Signer's Wallet Count: ${walletCount}`);
    console.log(`* Signer's Wallet List:`);
    for(let i = 0; i < walletCount; i++) {
        let virtualAddress = await utils.walletFactory.methods.walletList(signer.address, i).call();
        let walletAddress = await utils.walletFactory.methods.computeAddress(signer.address, virtualAddress).call();
        console.log(`Wallet[${i}]: ${virtualAddress}(virtual), ${walletAddress}(wallet)`);

        let idx = await openNameTagContract.methods._tokenIdOf(walletAddress).call();
        console.log(`- metadata: ${await openNameTagContract.methods.metadata(idx).call()}`);

        let propertyCount = await openNameTagContract.methods.propertyCount(idx).call();
        for(let j = 0; j < propertyCount; j++) {
            let propertyKey = await openNameTagContract.methods.propertyKey(idx, j).call();
            let propertyValue = await openNameTagContract.methods.property(idx, propertyKey).call();
            console.log(`- property[${j}]: ${propertyKey} = ${propertyValue}`);
        }
        
        console.log("================================================================================");
    }
})();
