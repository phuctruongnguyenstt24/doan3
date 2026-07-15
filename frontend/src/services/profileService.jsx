// services/profileService.js
import { ethers } from 'ethers';

export class ProfileService {
  constructor(contract) {
    this.contract = contract;
  }

  async getProfile(address) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Kiểm tra profile tồn tại
      let exists = false;
      try {
        exists = await this.contract.profileExists(address);
      } catch (err) {
        console.warn('Error checking profile existence:', err);
        // Nếu contract không có hàm này, giả định profile không tồn tại
        return {
          exists: false,
          fullName: '',
          bio: '',
          email: '',
          phone: '',
          avatarHash: '',
          updatedAt: null
        };
      }
      
      if (!exists) {
        return {
          exists: false,
          fullName: '',
          bio: '',
          email: '',
          phone: '',
          avatarHash: '',
          updatedAt: null
        };
      }

      // Lấy dữ liệu profile
      let profileData;
      try {
        profileData = await this.contract.getProfile(address);
      } catch (err) {
        console.error('Error calling getProfile:', err);
        return {
          exists: false,
          fullName: '',
          bio: '',
          email: '',
          phone: '',
          avatarHash: '',
          updatedAt: null
        };
      }
      
      // Kiểm tra dữ liệu trả về
      if (!profileData || typeof profileData !== 'object') {
        return {
          exists: false,
          fullName: '',
          bio: '',
          email: '',
          phone: '',
          avatarHash: '',
          updatedAt: null
        };
      }

      // Trả về dữ liệu với kiểm tra an toàn
      return {
        fullName: profileData.fullName || profileData[0] || '',
        bio: profileData.bio || profileData[1] || '',
        email: profileData.email || profileData[2] || '',
        phone: profileData.phone || profileData[3] || '',
        avatarHash: profileData.avatarHash || profileData[4] || '',
        updatedAt: profileData.updatedAt || profileData[5] || null,
        exists: true,
        address: address
      };
    } catch (error) {
      console.error('Error fetching profile from blockchain:', error);
      return {
        exists: false,
        fullName: '',
        bio: '',
        email: '',
        phone: '',
        avatarHash: '',
        updatedAt: null
      };
    }
  }

  async createOrUpdateProfile(profileData) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      if (!profileData.fullName || profileData.fullName.trim() === '') {
        throw new Error('Full name is required');
      }

      console.log('Sending transaction to blockchain...');
      console.log('Profile data:', profileData);
      
      // Kiểm tra xem contract có hàm createOrUpdateProfile không
      if (typeof this.contract.createOrUpdateProfile !== 'function') {
        throw new Error('Contract does not have createOrUpdateProfile function');
      }
      
      // Gọi hàm với tham số phù hợp với ABI
      const tx = await this.contract.createOrUpdateProfile(
        profileData.fullName.trim(),
        profileData.bio || '',
        profileData.email || '',
        profileData.phone || '',
        profileData.avatarHash || ''
      );
      
      console.log('Transaction sent, waiting for confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed! Hash:', receipt.transactionHash);
      
      return receipt;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async profileExists(address) {
    try {
      if (!this.contract) return false;
      if (typeof this.contract.profileExists !== 'function') {
        console.warn('profileExists function not available');
        return false;
      }
      return await this.contract.profileExists(address);
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  isValidAddress(address) {
    return address && /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}