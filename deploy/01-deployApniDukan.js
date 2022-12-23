const { deepCopy } = require("ethers/lib/utils")
const { network } = require("hardhat")
// const { localChains } = require("../helper-hardhat-config");

// contract deployed on Goerli network at : 0xE4655656b6DeF64fB273BF426617fE0EC5EEb001
// verified contract : https://goerli.etherscan.io/address/0xE4655656b6DeF64fB273BF426617fE0EC5EEb001#code

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // console.log(deployer);

    await deploy("ApniDukan", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("ApniDukan deployed ...!")
    log("*********************")
    console.log()
}

module.exports.tags = ["apniDukan"]
