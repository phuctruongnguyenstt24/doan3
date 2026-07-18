// utils/contract.js
import { ethers } from 'ethers';
import profileABI from '../contracts/ProfileABI.json';

// Lấy địa chỉ contract từ env
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';

// Lấy provider
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

// Lấy contract với signer (write)
export const getContract = async () => {
  const provider = await getProvider();
  if (!provider) return null;
  
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, profileABI.abi, signer);
};

// Lấy contract read-only (view)
export const getContractReadOnly = async () => {
  const provider = await getProvider();
  if (!provider) return null;
  
  return new ethers.Contract(CONTRACT_ADDRESS, profileABI.abi, provider);
};

// ============ FUNCTIONS ============

// 1. Tạo hoặc cập nhật profile
export const createOrUpdateProfile = async (data) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Không thể kết nối contract');

    const tx = await contract.createOrUpdateProfile(
      data.fullName || '',
      data.bio || '',
      data.email || '',
      data.phone || '',
      data.avatarHash || '',
      data.github || '',
      data.linkedin || '',
      data.website || ''
    );
    
    const receipt = await tx.wait();
    return { success: true, tx: receipt };
  } catch (error) {
    console.error('Lỗi:', error);
    return { success: false, error: error.message };
  }
};

// 2. Lấy profile
export const getProfile = async (userAddress) => {
  try {
    const contract = await getContractReadOnly();
    if (!contract) throw new Error('Không thể kết nối contract');

    const profile = await contract.getProfile(userAddress);
    
    return {
      fullName: profile[0],
      bio: profile[1],
      email: profile[2],
      phone: profile[3],
      avatarHash: profile[4],
      github: profile[5],
      linkedin: profile[6],
      website: profile[7],
      updatedAt: Number(profile[8]),
      exists: profile[9]
    };
  } catch (error) {
    console.error('Lỗi:', error);
    return null;
  }
};

// 3. Cập nhật avatar
export const updateAvatar = async (avatarHash) => {
  try {
    const contract = await getContract();
    if (!contract) throw new Error('Không thể kết nối contract');

    const tx = await contract.updateAvatar(avatarHash);
    const receipt = await tx.wait();
    return { success: true, tx: receipt };
  } catch (error) {
    console.error('Lỗi:', error);
    return { success: false, error: error.message };
  }
};

// 4. Kiểm tra profile tồn tại
export const profileExists = async (userAddress) => {
  try {
    const contract = await getContractReadOnly();
    if (!contract) throw new Error('Không thể kết nối contract');

    return await contract.profileExists(userAddress);
  } catch (error) {
    console.error('Lỗi:', error);
    return false;
  }
};

// 5. Lấy profile của user hiện tại
export const getMyProfile = async () => {
  try {
    const provider = await getProvider();
    if (!provider) throw new Error('Không có ví');

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return await getProfile(address);
  } catch (error) {
    console.error('Lỗi:', error);
    return null;
  }
};