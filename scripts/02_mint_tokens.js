const { ethers } = require('ethers');
const routerArtifacts = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const {
    providers,
    DAI_ADDRESS,
    WETH_ADDRESS,
    USDC_ADDRESS,
    ROUTER_UNI_ADDRESS,
    arbitarage,
    logBalance,
    weth,
    dai,
    usdc
} = require("./functions");
require('dotenv').config();


const { provider, signer } = providers();
const uniRouter = new ethers.Contract(ROUTER_UNI_ADDRESS, routerArtifacts.abi, provider);

const mintWETHToken = async () => {
    /******* Adding WETH TOKEN to signer *******/
    await signer.sendTransaction({
        to: WETH_ADDRESS,
        value: ethers.utils.parseUnits('10', 18)
    });
}

const swap_WETH_TOKEN = async (_amount, _tokenAddress) => {
    /******** Converting WETH to TOKEN for Flash loan ********/
    const amountIn = ethers.utils.parseUnits(_amount.toString(), 18);
    const tx1 = await weth.connect(signer).approve(uniRouter.address, amountIn);
    await tx1.wait();

    const tx2 = await uniRouter.connect(signer).swapExactTokensForTokens(
        amountIn,
        0,
        [WETH_ADDRESS, _tokenAddress],
        signer.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        {
            gasLimit: 1000000,
        }
    )
    await tx2.wait();
}

async function main() {
    console.log("/********* Minting WETH Token *************/")
    await mintWETHToken();
    console.log("/********* Before WETH - DAI SWAP *************/")
    await logBalance(signer);
    await swap_WETH_TOKEN(1, DAI_ADDRESS);
    console.log("/********* Before WETH - USDC SWAP *************/")
    await logBalance(signer);
    await swap_WETH_TOKEN(1, USDC_ADDRESS);
    console.log("/********* AFTER WETH - USDC SWAP *************/")
    await logBalance(signer);
    console.log("/********* Before DAI, USDC Transfer to Arbitarage Contract *************/")
    await logBalance(arbitarage);
    await dai.connect(signer).transfer(arbitarage.address, ethers.utils.parseEther("300"));
    await usdc.connect(signer).transfer(arbitarage.address, ethers.utils.parseUnits("100", 6));
    console.log("/********* After DAI, USDC Transfer to Arbitarage Contract *************/")
    await logBalance(arbitarage);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});