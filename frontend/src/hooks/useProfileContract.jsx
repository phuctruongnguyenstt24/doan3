// hooks/useProfileContract.js
import { useState, useEffect } from 'react';
import { getMyProfile, getProfile, createOrUpdateProfile, updateAvatar, profileExists } from '../utils/contract';

export const useProfileContract = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy profile của user hiện tại
  const fetchMyProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy profile của user khác
  const fetchProfile = async (address) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile(address);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo hoặc cập nhật profile
  const saveProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createOrUpdateProfile(data);
      if (result.success) {
        // Refresh profile sau khi lưu
        await fetchMyProfile();
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật avatar
  const saveAvatar = async (avatarHash) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateAvatar(avatarHash);
      if (result.success) {
        await fetchMyProfile();
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra profile tồn tại
  const checkExists = async (address) => {
    try {
      return await profileExists(address);
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Tự động fetch profile khi component mount
  useEffect(() => {
    const init = async () => {
      const provider = window.ethereum;
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await fetchMyProfile();
        }
      }
    };
    init();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchMyProfile,
    fetchProfile,
    saveProfile,
    saveAvatar,
    checkExists
  };
};