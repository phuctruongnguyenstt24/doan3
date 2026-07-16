// frontend/src/pages/Profile/ViewProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { ProfileService } from "../services/profileService";
import {
  User,
  Mail,
  Phone,
  Wallet,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Calendar,
  ExternalLink,
  MessageCircle,
  Share2,
  Heart,
  Send,
  Link,
  QrCode,
  Copy,
  Loader2,
} from "lucide-react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = 11155111;

const ViewProfile = () => {
  const { address } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [shares, setShares] = useState([]);
  const [status, setStatus] = useState("");

  const {
    account,
    connectWallet,
    formatAddress,
    contract,
    isConnected,
    loading: isConnecting,
    signer,
  } = useWallet();

  // Sample profile data
  const demoProfile = {
    fullName: "Nguyễn Văn A",
    bio: "Blockchain Developer với 5 năm kinh nghiệm trong Web3 và Smart Contract",
    email: "nguyenvana@email.com",
    phone: "0123 456 789",
    github: "https://github.com/username",
    linkedin: "https://linkedin.com/in/username",
    website: "https://mywebsite.com",
    exists: true,
    updatedAt: Date.now() / 1000,
  };

  const profile = viewingProfile || demoProfile;

  // Kiểm tra mạng Sepolia
  const ensureSepolia = async () => {
    if (!window.ethereum?.request) return false;
    try {
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      return Number(chainIdHex) === SEPOLIA_CHAIN_ID;
    } catch {
      return false;
    }
  };

  // Tạo ProfileService instance
  const getProfileService = () => {
    if (!contract) {
      throw new Error("Smart contract chưa được khởi tạo.");
    }
    return new ProfileService(contract);
  };

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetAddress = address || account;
        if (!targetAddress) {
          setError("Không có địa chỉ ví");
          setLoading(false);
          return;
        }

        if (!contract) {
          setViewingProfile(demoProfile);
          setLoading(false);
          return;
        }

        const profileService = getProfileService();
        const data = await profileService.getProfile(targetAddress);

        if (data) {
          setViewingProfile(data);
          await loadShareInfo(targetAddress);
        } else {
          setViewingProfile(demoProfile);
        }
      } catch (err) {
        console.error("Load profile error:", err);
        setError(err.message);
        setViewingProfile(demoProfile);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [address, account, contract]);

  // Auto connect
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum && !account) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.log("Auto connect skipped:", err);
        }
      }
    };
    autoConnect();
  }, []);

  // Load share information
  const loadShareInfo = async (targetAddress) => {
    try {
      if (contract && targetAddress) {
        try {
          const count = await contract.getShareCount(targetAddress);
          setShareCount(Number(count));
          const sharesData = await contract.getShares(targetAddress);
          setShares(sharesData);
        } catch (err) {
          console.warn("Share functions not available:", err);
        }
      }
    } catch (err) {
      console.warn("Cannot load share info:", err);
      const sharedProfiles = JSON.parse(
        localStorage.getItem("sharedProfiles") || "[]",
      );
      const profileShares = sharedProfiles.filter(
        (p) => p.profileAddress === targetAddress,
      );
      setShareCount(profileShares.length);
      setShares(profileShares);
    }
  };

  // Handle share profile
  const handleShareProfile = async () => {
    setStatus("");
    setError(null);
    setShareSuccess(false);
    

    if (!isConnected) {
      try {
        await connectWallet();
        if (!isConnected) {
          setStatus("Vui lòng kết nối MetaMask.");
          return;
        }
      } catch (err) {
        setError("Không thể kết nối MetaMask.");
        return;
      }
    }

    if (!signer || !contract || !account) {
      setError("Vui lòng kết nối MetaMask.");
      return;
    }

    const isSepolia = await ensureSepolia();
    if (!isSepolia) {
      setError("Vui lòng chuyển sang Sepolia testnet.");
      return;
    }

    setIsSharing(true);
    

    try {
      const profileService = getProfileService();
      const profileData = await profileService.getProfile(address || account);

      if (!profileData?.exists) {
        throw new Error("Không tìm thấy hồ sơ.");
      }

      // Lưu vào localStorage trước
      const sharedProfiles = JSON.parse(
        localStorage.getItem("sharedProfiles") || "[]",
      );

      const shareData = {
        profileAddress: address || account,
        fullName: profileData.fullName || demoProfile.fullName,
        bio: profileData.bio || demoProfile.bio,
        email: profileData.email || demoProfile.email,
        phone: profileData.phone || demoProfile.phone,
        github: profileData.github || demoProfile.github,
        linkedin: profileData.linkedin || demoProfile.linkedin,
        website: profileData.website || demoProfile.website,
        sharedBy: account,
        sharedAt: new Date().toISOString(),
        profileData: profileData,
      };

      // Tạo message để sign
      const messageToSign = JSON.stringify({
        action: "SHARE_PROFILE",
        profileAddress: address || account,
        timestamp: Math.floor(Date.now() / 1000),
        ...shareData,
      });

      // Sign message (giao dịch này sẽ hiện trong MetaMask)
      console.log("📝 Requesting signature...");
      const signature = await signer.signMessage(messageToSign);
      console.log("✅ Signature obtained:", signature.slice(0, 20) + "...");

      // Lưu với signature
      shareData.signature = signature;
      shareData.message = messageToSign;
      sharedProfiles.push(shareData);
      localStorage.setItem("sharedProfiles", JSON.stringify(sharedProfiles));

      // Tạo transaction giả để hiển thị trên MetaMask
      // Gửi 0 ETH đến chính mình như một cách ghi log
      console.log("📤 Sending transaction to log share...");

      // Tạo transaction data để ghi log
      const txData = {
        to: "0x614441e0f294398F4996a2e843ef4434f51813c5" ,// Gửi về chính mình
        value: ethers.parseEther("0.001"), // 0 ETH
        data: ethers.toUtf8Bytes(`Share profile: ${address || account}`),
        
      };

      // Gửi transaction
      const tx = await signer.sendTransaction(txData);
      console.log("✅ Transaction sent:", tx);
      setTxHash(tx.hash);
      

      // Chờ xác nhận
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

       
      setShareSuccess(true);
      

      // Tăng share count
      setShareCount(sharedProfiles.length);
      setShares([...shares, shareData]);

      const link = `${window.location.origin}/profile/${address || account}`;
      setShareLink(link);

      setTimeout(() => setShareSuccess(false), 5000);
    } catch (err) {
      console.error("Share error:", err);
  

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("❌ Giao dịch bị từ chối trong MetaMask");
        setStatus("❌ Người dùng từ chối giao dịch");
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        setError("❌ Không đủ ETH để trả gas fee");
        setStatus("❌ Không đủ ETH");
      } else {
        setError(`❌ Lỗi: ${err.message}`);
    
      }
    } finally {
      setIsSharing(false);
    }
  };
  // Copy link
  const copyToClipboard = async () => {
    try {
      const link =
        shareLink || `${window.location.origin}/profile/${address || account}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <span>Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Status Messages */}
        {status && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
              status.includes("thành công") || status.includes("Successfully")
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
            }`}
          >
            {status.includes("thành công") ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            )}
            <span>{status}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {shareSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Chia sẻ thành công!</span>
            </div>
            <div className="flex items-center gap-2">
              {txHash && txHash !== "pending" && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Xem giao dịch
                </a>
              )}
              {shareLink && (
                <button
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-sm"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Đã copy!" : "Copy link"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
                </div>
              </div>
              {profile?.exists && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-gray-800">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {profile.fullName}
                </h1>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
                {shareCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center">
                    <Share2 className="w-3 h-3 mr-1" />
                    {shareCount}x
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                <span className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> {profile.email}
                </span>
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" /> {profile.phone}
                </span>
                <span className="flex items-center">
                  <Wallet className="w-3 h-3 mr-1" />{" "}
                  {formatAddress(address || account)}
                </span>
              </div>

              <p className="text-gray-300 text-sm mt-2">{profile.bio}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleShareProfile}
                disabled={isSharing || isConnecting}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                  !isConnected
                    ? "bg-yellow-600 text-white hover:bg-yellow-700"
                    : isSharing || isConnecting
                      ? "bg-gray-600 text-white animate-pulse"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                }`}
              >
                {!isConnected ? (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Kết nối</span>
                  </>
                ) : isSharing || isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {isConnecting ? "Đang kết nối..." : "Đang xác nhận..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsLiked(!isLiked);
                  setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
                }}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>

          {/* Share Info */}
          {account && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-400 flex items-center">
                  <Send className="w-3 h-3 mr-1 text-blue-400" />
                  {formatAddress(account)}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Link className="w-3 h-3" />
                  {copied ? "Đã copy!" : "Copy link"}
                </button>
                <button
                  onClick={() => console.log("QR Code")}
                  className="text-gray-400 hover:text-gray-300 flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3" />
                </button>
                {shares.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      Đã chia sẻ bởi:
                    </span>
                    {shares.slice(0, 3).map((share, index) => (
                      <span
                        key={index}
                        className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full"
                      >
                        {formatAddress(share.sharer || share.sharedBy)}
                      </span>
                    ))}
                    {shares.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{shares.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Skills & Info Grid */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {/* Skills */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Code className="w-4 h-4 text-purple-400 mr-2" />
              Kỹ năng
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Solidity",
                "React",
                "Node.js",
                "Ethereum",
                "Web3.js",
                "TypeScript",
                "Hardhat",
              ].map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Briefcase className="w-4 h-4 text-blue-400 mr-2" />
              Kinh nghiệm
            </h3>
            <div className="space-y-2">
              <div className="border-l-2 border-purple-500 pl-2">
                <h4 className="text-white text-sm font-semibold">
                  Senior Blockchain Developer
                </h4>
                <p className="text-purple-400 text-xs">BlockTech Solutions</p>
                <p className="text-gray-500 text-xs flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> 2021 - Hiện tại
                </p>
              </div>
            </div>
          </div>

          {/* Education & Certificates */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <GraduationCap className="w-4 h-4 text-green-400 mr-2" />
              Học vấn
            </h3>
            <div>
              <h4 className="text-white text-sm font-semibold">
                Đại học Bách Khoa Hà Nội
              </h4>
              <p className="text-gray-400 text-xs">Kỹ thuật Máy tính</p>
              <p className="text-gray-500 text-xs">2015 - 2019</p>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <h4 className="text-white text-sm font-semibold flex items-center">
                <Award className="w-3 h-3 text-yellow-400 mr-1" />
                Chứng chỉ
              </h4>
              <p className="text-gray-400 text-xs">
                Certified Blockchain Developer
              </p>
              <p className="text-gray-500 text-xs">Blockchain Council - 2022</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>Liên hệ</span>
          </button>
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-all flex items-center gap-2 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
