// services/profileService.js
/*
Service Layer trong ứng dụng này. Thay vì để React gọi Smart Contract trực tiếp ==> gom toàn bộ logic blockchain vào ProfileService. Nhờ vậy:
Component (SendCV) chỉ lo giao diện.
ProfileService chỉ lo giao tiếp với Smart Contract.
*/

export class ProfileService {
  //Constructor giúp Khi tạo object: const profileService = new ProfileService(contract); thì: this.contract = contract; (Ví dụ: profileService.contract chính là contract đã kết nối MetaMask.)
  constructor(contract) {
    this.contract = contract;//Sau này ở bất kỳ hàm nào đều có thể dùng cú pháp this.contract (Thay this bằng class đã export)
  }
  // ─── helpers ──────────────────────────────────────────────────────────────

  isValidAddress(address) {
    //!!address Chuyển giá trị thành kiểu boolean.
    //Nếu bắt đầu bằng bắt đầu bằng 0x theo sau là đúng 40 ký tự hex (Trong khoảng a-fA-F0-9)
    //.test(address) dùng để kiểm tra xem chuỗi address có khớp với Regex(^0x[a-fA-F0-9]) hay không.
    //Kết quả trả về là true hoặc false.
    return !!address && /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  formatAddress(address) {
    if (!address) return '';
    //Lấy 6 từ trái qua ... Lấy 4 từ phải qua
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /** Chuyển Unix timestamp (giây) → chuỗi "HH:MM:SS DD/MM/YYYY" */
  _formatTimestamp(ts) {
    if (!ts || Number(ts) === 0) return '';
    const d = new Date(Number(ts) * 1000);//blockchain trả 1752912000 hàm này sẽ chuyển về 19/07/2026 (* 1000 vì Blockchain lưu giây mà JavaScript dùng milliseconds nên phải * 1000)
    ////Đảm bảo số luôn có 2 chữ số(VD:pad(9) ==> 09)
    const pad = (n) => String(n).padStart(2, '0');//String(n): Chuyển số thành chuỗi,padStart(2,'0'): Nếu chuỗi có ít hơn 2 ký tự thì thêm số 0 vào phía trước.
    return (
      //Hiện giờ phút giấy theo định dạng pad Vd:08:05:09
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ` +
      //JavaScript đánh số tháng từ 0 ==> nên: d.getMonth() + 1 (Ví dụ tháng 0 + 1 = tháng 1), VD:19/07/2026
      `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    );
  }

  // ─── read ─────────────────────────────────────────────────────────────────

  //hàm đọc dữ liệu từ blockchain.
  async getProfile(address) {
    //Nếu chưa kết nối MetaMask ==> throw new Error
    if (!this.contract) throw new Error('Contract chưa được khởi tạo.');

    // Kiểm tra profile tồn tại
    let exists = false;
    try {
      //Kiểm tra profile tồn tại
      exists = await this.contract.profileExists(address);
    } catch (err) {
      console.warn('profileExists error:', err);
    }

    if (!exists) return null;   // ViewCV sẽ hiện thông báo "không tìm thấy"

    //Ethers có thể trả về giống như một mảng.
    const p = await this.contract.getProfile(address);//Tùy phiên bản Ethers.==> tra về fullName:"Nguyễn Văn A",bio:"React"

    //p.fullName ?? p[0]: Nếu p.fullName có giá trị thì dùng nó, nếu không thì dùng p[0].
    //Vd:fullName: p.fullName ?? p[0] ?? '', ==> p.fullName = "Đỗ Khải Nhân" ==> fullName = "Đỗ Khải Nhân"
    //p[0], p[1], p[2]... được quyết định bởi thứ tự các giá trị mà hàm Solidity trả về (hàm getProfile trong smart contract).
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
   * fullName, bio, email, phone, avatarHash, github, linkedin, website (Smart Contract có hàm:yêu cầu đúng 8 tham số.)
   */
  async createOrUpdateProfile(profileData) {
    if (!this.contract) throw new Error('Contract chưa được khởi tạo.');
    //dấu ?. gọi là Optional Chaining. giúp nếu không tồn tại ==> không bị lỗi.
    if (!profileData.fullName?.trim()) throw new Error('Họ và tên không được để trống.');

    console.log('Gửi giao dịch lên blockchain...', profileData);

    //Gọi createOrUpdateProfile với tham số dưới
    //tx là Transaction Response 
    //tx giúp xác nhận Giao dịch đã được gửi lên blockchain. (Chưa chắc đã được xác nhận.)
    const tx = await this.contract.createOrUpdateProfile(
      profileData.fullName.trim(),//trim() ==> bỏ khoảng trắng
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
