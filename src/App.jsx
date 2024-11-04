import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Header } from './components/Header/Header';
import { TokenPrices } from './components/TokenPrices/TokenPrices';
import StakingSection from './components/StakingSection/StakingSection';
import { ArbitrageModal } from './components/ArbitrageModal/ArbitrageModal';
import { PlatformInfo } from './components/PlatformInfo/PlatformInfo';
import { Coins } from "lucide-react";
import { Footer } from './components/Footer/Footer';
import Spline from '@splinetool/react-spline';
import STAKE from './ABIs/STAKE';
import toast, { Toaster } from 'react-hot-toast';
import { ThirdwebProvider } from "@thirdweb-dev/react";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showArbitrageModal, setShowArbitrageModal] = useState(false);
  const [stakedBalance, setStakedBalance] = useState('0');
  const contractAddress = "0x1A99F9846551920BDB3768c70FDEfb12E48ed9BD";

  const checkStakedBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, STAKE, signer);
      const balance = await contract.getStakedBalance();
      setStakedBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      toast.error("Failed to check balance", {
        style: {
          background: isDarkMode ? '#1F2937' : '#fff',
          color: isDarkMode ? '#fff' : '#1F2937',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        },
      });
      console.error("Error checking balance:", error);
    }
  };

  const handleArbitrageClick = async () => {
    await checkStakedBalance();
    if (parseFloat(stakedBalance) > 0) {
      setShowArbitrageModal(true);
    } else {
      toast(
        <div className="flex flex-col">
          <span className="font-semibold">Access Denied</span>
          <span className="text-sm">Please stake ETH to access arbitrage opportunities</span>
        </div>,
        {
          icon: '🔒',
          style: {
            background: isDarkMode ? '#1F2937' : '#fff',
            color: isDarkMode ? '#fff' : '#1F2937',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          },
          duration: 4000,
        }
      );
    }
  };

  return (
    <ThirdwebProvider activeChain="sepolia">
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gray-50'} 
    transition-colors duration-300 relative overflow-hidden`}>
      <Toaster position="top-right" 
        toastOptions={{
          // Default options for all toasts
          style: {
            background: isDarkMode ? '#1F2937' : '#fff',
            color: isDarkMode ? '#fff' : '#1F2937',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      
      <Header isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen pt-20">
        <main className="lg:col-span-6 px-4 pt-24 pb-32 relative z-10">
          <div className="max-w-2xl mx-auto lg:mr-0">
            <StakingSection 
              isDarkMode={isDarkMode} 
              setShowArbitrageModal={setShowArbitrageModal}
              onBalanceUpdate={checkStakedBalance}
            />
            
            <div className="text-center mt-12">
              <button
                onClick={handleArbitrageClick}
                className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 rounded-lg 
                font-bold text-lg hover:opacity-90 transition-all duration-300 
                shadow-lg hover:shadow-purple-500/50 transform hover:scale-105
                inline-flex items-center gap-2"
              >
                <Coins className="w-6 h-6" />
                Check Arbitrage
              </button>
            </div>

            <PlatformInfo isDarkMode={isDarkMode} />
          </div>
        </main>

        <div className="absolute inset-0 lg:-left-20 lg:right-0">
          <Spline 
            className="w-full h-full"
            scene="https://prod.spline.design/SYCRm7GInucq5MiJ/scene.splinecode" 
          />
        </div>
      </div>

      <TokenPrices/>

      <ArbitrageModal 
        isOpen={showArbitrageModal}
        onClose={() => setShowArbitrageModal(false)}
        arbitrageData={[]}
      />
      
      <Footer />
    </div>
    </ThirdwebProvider>

  );
};

export default App;