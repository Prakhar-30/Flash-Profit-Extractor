import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import STAKE from '../../ABIs/STAKE';

const StakingSection = ({ isDarkMode, setShowArbitrageModal }) => {
  const [amount, setAmount] = useState('');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const contractAddress = "0x098fFBF31e03c04f22022fA46b2B1bE879738ccF"; // Replace with your deployed contract address

  // Initialize contract
  const getContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(contractAddress, STAKE, signer);
    } catch (error) {
      console.error("Error initializing contract:", error);
      return null;
    }
  };

  // Fetch staked balance
  const fetchStakedBalance = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      
      const balance = await contract.getStakedBalance();
      setStakedBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!amount) return;
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.stake({
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      
      setAmount('');
      await fetchStakedBalance();
    } catch (error) {
      console.error("Error staking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;

      const tx = await contract.withdraw();
      await tx.wait();
      
      await fetchStakedBalance();
    } catch (error) {
      console.error("Error withdrawing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial balance fetch
  useEffect(() => {
    fetchStakedBalance();
  }, []);

  // Update arbitrage modal access based on balance
  useEffect(() => {
    if (parseFloat(stakedBalance) <= 0) {
      setShowArbitrageModal(false);
    }
  }, [stakedBalance, setShowArbitrageModal]);

  return (
    <div className={`rounded-xl p-8 
      transition-all duration-300 relative overflow-hidden
      ${isDarkMode 
        ? 'backdrop-blur-lg bg-white/10 border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] hover:shadow-purple-500/20' 
        : 'bg-white/90 border border-purple-100 shadow-lg hover:shadow-purple-500/5'
      }`}>
      <div className={`absolute inset-0 bg-gradient-to-r 
        ${isDarkMode
          ? 'from-purple-500/10 to-blue-500/10 opacity-30'
          : 'from-purple-500/5 to-blue-500/5 opacity-20'
        }`} />
      
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
        Stake ETH
      </h2>

      <div className={`mb-6 p-4 rounded-lg ${
        isDarkMode 
          ? 'bg-black/20 backdrop-blur-sm border border-white/10'
          : 'bg-gray-100 border border-purple-100'
      }`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your Staked Balance
        </p>
        <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {stakedBalance} ETH
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
            className={`flex-1 rounded-lg p-3 relative z-10
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              transition-all duration-300
              ${isDarkMode
                ? 'bg-black/20 backdrop-blur-sm border border-white/10 text-white placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
                : 'bg-gray-100 border border-purple-100 text-gray-800 placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] hover:bg-gray-50 focus:bg-gray-50'
              }`}
          />
          <button 
            onClick={handleDeposit}
            disabled={isLoading}
            className="bg-purple-500 px-6 py-3 rounded-lg font-semibold
              hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-purple-500/50
              text-white transform hover:scale-105 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : 'Stake'}
          </button>
        </div>
        
        <button 
          onClick={handleWithdraw}
          disabled={isLoading || parseFloat(stakedBalance) <= 0}
          className={`w-full py-3 rounded-lg font-semibold
            transition-all duration-300 shadow-lg relative z-10
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isDarkMode 
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}>
          {isLoading ? 'Processing...' : 'Withdraw Staked ETH'}
        </button>
      </div>
    </div>
  );
};

export default StakingSection;
