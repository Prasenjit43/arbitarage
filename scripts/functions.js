const { ethers } = require('ethers');
const wethArtifact = require('../build/WETH9.json');
const erc20Artifact = require('../build/ERC20.json');
const routerArtifacts = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const arbitarageArtifact = require("../build/ArbitarageFlashLoan.json");
const lpArtifact = require('../build/LendingPool.json');
require('dotenv').config();


_DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
_WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
_USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';         // 6 decimals
_ROUTER_UNI_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
_ROUTER_SUSHI_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
_ARBITARAGE_ADDRESS = '0x5E5713a0d915701F464DEbb66015adD62B2e6AE9';
_POOL_ADDRESS_PROVIDER = '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e';
_AAVE_LENDING_POOL = '0x398eC7346DcD622eDc5ae82352F02bE94C62d119';


const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
const wallet = new ethers.Wallet(process.env.HARDHAT_PRIVATE_KEY);
const signer = wallet.connect(provider);

const dai = new ethers.Contract(_DAI_ADDRESS, erc20Artifact.abi, provider);
const weth = new ethers.Contract(_WETH_ADDRESS, wethArtifact.abi, provider);
const usdc = new ethers.Contract(_USDC_ADDRESS, erc20Artifact.abi, provider);
const arbirageContract = new ethers.Contract(_ARBITARAGE_ADDRESS, arbitarageArtifact.abi, provider);
const lpContract = new ethers.Contract(_AAVE_LENDING_POOL, lpArtifact.abi, provider);

module.exports = {
    
    logBalance: async function (_signer) {
        const ethBalance = await provider.getBalance(_signer.address);
        const daiBalance = await dai.balanceOf(_signer.address);
        const wethBalance = await weth.balanceOf(_signer.address);
        const usdcBalance = await usdc.balanceOf(_signer.address);
        console.log('--------------------');
        console.log('ETH Balance    :', ethers.utils.formatUnits(ethBalance, 18));
        console.log('WETH Balance   :', ethers.utils.formatUnits(wethBalance, 18));
        console.log('DAI Balance    :', ethers.utils.formatUnits(daiBalance, 18));
        console.log('USDC Balance   :', ethers.utils.formatUnits(usdcBalance, 6));
        console.log('--------------------');
    },
    providers: function () {
        return {
            provider,
            signer
          };
    },
    POOL_ADDRESS_PROVIDER : _POOL_ADDRESS_PROVIDER,
    DAI_ADDRESS : _DAI_ADDRESS,
    WETH_ADDRESS : _WETH_ADDRESS,
    USDC_ADDRESS : _USDC_ADDRESS,      
    ROUTER_UNI_ADDRESS : _ROUTER_UNI_ADDRESS,
    ROUTER_SUSHI_ADDRESS : _ROUTER_SUSHI_ADDRESS,
    AAVE_LENDING_POOL : _AAVE_LENDING_POOL,
    lpContract : lpContract,
    arbitarage: arbirageContract,
    dai : dai,
    weth : weth,
    usdc : usdc

    
};