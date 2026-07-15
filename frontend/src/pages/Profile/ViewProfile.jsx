// frontend/src/pages/Profile/ViewProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { useProfileContract } from '../../hooks/useProfileContract';
import { 
  User, Mail, Phone, MapPin, Shield, Menu, Wallet, CheckCircle, AlertCircle,
  Briefcase, GraduationCap, Award, Code,  Globe,
  Calendar, ExternalLink, MessageCircle, Share2, Heart, X, Upload
} from 'lucide-react';

const ViewProfile = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { account, connectWallet, disconnectWallet, formatAddress, balance } = useWallet();
  const { fetchProfile } = useProfileContract();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetAddress = address || account;
        if (!targetAddress) {
          setError('Không có địa chỉ ví');
          setLoading(false);
          return;
        }
        const data = await fetchProfile(targetAddress);
        setViewingProfile(data);
        if (!data?.exists) {
          setError('Không tìm thấy hồ sơ');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [address, account, fetchProfile]);

  // Sample profile data if not exists (for demo)
  const demoProfile = {
    fullName: 'Nguyễn Văn A',
    bio: 'Blockchain Developer với 5 năm kinh nghiệm trong Web3 và Smart Contract',
    email: 'nguyenvana@email.com',
    phone: '0123 456 789',
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    website: 'https://mywebsite.com',
    exists: true,
    updatedAt: Date.now() / 1000
  };

  const profile = viewingProfile?.exists ? viewingProfile : demoProfile;

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-bold text-white">Block<span className="text-purple-500">Portfolio</span></span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-300 hover:text-purple-400 transition-colors">
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {account ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">{balance} ETH</span>
                  </div>
                  <button onClick={disconnectWallet} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">{formatAddress(account)}</span>
                  </button>
                </div>
              ) : (
                <button onClick={connectWallet} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:scale-110">
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-300">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center text-white py-12">Đang tải hồ sơ...</div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
                      </div>
                    </div>
                    {profile?.exists && (
                      <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-gray-800">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.fullName}</h1>
                        <p className="text-purple-400">Blockchain Developer</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {profile.email}</span>
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {profile.phone}</span>
                      <span className="flex items-center"><Wallet className="w-4 h-4 mr-1" /> {address ? formatAddress(address) : formatAddress(account)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 hover:scale-105">
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                    <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 hover:scale-105">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => { setIsLiked(!isLiked); setLikeCount(isLiked ? likeCount - 1 : likeCount + 1); }}
                      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 hover:scale-105 ${isLiked ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Giới thiệu</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Code className="w-5 h-5 text-purple-400 mr-2" />
                      Kỹ năng
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Solidity', 'React', 'Node.js', 'Ethereum', 'Web3.js', 'TypeScript', 'Hardhat'].map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Kết nối</h3>
                    <div className="flex space-x-3">
                      {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 rounded-lg hover:bg-purple-600 transition-all hover:scale-110">
                          <Github className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 rounded-lg hover:bg-blue-600 transition-all hover:scale-110">
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 rounded-lg hover:bg-green-600 transition-all hover:scale-110">
                          <Globe className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
                      Kinh nghiệm
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: 'Senior Blockchain Developer', company: 'BlockTech Solutions', period: '2021 - Hiện tại', description: 'Phát triển và triển khai smart contract trên Ethereum, xây dựng DApps và quản lý dự án blockchain.' },
                        { title: 'Smart Contract Developer', company: 'CryptoStart', period: '2019 - 2021', description: 'Thiết kế và phát triển smart contract cho các dự án DeFi, tham gia audit và bảo mật hợp đồng thông minh.' }
                      ].map((exp, index) => (
                        <div key={index} className="border-l-2 border-purple-500 pl-4">
                          <h4 className="text-white font-semibold">{exp.title}</h4>
                          <p className="text-purple-400 text-sm">{exp.company}</p>
                          <p className="text-gray-500 text-xs flex items-center"><Calendar className="w-3 h-3 mr-1" /> {exp.period}</p>
                          <p className="text-gray-400 text-sm mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <GraduationCap className="w-5 h-5 text-green-400 mr-2" />
                        Học vấn
                      </h3>
                      <div>
                        <h4 className="text-white font-semibold">Đại học Bách Khoa Hà Nội</h4>
                        <p className="text-gray-400 text-sm">Kỹ thuật Máy tính</p>
                        <p className="text-gray-500 text-xs">2015 - 2019</p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Award className="w-5 h-5 text-yellow-400 mr-2" />
                        Chứng chỉ
                      </h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Certified Blockchain Developer', issuer: 'Blockchain Council', year: '2022' },
                          { name: 'Ethereum Developer Program', issuer: 'Ethereum Foundation', year: '2021' }
                        ].map((cert, index) => (
                          <div key={index} className="border-b border-gray-700 last:border-0 pb-2 last:pb-0">
                            <h4 className="text-white font-semibold text-sm">{cert.name}</h4>
                            <p className="text-gray-400 text-xs">{cert.issuer}</p>
                            <p className="text-gray-500 text-xs">{cert.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 hover:scale-105">
                      <MessageCircle className="w-4 h-4" />
                      <span>Liên hệ</span>
                    </button>
                    <button className="px-6 py-3 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-all flex items-center gap-2 hover:scale-105">
                      <ExternalLink className="w-4 h-4" />
                      <span>Xem Portfolio</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="text-white font-semibold">BlockPortfolio</span>
            </div>
            <p className="text-sm text-gray-400">© 2024 BlockPortfolio. Built with ❤️ on Web3</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ViewProfile;