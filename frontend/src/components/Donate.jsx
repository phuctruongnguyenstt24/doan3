// Donate.jsx
import { useState } from 'react'
import { useWallet } from '../context/WalletContext.jsx'
import { ethers } from 'ethers'

const SEPOLIA_CHAIN_ID = 11155111

// Lấy địa chỉ từ environment variable
const DONATION_ADDRESS = import.meta.env.VITE_DONATION_ADDRESS 
                          

function Donate() {
  const { contract, signer, connectWallet, isConnected, loading: isConnecting } = useWallet()
  
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    donorName: ''
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [transactionHash, setTransactionHash] = useState('')

  // Kiểm tra địa chỉ hợp lệ
  const isValidAddress = (address) => {
    return ethers.isAddress(address) && address !== '0x0000000000000000000000000000000000000000'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const ensureSepolia = async () => {
    if (!window.ethereum || !window.ethereum.request) return false
    try {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      return Number(chainIdHex) === SEPOLIA_CHAIN_ID
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setTransactionHash('')
    setLoading(true)

    try {
      // Kiểm tra địa chỉ nhận donation
      if (!isValidAddress(DONATION_ADDRESS)) {
        throw new Error('Địa chỉ nhận donation không hợp lệ. Vui lòng kiểm tra file .env')
      }

      // Kết nối ví nếu chưa kết nối
      if (!isConnected) {
        await connectWallet()
      }

      // Kiểm tra signer
      if (!signer) {
        throw new Error('Vui lòng kết nối MetaMask trước khi donate.')
      }

      // Kiểm tra mạng Sepolia
      const isSepolia = await ensureSepolia()
      if (!isSepolia) {
        throw new Error('Vui lòng chuyển MetaMask sang Sepolia testnet.')
      }

      // Parse số tiền
      const amountInEth = parseFloat(formData.amount)
      if (isNaN(amountInEth) || amountInEth <= 0) {
        throw new Error('Vui lòng nhập số tiền hợp lệ (lớn hơn 0).')
      }

      // Chuyển đổi sang wei
      const amountInWei = ethers.parseEther(amountInEth.toString())

      // Gửi giao dịch donate
      const tx = await signer.sendTransaction({
        to: DONATION_ADDRESS,
        value: amountInWei,
        data: '0x' // Có thể thêm message vào data nếu smart contract hỗ trợ
      })

      setStatus('⏳ Đang chờ xác nhận giao dịch...')
      
      // Đợi giao dịch được xác nhận
      const receipt = await tx.wait()
      
      setTransactionHash(receipt.hash)
      setStatus(`✅ Donate thành công! ${amountInEth} ETH đã được gửi đến ${DONATION_ADDRESS.slice(0, 6)}...${DONATION_ADDRESS.slice(-4)}.`)
      
      // Reset form
      setFormData({
        amount: '',
        message: '',
        donorName: ''
      })

    } catch (error) {
      console.error(error)
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setStatus('❌ Giao dịch đã bị từ chối.')
      } else {
        setStatus(error?.message || 'Đã có lỗi xảy ra khi donate.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Hàm hỗ trợ donate nhanh
  const quickDonate = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }))
  }

  // Hàm copy transaction hash
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setStatus('📋 Đã sao chép mã giao dịch!')
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30">
        <div className="mb-8 rounded-3xl bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">💝 Ủng Hộ Dự Án</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Donate trên Sepolia</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Ủng hộ dự án bằng ETH trên Sepolia testnet. Mọi đóng góp đều được ghi nhận và trân trọng!
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            
            {/* Số tiền */}
            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Số tiền (ETH)</span>
              <input
                name="amount"
                type="number"
                step="0.001"
                min="0.001"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.1"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            {/* Nút donate nhanh */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-slate-400 mr-2">Donate nhanh:</span>
              {[0.01, 0.05, 0.1, 0.5, 1].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => quickDonate(amount)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400 hover:bg-slate-800"
                >
                  {amount} ETH
                </button>
              ))}
            </div>

            {/* Tên người donate */}
            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Tên của bạn</span>
              <input
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                placeholder="Anonymous"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            {/* Lời nhắn */}
            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Lời nhắn (tùy chọn)</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                placeholder="Gửi lời động viên đến dự án..."
                className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            {/* Nút submit */}
            <button
              type="submit"
              disabled={loading || isConnecting}
              className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '⏳ Đang xử lý...' : isConnecting ? '🔗 Đang kết nối ví...' : '💝 Donate Now'}
            </button>

            {/* Status */}
            {status && (
              <div className={`rounded-3xl border p-4 text-sm ${
                status.includes('❌') ? 'border-red-700 bg-red-950/30 text-red-300' :
                status.includes('✅') ? 'border-emerald-700 bg-emerald-950/30 text-emerald-300' :
                status.includes('📋') ? 'border-blue-700 bg-blue-950/30 text-blue-300' :
                'border-slate-700 bg-slate-950/80 text-slate-100'
              }`}>
                {status}
              </div>
            )}

            {/* Transaction Hash */}
            {transactionHash && (
              <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">Mã giao dịch:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-cyan-400 break-all flex-1">
                    {transactionHash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(transactionHash)}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-700"
                  >
                    📋 Sao chép
                  </button>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-cyan-400 hover:text-cyan-300 underline"
                >
                  Xem trên Etherscan →
                </a>
              </div>
            )}

            {/* Hiển thị địa chỉ nhận donation */}
            {DONATION_ADDRESS && isValidAddress(DONATION_ADDRESS) && (
              <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-3">
                <p className="text-xs text-slate-500">Địa chỉ nhận:</p>
                <p className="text-xs text-cyan-400 break-all font-mono mt-1">
                  {DONATION_ADDRESS}
                </p>
              </div>
            )}
          </form>

          {/* Sidebar */}
          <aside className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="rounded-3xl bg-slate-900 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trạng thái ví</p>
              <div className="mt-3 text-sm">
                {isConnected ? (
                  <span className="text-emerald-400 font-medium">● Đã kết nối MetaMask</span>
                ) : (
                  <span className="text-amber-400 font-medium">○ Chưa kết nối</span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Mạng: Sepolia testnet
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">📊 Thông tin</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>💰 ETH là token của mạng Ethereum</p>
                <p>🔗 Sử dụng Sepolia testnet để test</p>
                <p>💎 Mọi giao dịch đều được ghi trên blockchain</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">💡 Lưu ý</p>
              <p className="mt-3 text-sm text-slate-400">
                Sử dụng ETH testnet (Sepolia) để donate. Bạn có thể nhận ETH testnet từ các faucet như sepoliafaucet.com
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Donate