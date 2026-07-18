// frontend/src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useProfileContract } from '../hooks/useProfileContract';
import { 
  User, Mail, Phone, MapPin, Shield, Menu, Wallet, CheckCircle, AlertCircle,
  Edit, Key, Save, X, Briefcase, GraduationCap, Award, Code, Upload, FileText,
  LogOut, Plus, Trash2,   Globe
} from 'lucide-react';
import Header from './Header';
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { account, connectWallet, disconnectWallet, formatAddress, balance } = useWallet();
  const { profile, loading, saveProfile, fetchMyProfile } = useProfileContract();

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    website: ''
  });

  // Load profile data
  useEffect(() => {
    if (profile?.exists) {
      setFormData({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  // Handle save profile
  const handleSave = async () => {
    setError(null);
    try {
      const result = await saveProfile(formData);
      if (result.success) {
        setIsEditing(false);
        alert('Lưu profile thành công!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <div className="min-h-screen  from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}


      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Hồ sơ cá nhân</h1>
              <p className="text-gray-400 mt-1">Quản lý thông tin cá nhân của bạn trên Blockchain</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 hover:scale-105">
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              ) : (
                <>
                  <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 hover:scale-105">
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Đang lưu...' : 'Lưu'}</span>
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {!account ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-12 text-center">
              <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl text-white font-semibold mb-2">Kết nối ví để xem hồ sơ</h3>
              <p className="text-gray-400 mb-4">Vui lòng kết nối MetaMask để quản lý hồ sơ của bạn</p>
              <button onClick={connectWallet} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Kết nối ví
              </button>
            </div>
          ) : loading ? (
            <div className="text-center text-white py-12">Đang tải...</div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-1 mx-auto">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-16 h-16 text-purple-400" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-white mt-4">
                    {isEditing ? (
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-purple-500/30 rounded-lg px-3 py-1 text-white text-center focus:outline-none focus:border-purple-500" />
                    ) : profile?.fullName || 'Chưa có tên'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Ứng viên</p>
                  {profile?.exists && (
                    <div className="mt-3 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20 inline-block">
                      <span className="text-xs text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Đã xác minh trên Blockchain</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Thông tin liên hệ</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Mail className="w-4 h-4 text-purple-400" />
                      {isEditing ? <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="flex-1 bg-gray-700/50 border border-purple-500/30 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-purple-500" /> : <span>{profile?.email || 'Chưa có'}</span>}
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Phone className="w-4 h-4 text-purple-400" />
                      {isEditing ? <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="flex-1 bg-gray-700/50 border border-purple-500/30 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-purple-500" /> : <span>{profile?.phone || 'Chưa có'}</span>}
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Địa chỉ ví: {formatAddress(account)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Mạng xã hội</h3>
                  <div className="space-y-3">
                     
                     
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Globe className="w-4 h-4 text-purple-400" />
                      {isEditing ? <input type="text" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://mywebsite.com" className="flex-1 bg-gray-700/50 border border-purple-500/30 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-purple-500" /> : <span>{profile?.website || 'Chưa có'}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Giới thiệu</h3>
                  {isEditing ? (
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className="w-full bg-gray-700/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none" />
                  ) : (
                    <p className="text-gray-300">{profile?.bio || 'Chưa có giới thiệu'}</p>
                  )}
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Code className="w-5 h-5 text-purple-400 mr-2" />
                    Thông tin Blockchain
                  </h3>
                  <div className="space-y-2 text-gray-300 text-left">
                    <p><span className="text-gray-500">Địa chỉ ví:</span> {account}</p>
                    <p><span className="text-gray-500">Số dư:</span> {balance} ETH</p>
                    {profile?.exists && (
                      <>
                        <p><span className="text-gray-500">Cập nhật lần cuối:</span> {new Date(profile.updatedAt * 1000).toLocaleString()}</p>
                        <p><span className="text-gray-500">Trạng thái:</span> <span className="text-green-400">✓ Đã xác minh</span></p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;