// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract DynamicPriceNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Math for uint256;
    
    Counters.Counter private _tokenIds;
    
    uint256 public mintPrice;    // Price in wei
    uint256 public maxSupply;    // Maximum token supply
    uint256 public mintIncrease; // Price increase % on mint (in basis points, 100 = 1%)
    uint256 public burnDecrease; // Price decrease % on burn (in basis points, 100 = 1%)
    
    string private _baseTokenURI;
    
    event TokenMinted(address indexed to, uint256 tokenId, uint256 price);
    event TokenBurned(address indexed from, uint256 tokenId, uint256 price);
    event PriceUpdated(uint256 newPrice);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _initialPrice,
        uint256 _maxSupply,
        uint256 _mintIncrease,
        uint256 _burnDecrease,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        require(_initialPrice > 0, "Initial price must be greater than 0");
        require(_maxSupply > 0, "Max supply must be greater than 0");
        
        mintPrice = _initialPrice;
        maxSupply = _maxSupply;
        mintIncrease = _mintIncrease;
        burnDecrease = _burnDecrease;
        _baseTokenURI = baseURI;
    }
    
    function mint() external payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        
        // Calculate new price for next mint
        uint256 newPrice = _calculateNewPrice(true);
        mintPrice = newPrice;
        
        emit TokenMinted(msg.sender, newTokenId, mintPrice);
        emit PriceUpdated(mintPrice);
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
    }
    
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || 
                getApproved(tokenId) == msg.sender || 
                isApprovedForAll(ownerOf(tokenId), msg.sender), 
                "Not token owner or approved");
        
        _burn(tokenId);
        
        // Calculate new price after burn
        uint256 newPrice = _calculateNewPrice(false);
        mintPrice = newPrice;
        
        emit TokenBurned(msg.sender, tokenId, mintPrice);
        emit PriceUpdated(mintPrice);
    }
    
    function _calculateNewPrice(bool isMint) internal view returns (uint256) {
        if (isMint) {
            uint256 priceIncrease = (mintPrice * mintIncrease) / 10000;
            return mintPrice + (Math.sqrt(priceIncrease));
        } else {
            uint256 priceDecrease = (mintPrice * burnDecrease) / 10000;
            return Math.max(mintPrice - (Math.sqrt(priceDecrease)), 1); // Ensure price doesn't go below 1 wei
        }
    }
    
    function updateMintPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Invalid price");
        mintPrice = newPrice;
        emit PriceUpdated(mintPrice);
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    function currentTokenId() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    function getMintPrice() external view returns (uint256) {
        return mintPrice;
    }
}