import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThirdwebProvider } from "@thirdweb-dev/react";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThirdwebProvider activeChain="ethereum">
      <App />
    </ThirdwebProvider>
  </StrictMode>,
)
