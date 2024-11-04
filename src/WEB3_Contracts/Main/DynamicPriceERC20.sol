// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../../lib/openzeppelin-contracts/contracts/utils/math/Math.sol";

contract DynamicPriceERC20 is ERC20 {
    using Math for uint256;

    uint256 public mintPrice;    // Price in wei
    uint256 public maxSupply;    // Maximum token supply
    uint256 public mintIncrease; // Price increase % on mint (in basis points, 100 = 1%)
    uint256 public burnDecrease; // Price decrease % on burn (in basis points, 100 = 1%)
    
    event TokensMinted(address indexed to, uint256 amount, uint256 price);
    event TokensBurned(address indexed from, uint256 amount, uint256 price);
    event PriceUpdated(uint256 newPrice);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _initialPrice,
        uint256 _maxSupply,
        uint256 _mintIncrease,
        uint256 _burnDecrease
    ) ERC20(name, symbol){
        require(_initialPrice > 0, "Initial price must be greater than 0");
        require(_maxSupply > 0, "Max supply must be greater than 0");
        
        mintPrice = _initialPrice;
        maxSupply = _maxSupply;
        mintIncrease = _mintIncrease;
        burnDecrease = _burnDecrease;
    }
    
    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        
        _mint(msg.sender, amount);
        
        uint256 newPrice = _calculateNewPrice(true, amount);
        mintPrice = newPrice;
        
        emit TokensMinted(msg.sender, amount, mintPrice);
        emit PriceUpdated(mintPrice);
        
    }
function burn(address account, uint256 amount) external {
    require(amount > 0, "Amount must be greater than 0");
    require(balanceOf(account) >= amount, "Insufficient balance");
    
    _burn(account, amount);

    uint256 newPrice = _calculateNewPrice(false, amount);
    mintPrice = newPrice;
    
    emit TokensBurned(account, amount, mintPrice);
    emit PriceUpdated(mintPrice);
}
    
    function _calculateNewPrice(bool isMint, uint256 amount) internal view returns (uint256) {
        if (isMint) {
            uint256 priceIncrease = (amount * mintPrice * mintIncrease) / 10000;
            return mintPrice+(Math.sqrt(priceIncrease));
        } else {
            uint256 priceDecrease = (amount * mintPrice * mintIncrease) / 10000;
            return Math.max(mintPrice - (Math.sqrt(priceDecrease)), 1); // Ensure price doesn't go below 1 wei
        }
    } 
    function Cost(uint256 amount) public view returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        return amount * mintPrice;
    }
}