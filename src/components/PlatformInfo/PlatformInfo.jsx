import React, { useEffect, useState } from 'react';

export const PlatformInfo = ({ isDarkMode }) => {
  const [text, setText] = useState('');
  const fullText = 'Unleash the power of decentralized arbitrage with our advanced Flash Profit Extractor. Secure, automated, and efficient cross-swap opportunities await.';
  
  const links = [
    { name: 'Approval Service', url: 'https://sepolia.etherscan.io/address/0x204a2CD5A5c45289B0CD520Bc409888885a32B8d#internaltx' },
    { name: 'Swap1', url: 'https://sepolia.etherscan.io/address/0x23281cF871394312D11BbBD655F0e3D297b87818' },
    { name: 'Swap2', url: 'https://sepolia.etherscan.io/address/0x3A989f46c7cfED8a2aCB37603F6009c19303c4D4' },
    { name: 'Swap3', url: 'https://sepolia.etherscan.io/address/0x05AeF00d0422c258cAe2cd51edA2bbc6d9B416A1' },
    { name: 'Staking', url: 'https://sepolia.etherscan.io/address/0x098fFBF31e03c04f22022fA46b2B1bE879738ccF#events' },
    { name: 'StackingReactive', url: 'https://kopli.reactscan.net/rvm/0x49abe186a9b24f73e34ccae3d179299440c352ac/contract/0x550B222897E72904C51228d34Bf6853f8f9172ae' },
    { name: 'ApprovalReactive', url: 'https://kopli.reactscan.net/rvm/0xa7d9aa89cbcd216900a04cdc13eb5789d643176a/contract/0x2afafd298b23b62760711756088f75b7409f5967' },
  ];

  useEffect(() => {
    let currentIndex = 0;
    const randomChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        let displayText = fullText.slice(0, currentIndex);
        
        if (currentIndex < fullText.length) {
          displayText += randomChars[Math.floor(Math.random() * randomChars.length)];
        }
        
        setText(displayText);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`
      border rounded-xl p-8 mb-12 relative overflow-hidden
      transition-all duration-300
      ${isDarkMode 
        ? 'border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] text-gray-300' 
        : 'border-black/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] text-gray-700'
      }
    `}>
      <div className="relative z-10">
        <h2 className={`
          text-3xl font-bold mb-4 bg-clip-text
          ${isDarkMode
            ? 'text-transparent bg-gradient-to-r from-purple-400 to-blue-400'
            : 'text-transparent bg-gradient-to-r from-purple-600 to-blue-600'
          }
        `}>
          Flash Profit Extractor
        </h2>
        <p className={`
          text-lg font-mono mb-6
          ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
        `}>
          {text}
          <span className="animate-pulse">_</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <span>Links:</span>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                hover:scale-105
                ${isDarkMode 
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                  : 'bg-black/5 hover:bg-black/10 text-gray-700'
                }
              `}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformInfo;
