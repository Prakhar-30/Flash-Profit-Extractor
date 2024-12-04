// pricingService.js
import { ethers } from 'ethers';

// ABI fragments
const swapABI = [
  {
    "inputs": [],
    "name": "currentPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const tokenABI = [
  {
    "inputs": [],
    "name": "mintPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Swap Configuration
const SWAPS_CONFIG = [
  {
    address: '0x84862cFA327925206b188414e33717df2D0106D1',
    name: 'Swap 1',
    token0: {
      address: '0x6Af1483f4cFe00906bC6542B72279B871C502204', // Add token0 address
      symbol: 'usdt', // Add token0 symbol
    },
    token1: {
      address: '0x798585e2A8F308f89858B19d01BC915102FFf4Cc', // Add token1 address
      symbol: 'usdc', // Add token1 symbol
    }
  },
  {
    address: '0xA9A9b11Ad815818dAcc0fe152E53c38cdf5675EA',
    name: 'Swap 2',
    token0: {
      address: '0x798585e2A8F308f89858B19d01BC915102FFf4Cc', // Add token0 address
      symbol: 'usdc', // Add token0 symbol
    },
    token1: {
      address: '0x8611876cbADE782C5A600D41eD0Af00217F056Af', // Add token1 address
      symbol: 'DAI', // Add token1 symbol
    }
  },
  {
    address: '0x008D7dD4925A3A901cD3276192351eaf0Cdf3fa7',
    name: 'Swap 3',
    token0: {
      address: '0x8611876cbADE782C5A600D41eD0Af00217F056Af', // Add token0 address
      symbol: 'DAI', // Add token0 symbol
    },
    token1: {
      address: '0x6Af1483f4cFe00906bC6542B72279B871C502204', // Add token1 address
      symbol: 'usdt', // Add token1 symbol
    }
  }
];

export class PricingService {
  constructor(provider) {
    this.provider = provider;
    this.lastUpdateTimestamp = 0;
  }

  async getTokenMintPrice(tokenAddress) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, this.provider);
      const mintPrice = await tokenContract.mintPrice();
      return ethers.utils.formatUnits(mintPrice, 18);
    } catch (error) {
      console.error(`Error fetching mint price for token ${tokenAddress}:`, error);
      throw error;
    }
  }

  async getSwapCurrentPrice(swapAddress) {
    try {
      const swapContract = new ethers.Contract(swapAddress, swapABI, this.provider);
      const currentPrice = await swapContract.currentPrice();
      return ethers.utils.formatUnits(currentPrice, 18);
    } catch (error) {
      console.error(`Error fetching current price for swap ${swapAddress}:`, error);
      throw error;
    }
  }

  calculateArbitrage(swapPrice, token0MintPrice, token1MintPrice) {
    // Convert all prices to numbers for calculation
    const currentSwapRate = parseFloat(swapPrice);
    const token0MarketPrice = parseFloat(token0MintPrice);
    const token1MarketPrice = parseFloat(token1MintPrice);

    // Calculate the market rate
    const marketRate = token1MarketPrice / token0MarketPrice;
    
    // Calculate profit/loss percentage
    const profitPercent = ((marketRate - currentSwapRate) / currentSwapRate) * 100;

    return {
      swapRate: currentSwapRate,
      marketRate: marketRate,
      profitPercent: profitPercent,
      isProfit: profitPercent > 0
    };
  }

  async getArbitrageOpportunities() {
    try {
      const currentTimestamp = Date.now();
      this.lastUpdateTimestamp = currentTimestamp;

      const opportunities = await Promise.all(
        SWAPS_CONFIG.map(async (swap) => {
          // Get all required prices
          const [swapPrice, token0MintPrice, token1MintPrice] = await Promise.all([
            this.getSwapCurrentPrice(swap.address),
            this.getTokenMintPrice(swap.token0.address),
            this.getTokenMintPrice(swap.token1.address)
          ]);

          // Calculate arbitrage
          const arbitrage = this.calculateArbitrage(
            swapPrice,
            token0MintPrice,
            token1MintPrice
          );

          return {
            swapName: swap.name,
            swapAddress: swap.address,
            token0: swap.token0,  // Include the full token0 object
            token1: swap.token1,  // Include the full token1 object
            token0Symbol: swap.token0.symbol,
            token1Symbol: swap.token1.symbol,
            pair: `${swap.token0.symbol}/${swap.token1.symbol}`,
            currentPrice: arbitrage.swapRate,
            marketPrice: arbitrage.marketRate,
            profitPercent: arbitrage.profitPercent,
            isProfit: arbitrage.isProfit,
            lastUpdate: currentTimestamp
          };
        })
      );

      return opportunities;

    } catch (error) {
      console.error('Error getting arbitrage opportunities:', error);
      throw error;
    }
  }
}
