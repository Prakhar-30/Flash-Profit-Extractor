import React, { useState } from 'react';
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import { ethers } from 'ethers';

const IERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ApproveButton = ({ tokenAddress, spenderAddress, tokenSymbol }) => {
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const { contract } = useContract(tokenAddress, IERC20_ABI);
  const { mutateAsync: approve } = useContractWrite(contract, "approve");

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const amountInWei = ethers.utils.parseEther(amount);
      
      await approve({ args: [spenderAddress, amountInWei] });
      
      // Reset form and show success message
      setAmount('');
      setShowInput(false);
      toast.success(`Successfully approved ${amount} ${tokenSymbol}`);
    } catch (error) {
      toast.error('Failed to approve token');
      console.error('Approval error:', error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="w-full">
      {!showInput ? (
        <button 
          onClick={() => setShowInput(true)}
          className="w-full bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Approve {tokenSymbol}
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${tokenSymbol} amount`}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isApproving || !amount}
              className="flex-1 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isApproving ? 'Approving...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setAmount('');
              }}
              className="flex-1 bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveButton;