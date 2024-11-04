import React, { useEffect, useState } from 'react';

export const PlatformInfo = ({ isDarkMode }) => {
  const [text, setText] = useState('');
  const fullText = 'Unleash the power of decentralized arbitrage with our advanced Flash Profit Extractor. Secure, automated, and efficient cross-chain opportunities await.';
  
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
          text-lg font-mono
          ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
        `}>
          {text}
          <span className="animate-pulse">_</span>
        </p>
      </div>
    </div>
  );
};