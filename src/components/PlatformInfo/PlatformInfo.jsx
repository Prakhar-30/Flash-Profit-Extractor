import React, { useEffect, useState } from 'react';

export const PlatformInfo = ({ isDarkMode }) => {
  const [text, setText] = useState('');
  const fullText = 'Unleash the power of decentralized arbitrage with our advanced Flash Profit Extractor. Secure, automated, and efficient cross-swap opportunities await.';
  
  const links = [
    { name: 'Approval Service', url: 'https://sepolia.etherscan.io/address/0xAaCc8a2D45a6427b9Dd1476f5D18599Fbb3B6Ac3#internaltx' },
    { name: 'Swap1', url: 'https://sepolia.etherscan.io/address/0x7dE1dC9BCB8404Ff3ad80332C6266a770B1674BD' },
    { name: 'Swap2', url: 'https://sepolia.etherscan.io/address/0xA9A9b11Ad815818dAcc0fe152E53c38cdf5675EA' },
    { name: 'Swap3', url: 'https://sepolia.etherscan.io/address/0x008D7dD4925A3A901cD3276192351eaf0Cdf3fa7' },
    { name: 'Staking', url: 'https://sepolia.etherscan.io/address/0x87caF149D75435F352bAc6A134afC3a069c3bf94#events' },
    { name: 'StackingReactive', url: 'https://kopli.reactscan.net/rvm/0x49abe186a9b24f73e34ccae3d179299440c352ac' },
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