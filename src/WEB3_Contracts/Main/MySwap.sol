// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;

import '../../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol';
import './IApprovalClient.sol';
import './ApprovalService.sol';

contract MySwap is IApprovalClient {
    address payable private owner;
    ApprovalService private service;
    IERC20 private token0;
    IERC20 private token1;
    
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 private constant PRECISION = 1e18;
    uint256 public currentPrice;
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut);
    event Result(address indexed user, address tokenOut, uint256 amountOut);
    
    constructor(
        ApprovalService service_,
        IERC20 token0_,
        IERC20 token1_
    ) {
        owner = payable(msg.sender);
        service = service_;
        token0 = token0_;
        token1 = token1_;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, 'Not authorized');
        _;
    }
    
    modifier onlyService() {
        require(msg.sender == address(service), 'Not authorized');
        _;
    }
    
    function withdraw() external onlyOwner {
        owner.transfer(address(this).balance);
        token0.transfer(owner, token0.balanceOf(address(this)));
        token1.transfer(owner, token1.balanceOf(address(this)));
    }
    
    function subscribe() external onlyOwner {
        uint256 subscription_fee = service.subscription_fee();
        require(subscription_fee <= address(this).balance, 'Insufficient funds for subscription');
        service.subscribe{ value: subscription_fee }();
    }
    
    function unsubscribe() external onlyOwner {
        service.unsubscribe();
    }
    
    // Initialize pool with initial liquidity
    function initializePool(uint256 amount0, uint256 amount1) external onlyOwner {
        require(reserve0 == 0 && reserve1 == 0, "Pool already initialized");
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");
        
        require(token0.transferFrom(msg.sender, address(this), amount0), "Transfer of token0 failed");
        require(token1.transferFrom(msg.sender, address(this), amount1), "Transfer of token1 failed");
        
        reserve0 = amount0;
        reserve1 = amount1;
        
        currentPrice = (reserve1 * PRECISION) / reserve0;

        emit LiquidityAdded(msg.sender, amount0, amount1);
    }
    
    // Add liquidity to the pool
    function addLiquidity(uint256 amount0, uint256 amount1) external onlyOwner {
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");
        
        require(token0.transferFrom(msg.sender, address(this), amount0), "Transfer of token0 failed");
        require(token1.transferFrom(msg.sender, address(this), amount1), "Transfer of token1 failed");
        
        reserve0 += amount0;
        reserve1 += amount1;

        currentPrice = (reserve1 * PRECISION) / reserve0;
        
        emit LiquidityAdded(msg.sender, amount0, amount1);
    }
    
    
    // Calculate output amount based on x * y = k formula
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public 
        pure 
        returns (uint256) 
    {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        
        return numerator / denominator;
    }
    
    // Implementation of IApprovalClient interface
    function onApproval(
        address approver,
        address approved_token,
        uint256 amount
    ) external onlyService {
        require(approved_token == address(token0) || approved_token == address(token1), 'Token not supported');
        require(amount == IERC20(approved_token).allowance(approver, address(this)), 'Approved amount mismatch');
        require(amount <= IERC20(approved_token).balanceOf(approver), 'Insufficient tokens');
        
        // Determine which token is being swapped
        bool isToken0 = approved_token == address(token0);
        uint256 currentReserveIn = isToken0 ? reserve0 : reserve1;
        uint256 currentReserveOut = isToken0 ? reserve1 : reserve0;
        
        // Calculate swap amount
        uint256 amountOut = getAmountOut(amount, currentReserveIn, currentReserveOut);
        require(amountOut > 0, "Insufficient output amount");
        
        // Execute swap
        assert(IERC20(approved_token).transferFrom(approver, address(this), amount));
        
        IERC20 tokenOut = isToken0 ? token1 : token0;
        assert(tokenOut.transfer(approver, amountOut));
        
        // Update reserves
        if (isToken0) {
            reserve0 += amount;
            reserve1 -= amountOut;
        } else {
            reserve1 += amount;
            reserve0 -= amountOut;
        }

        currentPrice = (reserve1 * PRECISION) / reserve0;
                
        emit Swap(approver, amount, amountOut, approved_token, address(tokenOut));
        emit Result(approver, address(tokenOut), amountOut);
    }
    
    function settle(
        uint256 amount
    ) external onlyService {
        require(amount <= address(this).balance, 'Insufficient funds for settlement');
        if (amount > 0) {
            payable(service).transfer(amount);
        }
    }
    
    receive() external payable {
    }
}