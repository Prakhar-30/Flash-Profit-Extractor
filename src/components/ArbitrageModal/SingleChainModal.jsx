import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { PricingService } from './pricingService';
import ApproveButton from './ApproveButton';
import { toast } from 'react-hot-toast';

const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds

const SingleChainModal = ({ onBack }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Use refs to store mutable values that shouldn't trigger re-renders
  const pricingServiceRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const fetchOpportunities = useCallback(async () => {
    try {
      if (!pricingServiceRef.current) {
        const provider = new ethers.providers.JsonRpcProvider(
          "https://eth-sepolia.g.alchemy.com/v2/hjMSBvX0yQSgvuxY3AuO5W9yqlERL0LF"
        );
        pricingServiceRef.current = new PricingService(provider);
      }

      const arbitrageOpportunities = await pricingServiceRef.current.getArbitrageOpportunities();
      setOpportunities(arbitrageOpportunities);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err) {
      setError('Failed to fetch arbitrage opportunities. Will retry in 30 seconds.');
      console.error(err);
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchOpportunities();

    // Setup interval for subsequent fetches
    refreshIntervalRef.current = setInterval(fetchOpportunities, REFRESH_INTERVAL);

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchOpportunities]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold">Sepolia Arbitrage Opportunities</h2>
          {lastUpdate && (
            <p className="text-xs text-gray-400">
              Last updated: {formatTime(lastUpdate)}
            </p>
          )}
        </div>
        <button
          onClick={onBack}
          className="text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          Change Choice
        </button>
      </div>

      {loading && !opportunities.length && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm text-center py-2 bg-red-500/10 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2 mt-2">
        {opportunities.map((opportunity, index) => (
          <div 
            key={index} 
            className="flex flex-col p-3 rounded bg-white bg-opacity-10 hover:bg-opacity-15 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{opportunity.pair}</span>
                <span className="text-xs text-gray-400">{opportunity.swapName}</span>
              </div>
              <span 
                className={`font-bold text-sm ${
                  opportunity.isProfit ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatPercent(opportunity.profitPercent)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mt-1">
              <div>
                <span className="text-gray-400">Swap:</span>
                <span className="ml-1">{opportunity.currentPrice.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-400">Market:</span>
                <span className="ml-1">{opportunity.marketPrice.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-400">T0:</span>
                <span className="ml-1">{opportunity.token0Symbol}</span>
              </div>
              <div>
                <span className="text-gray-400">T1:</span>
                <span className="ml-1">{opportunity.token1Symbol}</span>
              </div>
            </div>

            <div className="mt-2">
              <ApproveButton 
                tokenAddress={opportunity.token0.address}
                spenderAddress={opportunity.swapAddress}
                tokenSymbol={opportunity.token0Symbol}
              />
            </div>
          </div>
        ))}
      </div>

      {!loading && opportunities.length === 0 && !error && (
        <div className="text-center py-4 text-sm text-gray-400">
          No arbitrage opportunities found
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400 text-center">
        Refreshes every 30 seconds
      </div>
    </div>
  );
};

export default SingleChainModal;