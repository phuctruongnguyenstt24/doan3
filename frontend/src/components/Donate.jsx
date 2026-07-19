// frontend/src/components/Donate.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Heart,
  Coffee,
  Wallet,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  Coins,
  MessageSquare,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import {
  isDonateContractConfigured,
  sendDonation,
  getDonateOwner,
  getTotalDonated,
  getDonationCount,
  getDonations,
} from '../utils/donateContract';

const SEPOLIA_CHAIN_ID = 11155111;
const QUICK_AMOUNTS = ['0.001', '0.005', '0.01', '0.05'];
const MESSAGE_LIMIT = 280;

const timeAgo = (unixSeconds) => {
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

const formatAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

const Donate = () => {
  const { account, connectWallet, isConnecting } = useWallet();

  const [amount, setAmount] = useState('0.005');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text, hash? }
  const [copied, setCopied] = useState(false);

  const [ownerAddress, setOwnerAddress] = useState('');
  const [totalDonated, setTotalDonated] = useState('0');
  const [donationCount, setDonationCount] = useState(0);
  const [donations, setDonations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const configured = isDonateContractConfigured();

  const refreshData = useCallback(async () => {
    if (!configured) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      const [owner, total, count, list] = await Promise.all([
        getDonateOwner(),
        getTotalDonated(),
        getDonationCount(),
        getDonations(0, 20),
      ]);
      setOwnerAddress(owner || '');
      setTotalDonated(total);
      setDonationCount(count);
      setDonations(list);
    } catch (err) {
      console.error('refreshData error:', err);
    } finally {
      setLoadingList(false);
    }
  }, [configured]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const ensureSepolia = async () => {
    if (!window.ethereum?.request) return false;
    try {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      return Number(chainIdHex) === SEPOLIA_CHAIN_ID;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    if (!ownerAddress) return;
    await navigator.clipboard.writeText(ownerAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async () => {
    setStatus(null);

    if (!configured) {
      setStatus({ type: 'error', text: 'Chưa cấu hình VITE_CONTRACT_ADDRESS trong .env.' });
      return;
    }

    if (!account) {
      await connectWallet();
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setStatus({ type: 'error', text: 'Số lượng ETH phải lớn hơn 0.' });
      return;
    }

    const onSepolia = await ensureSepolia();
    if (!onSepolia) {
      setStatus({ type: 'error', text: 'Vui lòng chuyển MetaMask sang mạng Sepolia testnet.' });
      return;
    }

    setSending(true);
    try {
      const result = await sendDonation(amount, message.trim());
      if (result.success) {
        setStatus({ type: 'success', text: 'Donate thành công! Cảm ơn bạn rất nhiều 💜', hash: result.hash });
        setMessage('');
        await refreshData();
      } else {
        setStatus({ type: 'error', text: result.error || 'Giao dịch thất bại.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: err?.message || 'Đã có lỗi xảy ra.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
            <Coffee className="h-7 w-7 text-white" />
          </div>
          <p className="text-sm uppercase tracking-[0.35em] text-purple-400">Buy me a coffee · on-chain</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">Ủng hộ người làm ra web</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Gửi một ít ETH kèm lời nhắn để ủng hộ mình duy trì và phát triển trang portfolio này.
            Mọi donate đều được ghi lại on-chain, minh bạch 100%.
          </p>
          <p className="mt-2 text-xs text-amber-400">
            ⚠️ Đây là mạng thử nghiệm Sepolia — dùng SepoliaETH (test), không phải ETH thật.
          </p>
        </div>

        {!configured && (
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200 text-sm">
            Chưa cấu hình địa chỉ smart contract donate. Deploy contract{' '}
            <code className="rounded bg-black/30 px-1.5 py-0.5">DonateVault.sol</code> rồi thêm{' '}
            <code className="rounded bg-black/30 px-1.5 py-0.5">VITE_CONTRACT_ADDRESS</code> vào file{' '}
            <code className="rounded bg-black/30 px-1.5 py-0.5">frontend/.env</code>.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Donate form */}
          <div className="rounded-3xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Coins className="h-5 w-5 text-purple-400" />
              Chọn số tiền donate
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    amount === val
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {val} ETH
                </button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Hoặc nhập số khác (ETH)</span>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                placeholder="0.005"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 flex items-center justify-between text-sm font-medium text-gray-300">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Lời nhắn (không bắt buộc)
                </span>
                <span className="text-xs text-gray-500">{message.length}/{MESSAGE_LIMIT}</span>
              </span>
              <textarea
                rows={3}
                maxLength={MESSAGE_LIMIT}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cảm ơn vì trang web đẹp quá! ☕"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              />
            </label>

            <button
              onClick={handleDonate}
              disabled={sending || isConnecting || !configured}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3.5 text-base font-semibold text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang gửi giao dịch...
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang kết nối ví...
                </>
              ) : !account ? (
                <>
                  <Wallet className="h-5 w-5" />
                  Kết nối ví để donate
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Donate {amount || '0'} ETH
                </>
              )}
            </button>

            {status && (
              <div
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  status.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                <p>{status.text}</p>
                {status.hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${status.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                  >
                    Xem giao dịch trên Etherscan <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-3xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Ví nhận donate</p>
              <div className="mt-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-200">
                  {ownerAddress ? formatAddress(ownerAddress) : '—'}
                </span>
                {ownerAddress && (
                  <button onClick={handleCopy} className="text-gray-400 hover:text-purple-400">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-800/60 p-3 text-center">
                  <p className="text-xl font-bold text-white">{Number(totalDonated).toFixed(4)}</p>
                  <p className="text-xs text-gray-500">ETH nhận được</p>
                </div>
                <div className="rounded-xl bg-gray-800/60 p-3 text-center">
                  <p className="text-xl font-bold text-white">{donationCount}</p>
                  <p className="text-xs text-gray-500">Lượt donate</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm p-6">
              <p className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-gray-500">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Vì sao on-chain?
              </p>
              <p className="text-sm text-gray-400">
                Mỗi donate là một giao dịch thật trên Sepolia. Lời nhắn và số tiền được lưu vĩnh viễn trong
                smart contract, không qua máy chủ trung gian nào — ai cũng kiểm chứng được.
              </p>
            </div>
          </aside>
        </div>

        {/* Recent donations */}
        <div className="mt-6 rounded-3xl border border-purple-500/20 bg-gray-900/60 backdrop-blur-sm p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Heart className="h-5 w-5 text-pink-400" />
            Donate gần đây
          </h2>

          {loadingList ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : donations.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có donate nào. Hãy là người đầu tiên! 🎉</p>
          ) : (
            <ul className="space-y-3">
              {donations.map((d, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 rounded-xl border border-gray-800 bg-gray-800/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-purple-300">{formatAddress(d.donor)}</span>
                      <span className="text-xs text-gray-500">{timeAgo(d.timestamp)}</span>
                    </div>
                    {d.message && <p className="mt-1 text-sm text-gray-300">"{d.message}"</p>}
                  </div>
                  <span className="mt-2 self-start rounded-full bg-purple-500/15 px-3 py-1 text-sm font-semibold text-purple-300 sm:mt-0 sm:self-auto">
                    {Number(d.amountEth).toFixed(4)} ETH
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donate;
