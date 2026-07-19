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
  ChevronDown,
  Plus,
  X,
  Edit2,
  Trash2,
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

  // State cho chức năng chọn ví
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [sendAmount, setSendAmount] = useState("0.001");
  const [showAmountInput, setShowAmountInput] = useState(false);

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

  // Load saved addresses từ localStorage
  useEffect(() => {
    const addresses = JSON.parse(
      localStorage.getItem("savedAddresses") || "[]",
    );
    setSavedAddresses(addresses);

    // Nếu có địa chỉ trong URL, set làm selected
    if (address) {
      setSelectedAddress(address);
    }
  }, [address]);

  // Lưu addresses vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));
  }, [savedAddresses]);

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

  // Thêm địa chỉ mới
  const handleAddAddress = () => {
    if (!newAddress || !ethers.isAddress(newAddress)) {
      setError("Địa chỉ ví không hợp lệ");
      return;
    }

    const newEntry = {
      address: newAddress,
      label: newAddressLabel || `Ví ${savedAddresses.length + 1}`,
      addedAt: new Date().toISOString(),
    };

    if (editingAddressIndex !== null) {
      // Chỉnh sửa
      const updated = [...savedAddresses];
      updated[editingAddressIndex] = newEntry;
      setSavedAddresses(updated);
      setEditingAddressIndex(null);
    } else {
      // Thêm mới
      setSavedAddresses([...savedAddresses, newEntry]);
    }

    setNewAddress("");
    setNewAddressLabel("");
    setShowAddAddress(false);
    setSelectedAddress(newAddress);
  };

  // Xóa địa chỉ
  const handleDeleteAddress = (index) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      const updated = savedAddresses.filter((_, i) => i !== index);
      setSavedAddresses(updated);
      if (selectedAddress === savedAddresses[index].address) {
        setSelectedAddress("");
      }
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEditAddress = (index) => {
    const entry = savedAddresses[index];
    setNewAddress(entry.address);
    setNewAddressLabel(entry.label);
    setEditingAddressIndex(index);
    setShowAddAddress(true);
  };

  // Handle share profile với địa chỉ được chọn
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

    // Kiểm tra đã chọn địa chỉ chưa
    if (!selectedAddress) {
      setError("Vui lòng chọn địa chỉ ví để gửi giao dịch.");
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
        website: profileData.website || demoProfile.website,
        sharedBy: account,
        sharedAt: new Date().toISOString(),
        profileData: profileData,
        sentTo: selectedAddress,
        amount: sendAmount,
      };

      // Tạo message để sign
      const messageToSign = JSON.stringify({
        action: "SHARE_PROFILE",
        profileAddress: address || account,
        timestamp: Math.floor(Date.now() / 1000),
        sentTo: selectedAddress,
        amount: sendAmount,
        ...shareData,
      });

      console.log("📝 Requesting signature...");
      const signature = await signer.signMessage(messageToSign);
      console.log("✅ Signature obtained:", signature.slice(0, 20) + "...");

      shareData.signature = signature;
      shareData.message = messageToSign;
      sharedProfiles.push(shareData);
      localStorage.setItem("sharedProfiles", JSON.stringify(sharedProfiles));

      console.log("📤 Sending transaction to:", selectedAddress);

      // Gửi transaction đến địa chỉ được chọn
      const txData = {
        to: selectedAddress,
        value: ethers.parseEther(sendAmount),
        data: ethers.toUtf8Bytes(
          `Share profile: ${address || account} from ${account}`,
        ),
      };

      const tx = await signer.sendTransaction(txData);
      console.log("✅ Transaction sent:", tx);
      setTxHash(tx.hash);
      setStatus(`⏳ Đang xác nhận giao dịch...`);

      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      setStatus(
        `✅ Gửi ${sendAmount} ETH thành công đến ${formatAddress(selectedAddress)}`,
      );
      setShareSuccess(true);

      setShareCount(sharedProfiles.length);
      setShares([...shares, shareData]);

      const link = `${window.location.origin}/profile/${address || account}`;
      setShareLink(link);

      setTimeout(() => {
        setShareSuccess(false);
        setStatus("");
      }, 8000);
    } catch (err) {
      console.error("Share error:", err);

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("❌ Giao dịch bị từ chối trong MetaMask");
        setStatus("❌ Người dùng từ chối giao dịch");
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        setError("❌ Không đủ ETH để trả gas fee hoặc gửi");
        setStatus("❌ Không đủ ETH");
      } else {
        setError(`❌ Lỗi: ${err.message}`);
        setStatus(`❌ Lỗi: ${err.message}`);
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
              status.includes("thành công") ||
              status.includes("Successfully") ||
              status.includes("✅")
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : status.includes("❌")
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
            }`}
          >
            {status.includes("thành công") || status.includes("✅") ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : status.includes("❌") ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            )}
            <span className="flex-1">{status}</span>
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
              <span className="text-green-400">
                Chia sẻ thành công! Đã gửi {sendAmount} ETH đến{" "}
                {formatAddress(selectedAddress)}
              </span>
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
                disabled={isSharing || isConnecting || !selectedAddress}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                  !isConnected
                    ? "bg-yellow-600 text-white hover:bg-yellow-700"
                    : isSharing || isConnecting
                      ? "bg-gray-600 text-white animate-pulse"
                      : !selectedAddress
                        ? "bg-gray-600 text-white cursor-not-allowed"
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
                    <Send className="w-4 h-4" />
                    <span>Gửi & Share</span>
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

          {/* Address Selector Section */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-400 text-sm font-medium flex items-center">
                <Wallet className="w-4 h-4 mr-1 text-purple-400" />
                Gửi đến:
              </span>

              {/* Dropdown chọn địa chỉ */}
              <div className="relative">
                <button
                  onClick={() => setShowAddressSelector(!showAddressSelector)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 border border-purple-500/30 rounded-lg hover:border-purple-500 transition text-white text-sm min-w-[200px] justify-between"
                >
                  <span className="truncate">
                    {selectedAddress ? (
                      <>
                        <span className="text-purple-400">●</span>{" "}
                        {savedAddresses.find(
                          (a) => a.address === selectedAddress,
                        )?.label || formatAddress(selectedAddress)}
                      </>
                    ) : (
                      <span className="text-gray-400">Chọn địa chỉ...</span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAddressSelector ? "rotate-180" : ""}`}
                  />
                </button>

                {showAddressSelector && (
                  <div className="absolute top-full left-0 mt-1 w-[300px] max-h-[300px] overflow-y-auto bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl z-50">
                    <div className="p-2">
                      {/* Danh sách địa chỉ đã lưu */}
                      {savedAddresses.length > 0 ? (
                        savedAddresses.map((entry, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded-lg hover:bg-purple-500/10 cursor-pointer ${
                              selectedAddress === entry.address
                                ? "bg-purple-500/20"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedAddress(entry.address);
                              setShowAddressSelector(false);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">
                                {entry.label}
                              </div>
                              <div className="text-gray-400 text-xs truncate">
                                {formatAddress(entry.address)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(index);
                                  setShowAddressSelector(false);
                                }}
                                className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(index);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm p-2 text-center">
                          Chưa có địa chỉ nào
                        </div>
                      )}

                      {/* Nút thêm địa chỉ mới */}
                      <button
                        onClick={() => {
                          setShowAddAddress(true);
                          setShowAddressSelector(false);
                          setEditingAddressIndex(null);
                          setNewAddress("");
                          setNewAddressLabel("");
                        }}
                        className="w-full mt-2 p-2 border border-dashed border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/10 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm địa chỉ mới
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input số lượng ETH */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  min="0"
                  step="0.0001"
                  className="w-24 px-2 py-1.5 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="text-gray-400 text-sm">ETH</span>
              </div>

              {/* Hiển thị địa chỉ đã chọn */}
              {selectedAddress && (
                <span className="text-xs text-green-400 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Sẵn sàng
                </span>
              )}
            </div>
          </div>

          {/* Share Info */}
          {account && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-400 flex items-center">
                  <Send className="w-3 h-3 mr-1 text-blue-400" />
                  Người gửi: {formatAddress(account)}
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

        {/* Modal thêm/chỉnh sửa địa chỉ */}
        {showAddAddress && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border border-purple-500/20 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">
                  {editingAddressIndex !== null
                    ? "Chỉnh sửa địa chỉ"
                    : "Thêm địa chỉ mới"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddAddress(false);
                    setEditingAddressIndex(null);
                    setNewAddress("");
                    setNewAddressLabel("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Nhãn (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    placeholder="Ví của tôi, Ví bạn bè..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Địa chỉ ví *
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowAddAddress(false);
                      setEditingAddressIndex(null);
                      setNewAddress("");
                      setNewAddressLabel("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                  >
                    {editingAddressIndex !== null ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

  
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
