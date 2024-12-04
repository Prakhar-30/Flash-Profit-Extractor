import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ERC20ABI from '../../ABIs/ERC20';

export const TokenPrices = () => {
  const [tokenData, setTokenData] = useState({});
  
  const CONTRACT_ADDRESSES = [
    '0x6Af1483f4cFe00906bC6542B72279B871C502204',
    '0x798585e2A8F308f89858B19d01BC915102FFf4Cc',
    '0x8611876cbADE782C5A600D41eD0Af00217F056Af'
  ];

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/hjMSBvX0yQSgvuxY3AuO5W9yqlERL0LF");

    const fetchTokenData = async () => {
      const newTokenData = {};
      
      for (const address of CONTRACT_ADDRESSES) {
        try {
          const contract = new ethers.Contract(address, ERC20ABI, provider);
          
          // Fetch symbol and price
          const [symbol, mintPrice] = await Promise.all([
            contract.symbol(),
            contract.mintPrice()
          ]);
          
          // Convert price from wei to ether
          const priceInEth = ethers.utils.formatEther(mintPrice);
          
          newTokenData[symbol] = priceInEth;
        } catch (error) {
          console.error(`Error fetching data for contract ${address}:`, error);
        }
      }
      
      setTokenData(newTokenData);
    };

    // Fetch initial data
    fetchTokenData();

    // Set up interval for updates
    const interval = setInterval(fetchTokenData, 60000); // Update every minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed mt-6 right-6 top-24 space-y-2 z-20">
      {Object.entries(tokenData).map(([symbol, price]) => (
        <div 
          key={symbol} 
          className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-2 px-6 shadow-xl 
          hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105
          before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-purple-500/20 before:to-blue-500/20 before:rounded-xl
          relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <h3 className="text-md font-semibold text-purple-200">{symbol}</h3>
          <p className="text-sm font-bold text-white">${parseFloat(price).toFixed(6)*1000}</p>
        </div>
      ))}
    </div>
  );
};
