const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { ethers, network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const apniDukan = await ethers.getContract("ApniDukan")
    fs.writeFileSync(frontEndAbiFile, apniDukan.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const apniDukan = await ethers.getContract("ApniDukan")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(apniDukan.address)) {
            contractAddresses[network.config.chainId.toString()].push(apniDukan.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [apniDukan.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
