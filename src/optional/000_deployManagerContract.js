require('module-alias/register');
const { OPEN_COHORT_ENDPOINT } = require('@config');
const Utils = require("@utils");
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

// This script executes the deploySiliconProtocolManager() function.
// For full details and additional functions, refer to the implementation at:
// https://github.com/0xSilicon/opencohort-contracts/blob/main/contracts/deployer/SiliconProtocolManagerDeployer.sol
(async() => {
    const config = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/common/config`)).data;
    const managerDeployerAddress = config.SiliconProtocolManagerDeployer;
    
    const owner = await utils.getAccount(process.env.PRIVATE_KEY);
    const managerDeployer = await utils.getManagerDeployer(managerDeployerAddress);

    // ** Silicon Protocol Manager can only be deployed once. **
    console.log(`* Current Manager Address: ${await managerDeployer.methods.siliconProtocolManager(owner.address).call()}`);

    const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(await managerDeployer.methods.deploySiliconProtocolManager().estimateGas({from: owner.address, to: managerDeployerAddress}) * 1.2);

    const data = managerDeployer.methods.deploySiliconProtocolManager().encodeABI();

    const signedTx = await utils.node.eth.accounts.signTransaction({
        nonce: owner.nonce,
        from: owner.address,
        to: managerDeployerAddress,
        value: 0,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: data
    }, owner.pk);

    const tx = await utils.node.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("==================================== Result ====================================");
    console.log(`* Transaction Hash: ${tx.transactionHash}`);
    console.log(`* Silicon Protocol Manger Address: ${await managerDeployer.methods.siliconProtocolManager(owner.address).call()}`);
    console.log("================================================================================");
})();
