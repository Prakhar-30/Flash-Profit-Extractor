// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

// Interface for the main NFT contract
interface IDynamicPriceNFT is IERC721 {
    function getMintPrice() external view returns (uint256);
    function currentTokenId() external view returns (uint256);
    function mint() external payable;
    function burn(uint256 tokenId) external;
}

contract NFTMinter is Ownable {
    using Counters for Counters.Counter;
    
    IDynamicPriceNFT public nftContract;
    Counters.Counter private mintCounter;
    
    event NFTMinted(address indexed minter, uint256 tokenId, uint256 price, uint256 timestamp);
    event MintedWithMessage(address indexed minter, uint256 tokenId, string message);
    event BatchMinted(address indexed minter, uint256 quantity, uint256 totalCost);
    
    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IDynamicPriceNFT(_nftContract);
    }
    
    // Function to mint single NFT with a message
    function mintWithMessage(string memory message) external payable {
        uint256 mintPrice = nftContract.getMintPrice();
        require(msg.value >= mintPrice, "Insufficient payment");
        
        // Mint NFT
        nftContract.mint{value: mintPrice}();
        uint256 tokenId = nftContract.currentTokenId();
        
        // Emit events
        emit NFTMinted(msg.sender, tokenId, mintPrice, block.timestamp);
        emit MintedWithMessage(msg.sender, tokenId, message);
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
        
        mintCounter.increment();
    }
    
    // Function to mint multiple NFTs at once
    function mintBatch(uint256 quantity) external payable {
        uint256 mintPrice = nftContract.getMintPrice();
        uint256 totalCost = mintPrice * quantity;
        require(msg.value >= totalCost, "Insufficient payment");
        
        for(uint256 i = 0; i < quantity; i++) {
            nftContract.mint{value: mintPrice}();
            uint256 tokenId = nftContract.currentTokenId();
            emit NFTMinted(msg.sender, tokenId, mintPrice, block.timestamp);
        }
        
        emit BatchMinted(msg.sender, quantity, totalCost);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }
    
    // Function to get total mints through this contract
    function getTotalMints() external view returns (uint256) {
        return mintCounter.current();
    }
    
    // Function to withdraw accumulated ETH (if any)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    // Function to update NFT contract address (if needed)
    function updateNFTContract(address newContract) external onlyOwner {
        nftContract = IDynamicPriceNFT(newContract);
    }
}