// services/profileService.js

export class ProfileService {
  constructor(contract) {
    this.contract = contract;
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  isValidAddress(address) {
    return !!address && /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /** Chuyển Unix timestamp (giây) → chuỗi "HH:MM:SS DD/MM/YYYY" */
  _formatTimestamp(ts) {
    if (!ts || Number(ts) === 0) return '';
    const d = new Date(Number(ts) * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return (
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ` +
      `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    );
  }

  // ─── read ─────────────────────────────────────────────────────────────────

  async getProfile(address) {
    if (!this.contract) throw new Error('Contract chưa được khởi tạo.');

    // Kiểm tra profile tồn tại
    let exists = false;
    try {
      exists = await this.contract.profileExists(address);
    } catch (err) {
      console.warn('profileExists error:', err);
    }

    if (!exists) return null;   // ViewCV sẽ hiện thông báo "không tìm thấy"

    const p = await this.contract.getProfile(address);

    return {
      address,
      fullName:   p.fullName   ?? p[0] ?? '',
      bio:        p.bio        ?? p[1] ?? '',
      email:      p.email      ?? p[2] ?? '',
      phone:      p.phone      ?? p[3] ?? '',
      avatarHash: p.avatarHash ?? p[4] ?? '',
      github:     p.github     ?? p[5] ?? '',
      linkedin:   p.linkedin   ?? p[6] ?? '',
      website:    p.website    ?? p[7] ?? '',
      updatedAt:  this._formatTimestamp(p.updatedAt ?? p[8]),
      exists:     true,
    };
  }

  // ─── write ────────────────────────────────────────────────────────────────

  /**
   * ABI yêu cầu 8 tham số:
   * fullName, bio, email, phone, avatarHash, github, linkedin, website
   */
  async createOrUpdateProfile(profileData) {
    if (!this.contract) throw new Error('Contract chưa được khởi tạo.');
    if (!profileData.fullName?.trim()) throw new Error('Họ và tên không được để trống.');

    console.log('Gửi giao dịch lên blockchain...', profileData);

    const tx = await this.contract.createOrUpdateProfile(
      profileData.fullName.trim(),
      profileData.bio       || '',
      profileData.email     || '',
      profileData.phone     || '',
      profileData.avatarHash || '',
      profileData.github    || '',
      profileData.linkedin  || '',
      profileData.website   || ''
    );

    console.log('Đang chờ xác nhận...');
    const receipt = await tx.wait();
    console.log('Xác nhận thành công! Hash:', receipt.hash ?? receipt.transactionHash);
    return receipt;
  }

  async profileExists(address) {
    if (!this.contract) return false;
    try {
      return await this.contract.profileExists(address);
    } catch {
      return false;
    }
  }
}
