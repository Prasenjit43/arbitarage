const { ethers } = require('ethers');
const {
    providers,
    DAI_ADDRESS,
    USDC_ADDRESS,
    ROUTER_UNI_ADDRESS,
    ROUTER_SUSHI_ADDRESS,
    arbitarage,
    logBalance
} = require("./functions");
require('dotenv').config();
const { signer } = providers();

const flashLoanFunc = async () => {
    /**************************** */
    console.log("Balances of Signer before flash loan");
    await logBalance(signer);
    console.log("Balances of Flash Loan Contract before flash loan");
    await logBalance(arbitarage);

    console.log("************ Start of Flash Loan **************")
    const tx3 = await arbitarage.connect(signer).fn_requestLoan(
        DAI_ADDRESS,
        USDC_ADDRESS,
        ROUTER_UNI_ADDRESS,
        ROUTER_SUSHI_ADDRESS,
        ethers.utils.parseEther("100"),
        {
            gasLimit: 1000000,
        }
    );
    await tx3.wait();

    console.log("Balances of Signer after flash loan");
    await logBalance(signer);
    console.log("Balances of Flash Loan Contract after flash loan");
    await logBalance(arbitarage);
}

async function main() {
    await flashLoanFunc();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
