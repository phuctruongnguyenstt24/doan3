// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import {
  Shield, Menu, Wallet, CheckCircle, User, Settings, LogOut,
  Upload, FileText, X
} from 'lucide-react';

const Header = ({ navItems = [], onProfileUpload, onCvUpload }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { account, balance, connectWallet, disconnectWallet, formatAddress, isConnecting } = useWallet();

  const handleNavigation = (path) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Shield className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold text-white">
              Block<span className="text-purple-500">Portfolio</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.isButton) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                  >
                    {item.name}
                  </button>
                );
              }
              return (
                <a
                  key={item.name}
                  href={item.path}
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                  onClick={(e) => {
                    if (item.path?.startsWith('/')) {
                      e.preventDefault();
                      navigate(item.path);
                    }
                  }}
                >
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Wallet & Actions */}
          <div className="flex items-center space-x-4">
            {/* Upload Buttons */}
            {account && (
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={onProfileUpload}
                  className="px-3 py-1.5 text-sm bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center space-x-1"
                >
                  <Upload className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={onCvUpload}
                  className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>CV</span>
                </button>
              </div>
            )}

            {/* Wallet Button */}
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">{balance} ETH</span>
                </div>
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200">
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">{formatAddress(account)}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-purple-600/20 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-purple-600/20 rounded-lg transition-colors flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={disconnectWallet}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 hover:scale-110 hover:shadow-xl"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-purple-500/20">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => {
                if (item.isButton) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleNavigation(item.path);
                      }}
                      className="text-left text-gray-300 hover:text-purple-400 transition-colors duration-200 py-2 bg-transparent border-none cursor-pointer"
                    >
                      {item.name}
                    </button>
                  );
                }
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-200 py-2"
                    onClick={(e) => {
                      if (item.path?.startsWith('/')) {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        navigate(item.path);
                      }
                    }}
                  >
                    {item.name}
                  </a>
                );
              })}
              {account && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onProfileUpload();
                    }}
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors py-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCvUpload();
                    }}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors py-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Upload CV</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;