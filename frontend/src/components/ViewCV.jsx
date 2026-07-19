import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext.jsx'
import { ProfileService } from '../services/profileService.jsx'

function ViewCV() {
  const { contract, account, isConnected } = useWallet()
  const [searchAddress, setSearchAddress] = useState('')//Lưu địa chỉ ví người dùng nhập vào ô tìm kiếm.(Ví dụ: 0x123456789...)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  //useWallet(): Lấy thông tin ví MetaMask từ WalletContex
  //useState: Quản lý dữ liệu (state) của component.
  //useEffect: Thực hiện tác vụ khi component được render hoặc khi dữ liệu thay đổi.
  //ProfileService: Service dùng để đọc dữ liệu từ Smart Contract.

  // Tự động tải profile của người dùng đang kết nối
  useEffect(() => {
    if (isConnected && contract && account) {
      fetchProfile(account)//fetch account
    }
  }, [isConnected, contract, account])

  const fetchProfile = async (addressToFetch) => {
    if (!contract) return//Nếu chưa kết nối Smart Contract thì dừng.
    
    
    setLoading(true)//Hiển thị trạng thái Loading
    setError('')//Xóa lỗi cũ.
    setProfile(null)//Xóa Profile cũ.

    try {
      //Tạo đối tượng để làm việc với Smart Contract.
      const profileService = new ProfileService(contract)
      //Kiểm tra địa chỉ ví bằng hàm isValidAddress bên ProfileService 
      if (!profileService.isValidAddress(addressToFetch)) {
        throw new Error('Địa chỉ ví Blockchain không hợp lệ.')
      }

      //Lấy data  profilebằng hàm getProfile bên ProfileService
      const data = await profileService.getProfile(addressToFetch)
      if (!data) {
        setError('Không tìm thấy dữ liệu CV nào cho địa chỉ ví này.')
      } else {
        setProfile(data)//Add data vào Profile
      }
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Lỗi khi truy vấn Blockchain.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    //e là Event Object (đối tượng sự kiện).
    //Nó chứa thông tin về sự kiện vừa xảy ra.(VD: Người dùng nhấn nút "Tìm kiếm")
    e.preventDefault()//ngăn hành động mặc định của form React là reload trang
    if (searchAddress.trim()) {
      //trim() dùng để xóa khoảng trắng ở đầu và cuối chuỗi.
      fetchProfile(searchAddress.trim())//Tìm Profile vào trim() 
    }
  }

  return (
    <div className="min-h-screen bg-slate-550 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        
        {/* Header */}
        <div className="mb-8 rounded-3xl bg-slate-950/80 p-6 text-center lg:text-left">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">Blockchain Explorer</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Tra cứu CV trên Chain</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Nhập địa chỉ ví ETH (0x...) để tìm CV..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
          />
          <button 
            type="submit" 
            className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Loading & Errors */}
        {loading && <div className="text-center py-10 text-cyan-400 animate-pulse">Đang nạp dữ liệu từ Sepolia testnet...</div>}
        {error && <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-4 text-center text-red-400">{error}</div>}

        {/* Profile CV Display */}
        {profile && (
          <div className="space-y-6 animate-fadeIn">
            {/* Main Info */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
              <div className="flex flex-col justify-between border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                  <p className="text-sm text-slate-500 mt-1">Cập nhật lúc: {profile.updatedAt}</p>
                </div>
                <span className="mt-2 rounded-xl bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400 sm:mt-0">
                  {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
                </span>
              </div>

              {/* Contact Details */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Email</span>
                  <span className="text-slate-200">{profile.email || 'Chưa cung cấp'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Số điện thoại</span>
                  <span className="text-slate-200">{profile.phone || 'Chưa cung cấp'}</span>
                </div>
              </div>
            </div>

            {/* Resume Summary */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-3">Tóm tắt chuyên môn</h3>
              <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Links & Attachments */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Liên kết & Tệp đính kèm</h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3 hover:bg-slate-800 transition">
                    <span className="text-slate-400 text-sm">GitHub Profile ↗</span>
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3 hover:bg-slate-800 transition">
                    <span className="text-slate-400 text-sm">LinkedIn Profile ↗</span>
                  </a>
                )}
              </div>

              {profile.avatarHash && (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-2">File đính kèm CV (IPFS)</span>
                  <a 
                    href={profile.avatarHash.startsWith('http') ? profile.avatarHash : `https://ipfs.io/ipfs/${profile.avatarHash}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline font-mono text-sm break-all"
                  >
                    {profile.avatarHash}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewCV