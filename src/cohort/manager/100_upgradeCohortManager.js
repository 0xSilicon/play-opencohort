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
    const managerAddress = ""; // Your manager address
    ////////////////////////////////////

    const config = await utils.getCommonConfig();
    const managerDeployerAddress = config.SiliconProtocolManagerDeployer;
    
    const owner = await utils.getAddress(privateKey);
    console.log(`owner: ${owner}`)
    const managerDeployer = await utils.getManagerDeployer(managerDeployerAddress);

    console.log(`* Manager Address deployed by ${owner}: ${managerAddress}`);

    const node = new Web3(SILICON_RPC);
    const managerABI = utils.getSiliconProtocolManagerABI()
    const manager = new node.eth.Contract(managerABI, managerAddress);
    const initializeArgs = [
        owner,
        config.Cohort,
        config.OpenNameTag,
        config.NamedWalletFactory,
    ];

    const initData = manager.methods.initialize(...initializeArgs).encodeABI();

    const managerImpl = await managerDeployer.methods.siliconProtocolManagerImplementation().call();

    const upgradeToAndCallArgs = [
        managerImpl,
        initData
    ];

    console.log(`prev version: ${await manager.methods.version().call()}`)
    const nonce = await node.eth.getTransactionCount(owner, "pending");

    const gasPrice = parseInt(parseInt(await node.eth.getGasPrice()) * 1.5);
    const gasLimit = parseInt(await manager.methods.upgradeToAndCall(...upgradeToAndCallArgs).estimateGas({from: owner, to: managerAddress}) * 1.2);

    const data = manager.methods.upgradeToAndCall(...upgradeToAndCallArgs).encodeABI();

    const txData = {
        nonce: nonce,
        from: owner,
        to: managerAddress,
        value: 0,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: data
    };

    const signedTx = await node.eth.accounts.signTransaction(txData, privateKey);
    const tx = await node.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`mintCohort: ${tx.transactionHash}`);

    console.log(`new version: ${await manager.methods.version().call()}`)
})();
