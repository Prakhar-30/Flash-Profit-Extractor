import React from 'react';

const CrossChainModal = ({ arbitrageData, onBack }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Cross-Chain Arbitrage Opportunities</h2>
        <button
          onClick={onBack}
          className="text-sm bg-gray-600 px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Change Choice
        </button>
      </div>
      <div className="space-y-4">
        <p>CommingSoon...</p>
        {arbitrageData
          .filter(item => item.isCrossChain)
          .map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white bg-opacity-10">
              <div className="flex flex-col">
                <span className="font-semibold">{item.pair}</span>
                <span className="text-sm text-gray-300">Sepolia → KOPLI</span>
              </div>
              <span className={`font-bold ${item.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                {item.profit}
              </span>
              <button className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                Approve
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

export default CrossChainModal;