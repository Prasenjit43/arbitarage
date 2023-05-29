# Arbitrage Flash Loan

This Solidity smart contract implements an arbitrage flash loan strategy. It utilizes flash loans to perform arbitrage between two decentralized exchanges, UniSwap and SushiSwap.

## Overview

The contract is designed to run on the Ethereum blockchain and uses the Aave V3 lending protocol for flash loans. It takes advantage of price differences between two tokens on UniSwap and SushiSwap to generate profits.

The contract works as follows:

1. It imports the necessary libraries and interfaces for interacting with Aave V3, UniSwap, and SushiSwap.
2. The `ArbitarageFlashLoan` contract extends the `FlashLoanSimpleReceiverBase` contract provided by Aave V3.
3. The `fn_requestLoan` function is used to initiate a flash loan. It takes the addresses of the two tokens to arbitrage, the UniSwap and SushiSwap router addresses, and the loan amount as parameters.
4. Inside the `fn_requestLoan` function, the `arbitrage` function is called internally.
5. The `arbitrage` function performs the arbitrage strategy by executing token swaps on UniSwap and SushiSwap.
6. The function approves the required token amounts for swapping on the respective routers.
7. It performs a token swap on UniSwap, swapping the first token for the second token.
8. Then, it performs a token swap on SushiSwap, swapping the second token back to the first token.
9. The contract emits events to log the token amounts and the contract's token balances before and after each swap.
10. After completing the arbitrage, the contract returns the flash loan along with the premium to the Aave lending pool.

## Usage

1. Deploy the `ArbitarageFlashLoan` contract on the Ethereum network, providing the address of the Aave V3 pool addresses provider as a constructor parameter.
2. Call the `fn_requestLoan` function, passing the token addresses, UniSwap and SushiSwap router addresses, and the loan amount.
3. The contract will execute the arbitrage strategy and return the flash loan along with the premium to the Aave lending pool.

Please note that this contract is for educational purposes and should not be used in a production environment without thorough testing and auditing.


## Execution Steps

To use the arbitrage flash loan contract, follow the steps below in the given order:

1. Execute the `01_deploy_contract.js` script. This script will deploy the arbitrage flash loan contract on the local hardhat network.

2. Update the `_ARBITRAGE_ADDRESS` variable in the `functions.js` file. Set it to the address of the deployed arbitrage flash loan contract.

3. Execute the `02_mint_tokens.js` script. This script will mint tokens needed for the flash loan and ensure that you have sufficient token balances for the arbitrage.

4. Execute the `03_apply_flashloan.js` script. This script will trigger the flash loan process by calling the `fn_requestLoan` function of the arbitrage flash loan contract. It will perform the arbitrage between UniSwap and SushiSwap and return the flash loan along with the premium to the Aave lending pool.

Make sure to run all the scripts using the `npx hardhat run` command followed by the respective script file name.

Please note that you may need to modify the scripts or contract addresses according to your specific setup and requirements. Additionally, ensure that you have a properly configured development environment with the necessary dependencies and access to the Hardhat network.
