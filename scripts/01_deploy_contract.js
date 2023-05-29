const poolAddrProviderArtifact = require("../build/PoolAddressesProvider.json");
const arbitarageArtifact = require("../build/ArbitarageFlashLoan.json");
const { ethers } = require('ethers');
const { POOL_ADDRESS_PROVIDER , providers, lpContract, DAI_ADDRESS} = require('./functions');
require('dotenv').config();

const { provider, signer } = providers();
const poolAddrProvider = new ethers.Contract(POOL_ADDRESS_PROVIDER, poolAddrProviderArtifact.abi, provider);

const deploySimpleFlashLoanContract = async () => {
    const ArbitarageFlashLoan = new ethers.ContractFactory(arbitarageArtifact.abi, arbitarageArtifact.bytecode, signer);
    const arbitarageFlashLoan = await ArbitarageFlashLoan.deploy(poolAddrProvider.address);
    await arbitarageFlashLoan.deployed();
    console.log("Arbitarage Flash Loan contract : ", arbitarageFlashLoan.address);
    console.log("DAI Total Liquidity  : ",((await lpContract.getReserveData(DAI_ADDRESS)).totalLiquidity).toString());
    console.log("DAI Avaliable Liquidity : ",((await lpContract.getReserveData(DAI_ADDRESS)).availableLiquidity).toString());

}

async function main() {
    await deploySimpleFlashLoanContract();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
