import { useState } from 'react'
import { useWallet } from '../context/WalletContext.jsx'
import { ProfileService } from '../services/profileService.jsx'

const SEPOLIA_CHAIN_ID = 11155111

function SendCV() {
  const { wallet, connect, isConnected, isConnecting } = useWallet()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cvHash: '',
    summary: '',
    github: '',
    linkedin: ''
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

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
    setLoading(true)

    try {
      if (!isConnected) {
        await connect()
      }

      if (!wallet?.signer) {
        throw new Error('Vui lòng kết nối MetaMask trước khi gửi CV.')
      }

      const isSepolia = await ensureSepolia()
      if (!isSepolia) {
        throw new Error('Vui lòng chuyển MetaMask sang Sepolia testnet.')
      }

      const profileService = new ProfileService(wallet.signer)
      await profileService.createOrUpdateProfile({
        fullName: formData.fullName,
        bio: formData.summary,
        email: formData.email,
        phone: formData.phone,
        avatarHash: formData.cvHash,
        github: formData.github,
        linkedin: formData.linkedin,
        website: ''
      })

      setStatus('CV đã được gửi lên blockchain Sepolia thành công.')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        cvHash: '',
        summary: '',
        github: '',
        linkedin: ''
      })
    } catch (error) {
      console.error(error)
      setStatus(error?.message || 'Đã có lỗi khi gửi CV lên blockchain.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30">
        <div className="mb-8 rounded-3xl bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">Gửi CV Blockchain</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Send CV lên Sepolia</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Điền thông tin CV, tóm tắt và hash IPFS của CV. Dữ liệu sẽ được lưu vào hợp đồng profile trên Sepolia testnet.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Họ và tên</span>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Nguyễn Văn A"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Số điện thoại</span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+84 912 345 678"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Tóm tắt CV</span>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Tóm tắt kỹ năng, kinh nghiệm, mục tiêu nghề nghiệp..."
                className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="block text-slate-300">
              <span className="mb-2 block text-sm font-medium">Hash/IPFS CV</span>
              <input
                name="cvHash"
                value={formData.cvHash}
                onChange={handleChange}
                placeholder="Qm... hoặc https://ipfs.io/ipfs/..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-slate-300">
                <span className="mb-2 block text-sm font-medium">GitHub</span>
                <input
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              <label className="block text-slate-300">
                <span className="mb-2 block text-sm font-medium">LinkedIn</span>
                <input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Đang gửi...' : 'Gửi CV lên Sepolia'}
            </button>

            {status && (
              <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-100">
                {status}
              </div>
            )}
          </form>

          <aside className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="rounded-3xl bg-slate-900 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Sepolia</p>
              <p className="mt-3 text-lg font-semibold text-white">Chỉ dùng Sepolia testnet</p>
              <p className="mt-2 text-slate-400">
                Hãy đảm bảo MetaMask đã chuyển sang mạng Sepolia trước khi gửi. Nếu chưa, chuyển mạng rồi thử lại.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Hướng dẫn nhanh</p>
              <ul className="mt-3 space-y-3 text-slate-400">
                <li>1. Kết nối MetaMask.</li>
                <li>2. Chuyển mạng sang Sepolia.</li>
                <li>3. Nhập tên, email, phone và tóm tắt CV.</li>
                <li>4. Dán hash/IPFS của CV nếu có.</li>
                <li>5. Nhấn gửi để lưu lên blockchain.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Lưu ý</p>
              <p className="mt-3 text-slate-400">
                Dữ liệu CV sẽ được lưu ở trường profile contract: summary vào bio, hash CV vào avatarHash.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default SendCV
