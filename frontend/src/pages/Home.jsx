import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Menu, 
 
   
  Mail,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Code,
  Briefcase,
  Users,
  Star,
  ChevronRight,
  ExternalLink,
  Upload,
  FileText,
  User,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [isProfileUpload, setIsProfileUpload] = useState(false);
  const [isCvUpload, setIsCvUpload] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra kết nối MetaMask khi component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Kiểm tra kết nối ví
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await getNetworkAndBalance(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  // Kết nối MetaMask
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask!');
        setIsConnecting(false);
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAccount(accounts[0]);
      await getNetworkAndBalance(accounts[0]);

      // Lắng nghe sự kiện thay đổi tài khoản
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Lấy thông tin network và balance
  const getNetworkAndBalance = async (address) => {
    try {
      // Lấy chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(chainId);

      // Lấy balance
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      const balanceInEth = parseInt(balanceHex, 16) / 1e18;
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Error getting network info:', error);
    }
  };

  // Xử lý khi tài khoản thay đổi
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // Người dùng đã ngắt kết nối
      setAccount(null);
      setBalance(null);
      setNetwork(null);
    } else {
      setAccount(accounts[0]);
      getNetworkAndBalance(accounts[0]);
    }
  };

  // Xử lý khi chain thay đổi
  const handleChainChanged = () => {
    window.location.reload();
  };

  // Ngắt kết nối
  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setNetwork(null);
    // Cleanup listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Format địa chỉ ví
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Xử lý upload profile
const handleProfileUpload = () => {
  if (!account) {
    setError("Please connect wallet first!");
    return;
  }

  console.log("Upload profile for:", account);

  navigate("/profile");
};
  // Xử lý upload CV
 const handleCvUpload = () => {
    if (!account) {
        setError("Please connect wallet first!");
        return;
    }

    console.log("Upload CV for:", account);

    navigate("/sendcv");
};

  // Navigation items
  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  // Stats data
  const stats = [
    { icon: Shield, label: 'Smart Contracts', value: '12+' },
    { icon: Code, label: 'DApps Built', value: '8' },
    { icon: Users, label: 'Community', value: '5K+' },
    { icon: Star, label: 'Reviews', value: '4.9' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-bold text-white">
                Block<span className="text-purple-500 color">Portfolio</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Wallet & Actions */}
            <div className="flex items-center space-x-4">
              {/* Upload Buttons */}
              {account && (
                <div className="hidden lg:flex items-center space-x-2">
                  <button
                    onClick={handleProfileUpload}
                    className="px-3 py-1.5 text-sm bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center space-x-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={handleCvUpload}
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
                    <button
                      onClick={disconnectWallet}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="hidden sm:inline">{formatAddress(account)}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-2 space-y-1">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-purple-600/20 rounded-lg transition-colors flex items-center space-x-2">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 hover:scale-110 hover:shadow-xl always-wiggle"
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
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                {account && (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleProfileUpload}
                      className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors py-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Profile</span>
                    </button>
                    <button
                      onClick={handleCvUpload}
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

              {/*thêm hover:scale-110 hover:shadow-xl cho button*/}
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
                      <span>Upload Profile</span>
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
                <a
                  href="#portfolio"
                  className="px-6 py-3 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-all duration-200 flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                >
                  <span>Explore Portfolios</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
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
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:scale-110">
              <Shield className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Decentralized</h3>
              <p className="text-gray-400">
                Your data is stored on the blockchain, giving you full control and ownership.
              </p>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:scale-110">
              <Zap className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Immutable</h3>
              <p className="text-gray-400">
                Your achievements and credentials are permanently recorded and verifiable.
              </p>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200 hover:scale-110">
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
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-110 always-wiggle"
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
                  <span>Upload Profile</span>
                </button>
                <button
                  onClick={handleCvUpload}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-110 hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  <span>Upload CV</span>
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
            
            {/* <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div> */}
            
            <p className="text-sm text-gray-400 mt-4 md:mt-0">
              © 2024 BlockPortfolio. Built with ❤️ on Web3
            </p>
          </div>
        </div>
      </footer>

      {/* Modals for upload (placeholder) */}
      {isProfileUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Upload Profile</h3>
            <p className="text-gray-300 mb-6">Upload your profile picture and information.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsProfileUpload(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {isCvUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Upload CV</h3>
            <p className="text-gray-300 mb-6">Upload your CV/Resume (PDF, DOC, etc.)</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsCvUpload(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;