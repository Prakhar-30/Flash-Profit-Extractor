import React from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";
import { Sun, Moon } from "lucide-react";

export const Header = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="fixed w-full top-0 z-50">
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
      
      {/* Blur background */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
      
      <div className="container mx-auto px-4 py-6 relative">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4">
          <div className="relative text-4xl font-black text-blue-600 tracking-[.25em] uppercase mx-4 py-2 border-purple-600/20   border-y-2" 
            style={{
            fontFamily: "'Chakra Petch', sans-serif",
            textShadow: "2px 2px 0px rgba(147, 51, 234, 0.1)",
          }}>
        Flash Profit Extractor
      </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300
              border border-white/10 shadow-lg hover:shadow-purple-500/20"
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6 text-yellow-300" />
              ) : (
                <Moon className="w-6 h-6 text-blue-400" />
              )}
            </button>
            <ConnectWallet 
              theme={isDarkMode ? "dark" : "light"}
              className="shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            />
          </div>
        </nav>
      </div>
    </header>
  );
};