// utils/donateContract.jsx
import { ethers } from 'ethers';
import donateVaultABI from '../contracts/DonateVaultABI.json';

const DONATE_CONTRACT_ADDRESS = import.meta.env.VITE_DONATE_CONTRACT_ADDRESS || '';

export const isDonateContractConfigured = () =>
  !!DONATE_CONTRACT_ADDRESS && DONATE_CONTRACT_ADDRESS.startsWith('0x');

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

// Contract có signer (dùng để gửi giao dịch - donate, withdraw...)
export const getDonateContract = async () => {
  if (!isDonateContractConfigured()) return null;
  const provider = getProvider();
  if (!provider) return null;

  const signer = await provider.getSigner();
  return new ethers.Contract(DONATE_CONTRACT_ADDRESS, donateVaultABI.abi, signer);
};

// Contract chỉ đọc (không cần kết nối ví) - dùng RPC public để ai cũng xem được lịch sử donate
export const getDonateContractReadOnly = () => {
  if (!isDonateContractConfigured()) return null;
  const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL;

  const provider = window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : rpcUrl
      ? new ethers.JsonRpcProvider(rpcUrl)
      : ethers.getDefaultProvider('sepolia');

  return new ethers.Contract(DONATE_CONTRACT_ADDRESS, donateVaultABI.abi, provider);
};

// ============ FUNCTIONS ============

/** Gửi donate kèm lời nhắn. amountEth: string, vd "0.01" */
export const sendDonation = async (amountEth, message) => {
  try {
    const contract = await getDonateContract();
    if (!contract) throw new Error('Chưa cấu hình VITE_DONATE_CONTRACT_ADDRESS hoặc chưa có ví.');

    const value = ethers.parseEther(String(amountEth));
    const tx = await contract.donate(message || '', { value });
    const receipt = await tx.wait();
    return { success: true, hash: receipt.hash ?? receipt.transactionHash };
  } catch (error) {
    console.error('sendDonation error:', error);
    return { success: false, error: error.shortMessage || error.message };
  }
};

/** Địa chỉ ví sẽ nhận donate (owner của contract) */
export const getDonateOwner = async () => {
  try {
    const contract = getDonateContractReadOnly();
    if (!contract) return null;
    return await contract.owner();
  } catch (error) {
    console.error('getDonateOwner error:', error);
    return null;
  }
};

export const getTotalDonated = async () => {
  try {
    const contract = getDonateContractReadOnly();
    if (!contract) return '0';
    const total = await contract.totalDonated();
    return ethers.formatEther(total);
  } catch (error) {
    console.error('getTotalDonated error:', error);
    return '0';
  }
};

export const getDonationCount = async () => {
  try {
    const contract = getDonateContractReadOnly();
    if (!contract) return 0;
    const count = await contract.getDonationCount();
    return Number(count);
  } catch (error) {
    console.error('getDonationCount error:', error);
    return 0;
  }
};

/** Lấy danh sách donate, mới nhất trước */
export const getDonations = async (offset = 0, limit = 20) => {
  try {
    const contract = getDonateContractReadOnly();
    if (!contract) return [];

    const [donors, amounts, messages, timestamps] = await contract.getDonations(offset, limit);

    return donors.map((donor, i) => ({
      donor,
      amountEth: ethers.formatEther(amounts[i]),
      message: messages[i],
      timestamp: Number(timestamps[i]),
    }));
  } catch (error) {
    console.error('getDonations error:', error);
    return [];
  }
};
