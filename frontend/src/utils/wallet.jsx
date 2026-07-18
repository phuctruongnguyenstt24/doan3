// utils/wallet.js
import { ethers } from "ethers";

// Utility functions that don't require React state
export const walletUtils = {
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  async getBalance(provider, address) {
    try {
      const balance = await provider.getBalance(address);
      const formatted = ethers.formatEther(balance);
      return {
        raw: balance,
        formatted: parseFloat(formatted).toFixed(4),
        unit: 'ETH'
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      return null;
    }
  },

  async checkNetwork() {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const expectedChainId = import.meta.env.VITE_CHAIN_ID || '0x1';
      return chainId === expectedChainId;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  },

  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }
};

export default walletUtils;