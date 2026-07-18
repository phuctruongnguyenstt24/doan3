// frontend/src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useProfileContract } from '../hooks/useProfileContract';
import Header from './Header';
import {
  Wallet,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Code,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText
} from 'lucide-react';

const Home = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Sử dụng wallet context
  const { 
    account, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    formatAddress, 
    isConnecting 
  } = useWallet();
  
  // Sử dụng profile contract hook
  const { profile, loading, fetchMyProfile } = useProfileContract();

  // Navigation items
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/aboutpage' },
    { name: 'About', href: '/aboutpage' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '/viewprofile' },
  ];

  // Stats data
  const stats = [
    { icon: Shield, label: 'Smart Contracts', value: '12+' },
    { icon: Code, label: 'DApps Built', value: '8' },
    { icon: Users, label: 'Community', value: '5K+' },
    { icon: Star, label: 'Reviews', value: '4.9' },
  ];

  // Xử lý upload profile
  const handleProfileUpload = () => {
    if (!account) {
      setError("Please connect wallet first!");
      return;
    }
    navigate("/profile");
  };

  // Xử lý upload CV
  const handleCvUpload = () => {
    if (!account) {
      setError("Please connect wallet first!");
      return;
    }
    navigate("/sendcv");
  };

  // Xử lý about page
  const handleAboutPage = () => {
    if (!account) {
      setError("Please connect your wallet first!");
      return;
    }
    navigate("/aboutpage");
  };

  // Xử lý view CV
  const handleViewCV = () => {
    if (!account) {
      setError("Please connect your wallet first!");
      return;
    }
    navigate("/viewcv");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
     

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  Web3 & Blockchain
                </span>
                {account && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Connected</span>
                  </span>
                )}
                {profile?.exists && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Profile on Blockchain</span>
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Build Your <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Decentralized
                </span> <br />
                Portfolio
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Showcase your blockchain skills, connect with the community, 
                and build your decentralized identity on the blockchain.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {!account && (
                  <button
                    onClick={connectWallet}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet to Start</span>
                  </button>
                )}
                {account && (
                  <>
                    <button
                      onClick={handleProfileUpload}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{profile?.exists ? 'Update Profile' : 'Upload Profile'}</span>
                    </button>
                    <button
                      onClick={handleCvUpload}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Upload CV</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleViewCV}
                  className="px-6 py-3 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-all duration-200 flex items-center space-x-2 hover:scale-110 hover:shadow-xl cursor-pointer"
                >
                  <span>Explore Portfolios</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="relative z-10 p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200"
                      >
                        <Icon className="w-8 h-8 text-purple-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-20"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="portfolio" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why <span className="text-purple-400">BlockPortfolio</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:scale-105">
              <Shield className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Decentralized</h3>
              <p className="text-gray-400">
                Your data is stored on the blockchain, giving you full control and ownership.
              </p>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:scale-105">
              <Zap className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Immutable</h3>
              <p className="text-gray-400">
                Your achievements and credentials are permanently recorded and verifiable.
              </p>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:scale-105">
              <Globe className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Global</h3>
              <p className="text-gray-400">
                Connect with developers and projects worldwide in the Web3 ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 md:p-12 text-center border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your Blockchain Portfolio?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers showcasing their Web3 projects on the blockchain.
            </p>
            {!account ? (
              <button
                onClick={connectWallet}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-110"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet Now</span>
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleProfileUpload}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                >
                  <Upload className="w-5 h-5" />
                  <span>{profile?.exists ? 'Update Profile' : 'Upload Profile'}</span>
                </button>
                <button
                  onClick={handleCvUpload}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  <span>Upload CV</span>
                </button>
                <button
                  onClick={handleViewCV}
                  className="px-8 py-3 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-110"
                >
                  <span>View Portfolios</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="text-white font-semibold">BlockPortfolio</span>
            </div>
            <p className="text-sm text-gray-400 mt-4 md:mt-0">
              © 2024 BlockPortfolio. Built with ❤️ on Web3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;