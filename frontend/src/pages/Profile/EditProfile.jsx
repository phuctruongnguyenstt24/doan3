// frontend/src/pages/Profile/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { ProfileService } from '../../services/ProfileService';
import { ethers } from 'ethers';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { wallet, isConnected, connect } = useWallet();
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    email: '',
    phone: '',
    avatarHash: '',
    github: '',
    linkedin: '',
    website: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!isConnected) {
      connect();
    } else if (wallet?.signer) {
      loadExistingProfile();
      loadBalance();
    }
  }, [isConnected, wallet?.signer]);

  const loadExistingProfile = async () => {
    if (!wallet?.signer) return;
    
    try {
      setLoading(true);
      const profileService = new ProfileService(wallet.signer);
      const profileData = await profileService.getProfile(wallet.address);
      
      if (profileData?.exists) {
        setFormData({
          fullName: profileData.fullName || '',
          bio: profileData.bio || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          avatarHash: profileData.avatarHash || '',
          github: profileData.github || '',
          linkedin: profileData.linkedin || '',
          website: profileData.website || ''
        });
        setIsEditMode(true);
      }
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      if (!wallet?.address) return;
      const provider = wallet.provider || new ethers.providers.Web3Provider(window.ethereum);
      const balanceWei = await provider.getBalance(wallet.address);
      setBalance(ethers.utils.formatEther(balanceWei));
    } catch (err) {
      console.error("Error loading balance:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wallet?.signer) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxStatus('⏳ Preparing transaction...');
      setTxHash(null);

      const profileService = new ProfileService(wallet.signer);
      
      const dataWithAddress = {
        ...formData,
        address: wallet.address
      };
      
      setTxStatus('⏳ Sending transaction to blockchain...');
      
      const tx = await profileService.createOrUpdateProfile(dataWithAddress);
      setTxHash(tx.hash);
      
      setTxStatus('⏳ Waiting for confirmation...');
      
      // Chờ transaction được confirm
      await tx.wait();
      
      setTxStatus(`✅ ${isEditMode ? 'Updated' : 'Created'} successfully!`);
      
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
      setTxStatus('❌ Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="edit-profile-container">
      <button onClick={() => navigate('/profile')} className="back-btn">
        ← Back to Profile
      </button>

      <div className="edit-profile-card">
        <h2>{isEditMode ? '✏️ Edit Profile' : '✨ Create Profile'}</h2>
        
        {/* Wallet Info */}
        <div className="wallet-info-bar">
          <div className="wallet-address">
            <strong>🔗 Connected:</strong>
            <span>{wallet?.address ? formatAddress(wallet.address) : 'Not connected'}</span>
            {wallet?.address && (
              <button 
                onClick={() => copyToClipboard(wallet.address)}
                className="copy-btn-small"
                title="Copy full address"
              >
                📋
              </button>
            )}
          </div>
          {balance && (
            <div className="wallet-balance">
              <strong>💰 Balance:</strong>
              <span>{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          )}
        </div>

        {/* Transaction Status */}
        {txStatus && (
          <div className={`tx-status ${txStatus.includes('✅') ? 'success' : txStatus.includes('❌') ? 'error' : 'pending'}`}>
            {txStatus}
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="tx-hash-info">
            <strong>Transaction Hash:</strong>
            <a 
              href={`https://etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {formatAddress(txHash)}
            </a>
            <button 
              onClick={() => copyToClipboard(txHash)}
              className="copy-btn-small"
            >
              📋
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+84 123 456 789"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Avatar Hash (IPFS)</label>
            <input
              type="text"
              name="avatarHash"
              value={formData.avatarHash}
              onChange={handleChange}
              placeholder="Qm... (IPFS hash)"
            />
            <small>Upload image to IPFS and paste the hash here</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GitHub Username</label>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="username"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn Username</label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? '⏳ Processing...' : isEditMode ? '💾 Update Profile' : '🚀 Create Profile'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/profile')} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;