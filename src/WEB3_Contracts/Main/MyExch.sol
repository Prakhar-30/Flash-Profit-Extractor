// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;

import '../../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol';
import './IApprovalClient.sol';
import './ApprovalService.sol';

interface IDynamicPriceERC20 is IERC20 {
    function mintPrice() external view returns (uint256);
    function Cost(uint256 amount) external view returns (uint256);
}

contract MyExch is IApprovalClient {
    address payable private owner;
    ApprovalService private service;
    IDynamicPriceERC20 private immutable token;
    
    constructor(
        ApprovalService service_,
        address tokenAddress
    ) {
        owner = payable(msg.sender);
        service = service_;
        token = IDynamicPriceERC20(tokenAddress);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, 'Not authorized');
        _;
    }
    
    modifier onlyService() {
        require(msg.sender == address(service), 'Not authorized');
        _;
    }
    
    function withdrawEther() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No Ether available to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Ether withdrawal failed");
    }
    
    function withdraw() external onlyOwner {
        // Withdraw Ether
        if(address(this).balance > 0) {
            (bool success, ) = owner.call{value: address(this).balance}("");
            require(success, "Ether withdrawal failed");
        }
        
        // Withdraw tokens
        uint256 tokenBalance = token.balanceOf(address(this));
        if(tokenBalance > 0) {
            require(token.transfer(owner, tokenBalance), "Token transfer failed");
        }
    }
    
    function subscribe() external onlyOwner {
        uint256 subscription_fee = service.subscription_fee();
        require(subscription_fee <= address(this).balance, 'Insufficient funds for subscription');
        service.subscribe{value: subscription_fee}();
    }
    
    function unsubscribe() external onlyOwner {
        service.unsubscribe();
    }
    
    function onApproval(
        address approver,
        address approved_token,
        uint256 amount
    ) external onlyService {
        require(approved_token == address(token), 'Token not supported');
        
        // Verify approval and balance
        require(amount == token.allowance(approver, address(this)), 'Approved amount mismatch');
        require(amount <= token.balanceOf(approver), 'Insufficient tokens');
        
        // Calculate ETH to return based on token's Cost function
        uint256 ethToReturn = token.Cost(amount);
        require(ethToReturn <= address(this).balance, 'Insufficient funds for payout');
        
        // Transfer tokens first
        require(token.transferFrom(approver, address(this), amount), "Token transfer failed");
        
        // Then transfer ETH to the approver
        (bool success, ) = payable(approver).call{value: ethToReturn}("");
        require(success, "ETH transfer failed");
    }
    
    function settle(
        uint256 amount
    ) external onlyService {
        require(amount <= address(this).balance, 'Insufficient funds for settlement');
        if (amount > 0) {
            (bool success, ) = payable(address(service)).call{value: amount}("");
            require(success, "Settlement transfer failed");
        }
    }
    
    receive() external payable {}
}