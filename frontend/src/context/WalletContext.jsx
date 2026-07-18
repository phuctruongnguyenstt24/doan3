// frontend/src/context/WalletContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import profileABI from '../contracts/ProfileABI.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount]       = useState(null);
  const [balance, setBalance]       = useState(null);
  const [chainId, setChainId]       = useState(null);
  const [contract, setContract]     = useState(null);
  const [signer, setSigner]         = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError]           = useState(null);

  // Khởi tạo contract instance có signer từ provider + address
  const buildContract = async (provider, address) => {
    try {
      if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
        console.warn('VITE_CONTRACT_ADDRESS chưa được cấu hình. Bỏ qua khởi tạo contract.');
        return {};
      }
      const _signer = await provider.getSigner();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, profileABI.abi, _signer);
      setSigner(_signer);
      setContract(_contract);
      return { signer: _signer, contract: _contract };
    } catch (e) {
      console.error('buildContract error:', e);
      return {};
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.ethereum) {
        throw new Error('Vui lòng cài MetaMask!');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      setAccount(accounts[0]);

      // Balance
      const balanceWei = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balanceWei));

      // ChainId
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));

      // Contract + signer
      await buildContract(provider, accounts[0]);
    } catch (err) {
      console.error('Lỗi kết nối:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setContract(null);
    setSigner(null);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Tự động reconnect nếu ví đã cho phép trước đó
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setAccount(accounts[0]);

          const balanceWei = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balanceWei));

          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainIdHex, 16));

          await buildContract(provider, accounts[0]);
        }
      } catch (e) {
        console.error('autoConnect error:', e);
      }
    };
    autoConnect();
  }, []);

  // Lắng nghe sự kiện thay đổi ví / chain
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balanceWei));
        await buildContract(provider, accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        chainId,
        contract,
        signer,
        isConnected: !!account && !!contract,
        loading: isConnecting,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
