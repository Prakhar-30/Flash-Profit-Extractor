import React, { useState } from 'react';
import { useAddress } from "@thirdweb-dev/react";
import SingleChainModal from './SingleChainModal';
import CrossChainModal from './CrossChainModal';

const ChainOption = ({ title, description, onClick, icon }) => (
  <button
    onClick={onClick}
    className="w-full p-6 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-300 flex flex-col items-center space-y-3"
  >
    {icon}
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-sm text-gray-300">{description}</p>
  </button>
);

export const ArbitrageModal = ({ isOpen, onClose, arbitrageData }) => {
  const [chainSelection, setChainSelection] = useState(null);
  const address = useAddress(); // Get connected wallet address from ThirdWeb

  if (!isOpen) return null;

  const handleChainSelect = (type) => {
    setChainSelection(type);
  };

  const resetSelection = () => {
    setChainSelection(null);
  };

  const renderModalContent = () => {
    if (!chainSelection) {
      return (
        <>
          <h2 className="text-2xl font-bold mb-6">Select Chain Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChainOption
              title="Single Chain"
              description="Search for arbitrage opportunities on Sepolia network only"
              onClick={() => handleChainSelect('single')}
              icon={
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              }
            />
            <ChainOption
              title="Cross Chain"
              description="Search for arbitrage opportunities between Sepolia and KOPLI networks"
              onClick={() => handleChainSelect('cross')}
              icon={
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              }
            />
          </div>
        </>
      );
    }

    if (chainSelection === 'single') {
      return (
        <SingleChainModal 
          arbitrageData={arbitrageData} 
          onBack={resetSelection}
          address={address} // Pass the connected wallet address
        />
      );
    }

    return (
      <CrossChainModal 
        arbitrageData={arbitrageData} 
        onBack={resetSelection}
        address={address} // In case you need it for CrossChainModal too
      />
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 max-w-2xl w-full mx-4">
        {renderModalContent()}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ArbitrageModal;