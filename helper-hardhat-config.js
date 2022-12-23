const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
    },
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
    },
}

const localChains = ["hardhat", "localhost"]
const frontEndContractsFile = "../front-end/constants/contractAddresses.json"
const frontEndAbiFile = "../front-end/constants/abi.json"

module.exports = {
    networkConfig,
    localChains,
    frontEndContractsFile,
    frontEndAbiFile,
}
