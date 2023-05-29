// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//When running in brower
// import "https://github.com/aave/aave-v3-core/blob/master/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
// import "https://github.com/aave/aave-v3-core/blob/master/contracts/interfaces/IPoolAddressesProvider.sol";
// import "https://github.com/aave/aave-v3-core/blob/master/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

//When running with VScode
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//import "https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router02.sol";
//import "https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router02.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract ArbitarageFlashLoan is FlashLoanSimpleReceiverBase {
    event LogFlashLoan(
        address _addr1,
        address _addr2,
        address _addr3,
        address _addr4
    );
    event LogExecuteOperation(
        address _addr1,
        address _addr2,
        address _addr3,
        address _addr4
    );
    event LogArbitarage(
        address _addr1,
        address _addr2,
        address _addr3,
        address _addr4,
        address _sender,
        uint256 _balance,
        uint256 _allowance
    );
    event LogAmounts(uint256 _amount0, uint256 amount1);
    event LogFlashLoanBalance(string _str, address _addr, uint256 _amount);

    address payable public owner;

    constructor(
        address _addressProvider
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = payable(msg.sender);
    }

    function fn_requestLoan(
        address _token0,
        address _token1,
        address _uniSwapRouter,
        address _sushiSwapRouter,
        uint256 _amount
    ) public {
        //IUniswapV2Router02(_uniSwapRouter);
        address _receiverAddress = address(this);
        address _asset = _token0;
        uint256 amount = _amount;
        bytes memory _params = abi.encode(
            _token0,
            _token1,
            _uniSwapRouter,
            _sushiSwapRouter
        );
        //string memory msg = "Inside requestLoan $$$ " + _token0 + "$$$" + _token1 + "$$$" + _uniSwapRouter + "$$$" + _sushiSwapRouter;
        emit LogFlashLoan(_token0, _token1, _uniSwapRouter, _sushiSwapRouter);
        emit LogFlashLoanBalance(
            "Before flash loan",
            address(this),
            IERC20(_token0).balanceOf(address(this))
        );
        emit LogFlashLoanBalance(
            "Before flash loan",
            address(this),
            IERC20(_token1).balanceOf(address(this))
        );
        uint16 _referralCode = 0;
        POOL.flashLoanSimple(
            _receiverAddress,
            _asset,
            amount,
            _params,
            _referralCode
        );
    }

    function arbitrage(
        address _token0,
        address _token1,
        address _uniSwapRouter,
        address _sushiSwapRouter,
        uint256 _amountIn
    ) internal returns (bool) {
        //UNISwap
        IERC20(_token0).approve(_uniSwapRouter, _amountIn);
        address[] memory path_uni_sushi;
        path_uni_sushi = new address[](2);
        path_uni_sushi[0] = _token0;
        path_uni_sushi[1] = _token1;

        emit LogArbitarage(
            path_uni_sushi[0],
            path_uni_sushi[1],
            _uniSwapRouter,
            _sushiSwapRouter,
            msg.sender,
            IERC20(_token0).balanceOf(address(this)),
            IERC20(_token0).allowance(address(this), _uniSwapRouter)
        );

        uint256[] memory amounts_uni_sushi = IUniswapV2Router(_uniSwapRouter)
            .swapExactTokensForTokens(
                _amountIn,
                0, //amountOutMin
                path_uni_sushi,
                address(this), //msg.sender,
                block.timestamp
            );

        emit LogAmounts(amounts_uni_sushi[0], amounts_uni_sushi[1]);
        emit LogFlashLoanBalance(
            "After uniSwap",
            address(this),
            IERC20(_token0).balanceOf(address(this))
        );
        emit LogFlashLoanBalance(
            "After uniSwap",
            address(this),
            IERC20(_token1).balanceOf(address(this))
        );

        // //Sushi Swap
        uint256 amountInMax = amounts_uni_sushi[1] +
            ((amounts_uni_sushi[1] * 10) / 100);
        IERC20(_token1).approve(_sushiSwapRouter, amountInMax);
        address[] memory path_sushi_uni;
        path_sushi_uni = new address[](2);
        path_sushi_uni[0] = _token1;
        path_sushi_uni[1] = _token0;

        uint256[] memory amounts_sushi_uni = IUniswapV2Router(_sushiSwapRouter)
            .swapTokensForExactTokens(
                _amountIn,
                amountInMax,
                path_sushi_uni,
                address(this),
                block.timestamp
            );
        emit LogAmounts(amounts_sushi_uni[0], amounts_sushi_uni[1]);
        emit LogFlashLoanBalance(
            "After sushiSwap",
            address(this),
            IERC20(_token0).balanceOf(address(this))
        );
        emit LogFlashLoanBalance(
            "After sushiSwap",
            address(this),
            IERC20(_token1).balanceOf(address(this))
        );

        IERC20(_token1).approve(_sushiSwapRouter, 0);

        return true;
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // uint256 totalAmount = amount + premium;

        (
            address token0,
            address token1,
            address uniSwapRouter,
            address sushiSwapRouter
        ) = abi.decode(params, (address, address, address, address));
        emit LogExecuteOperation(
            token0,
            token1,
            uniSwapRouter,
            sushiSwapRouter
        );
        emit LogFlashLoanBalance(
            "After flash loan",
            address(this),
            IERC20(token0).balanceOf(address(this))
        );
        emit LogFlashLoanBalance(
            "After flash loan",
            address(this),
            IERC20(token1).balanceOf(address(this))
        );
        arbitrage(token0, token1, uniSwapRouter, uniSwapRouter, amount);

        uint256 totalAmount = amount + premium;
        IERC20(asset).approve(address(POOL), totalAmount);

        return true;
    }
}
