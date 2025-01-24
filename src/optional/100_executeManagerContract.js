require('module-alias/register');
const Utils = require("@utils");
const utils = new Utils();
const request = require('request-promise');

require("dotenv").config();

// For more functions and details, refer to the full implementation at:
// https://github.com/0xSilicon/opencohort-contracts/blob/main/contracts/utils/SiliconProtocolManager.sol

(async() => {
    try {
        /////////////////////////////////////////
        // Declare method name and parameters
        let methodName = ""; // Name of the contract method to call
        let methodParams = []; // Parameters for the contract method

        // Example 1: Using the setSigner Function
        // The setSigner function allows the owner to set the validity of a signer. 
        //
        // Example Usage:
        // let methodName = "setSigner";
        // let methodParams = ["0xSignerAddressHere", true];

        // Example 2: Using the setCohortGrant Function
        // To grant a cohort with tokenId 123 to a grantee with a rate of 500 (representing 5%):
        //
        // Example Usage:
        // let methodName = "setCohortGrant";
        // let methodParams = [123, { rate: 500, grantee: "0xGranteeAddressHere" }];
        /////////////////////////////////////////
        
        const config = JSON.parse(await request.get(`${OPEN_COHORT_ENDPOINT}/common/config`)).data;
        const managerDeployerAddress = config.SiliconProtocolManagerDeployer;
        
        const owner = await utils.getAccount(process.env.PRIVATE_KEY);
        const managerDeployer = await utils.getManagerDeployer(managerDeployerAddress);

        const managerAddress = await managerDeployer.methods.cohortManager(owner.address).call();
        console.log(`* Manager Address deployed by ${owner.address}: ${await managerDeployer.methods.siliconProtocolManager(owner.address).call()}`);

        const manager = await utils.getManager(managerAddress);

        
        const gasPrice = parseInt(parseInt(await utils.node.eth.getGasPrice()) * 1.5);
        const gasLimit = parseInt(await manager.methods[methodName](...methodParams).estimateGas({from: owner.address, to: managerDeployerAddress}) * 1.2);

        const data = manager.methods[methodName](...methodParams).encodeABI();

        const signedTx = await utils.node.eth.accounts.signTransaction({
            nonce: owner.nonce,
            from: owner.address,
            to: managerAddress,
            value: 0,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            data: data
        }, owner.pk);

        const tx = await utils.node.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log("==================================== Result ====================================");
        console.log(`* Transaction Hash: ${tx.transactionHash}`);
        console.log("================================================================================");
    } catch (error) {
        console.error("Error executing contract method:", error);
        throw error;
    }
})();
