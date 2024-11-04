// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;

import './IApprovalClient.sol';
import './ApprovalService.sol';
import '../../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol';

interface IDynamicPriceERC20 is IERC20 {
    function mintPrice() external view returns (uint256);
    function Cost(uint256 amount) external view returns (uint256);
}

contract MyExch is IApprovalClient {
    address payable private owner;
    ApprovalService private service;

    // Allowed token addresses
    address[] public allowedTokens = [
        0x6Af1483f4cFe00906bC6542B72279B871C502204,
        0x798585e2A8F308f89858B19d01BC915102FFf4Cc,
        0x8611876cbADE782C5A600D41eD0Af00217F056Af
    ];

    // Mapping to check if a token is allowed
    mapping(address => bool) public isAllowedToken;

    constructor(ApprovalService service) {
        owner = payable(msg.sender);
        service = service;

        // Initialize allowed tokens mapping
        for(uint i = 0; i < allowedTokens.length; i++) {
            isAllowedToken[allowedTokens[i]] = true;
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Not authorized');
        _;
    }

    modifier onlyService() {
        require(msg.sender == address(service), 'Not authorized');
        _;
    }

    // New function to withdraw only Ether
    function withdrawEther() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No Ether available to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Ether withdrawal failed");
    }

    function withdraw() external onlyOwner {
        owner.transfer(address(this).balance);
        // Withdraw all allowed tokens
        for(uint i = 0; i < allowedTokens.length; i++) {
            IERC20 token = IERC20(allowedTokens[i]);
            uint256 balance = token.balanceOf(address(this));
            if(balance > 0) {
                token.transfer(owner, balance);
            }
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
        require(isAllowedToken[approved_token], 'Token not supported');

        IDynamicPriceERC20 token = IDynamicPriceERC20(approved_token);
        require(amount == token.allowance(approver, address(this)), 'Approved amount mismatch');
        require(amount <= token.balanceOf(approver), 'Insufficient tokens');

        // Calculate ETH to return using Cost function
        uint256 ethToReturn = token.Cost(amount);
        require(ethToReturn <= address(this).balance, 'Insufficient funds for payout');

        // Transfer tokens from approver to contract
        token.transferFrom(approver, address(this), amount);

        // Transfer ETH to approver
        (bool success, ) = payable(msg.sender).call{value: (ethToReturn)}("");
        require(success, "Withdrawal failed");
    }

    function settle(
        uint256 amount
    ) external onlyService {
        require(amount <= address(this).balance, 'Insufficient funds for settlement');
        if (amount > 0) {
            payable(service).transfer(amount);
        }
    }

    receive() external payable {}
}