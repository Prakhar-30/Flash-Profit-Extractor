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

// NFT Burner Contract
contract NFTBurner is Ownable, IERC721Receiver {
    IDynamicPriceNFT public nftContract;
    
    event NFTBurned(address indexed burner, uint256 tokenId, uint256 timestamp);
    event BurnedWithMessage(address indexed burner, uint256 tokenId, string message);
    
    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IDynamicPriceNFT(_nftContract);
    }
    
    // Function to burn NFT with a message
    function burnWithMessage(uint256 tokenId, string memory message) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Transfer NFT to this contract first (required for burning)
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        
        // Burn the NFT
        nftContract.burn(tokenId);
        
        // Emit events
        emit NFTBurned(msg.sender, tokenId, block.timestamp);
        emit BurnedWithMessage(msg.sender, tokenId, message);
    }
    
    // Function to burn multiple NFTs at once
    function burnBatch(uint256[] calldata tokenIds) external {
        for(uint256 i = 0; i < tokenIds.length; i++) {
            require(nftContract.ownerOf(tokenIds[i]) == msg.sender, "Not token owner");
            
            nftContract.transferFrom(msg.sender, address(this), tokenIds[i]);
            nftContract.burn(tokenIds[i]);
            
            emit NFTBurned(msg.sender, tokenIds[i], block.timestamp);
        }
    }
    
    // Required for receiving NFTs
    function onERC721Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*tokenId*/,
        bytes calldata /*data*/
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}