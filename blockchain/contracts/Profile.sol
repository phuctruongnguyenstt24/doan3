// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; //Trỏ đến phiên bản là 0.8.20

//struct là kiểu dữ liệu do lập trình viên tự định nghĩa để gom nhiều thuộc tính liên quan lại thành một đối tượng.
contract Profile {
    //uint256: Unsigned Integer 256-bit (kiểu dữ liệu số nguyên không âm 256 bit)
    struct ProfileData {
        string fullName;
        string bio;
        string email;
        string phone;
        string avatarHash;
        string github;
        string linkedin;
        string website;
        uint256 updatedAt;
        bool exists;
    }

    //mapping hoạt động giống một HashMap hoặc Dictionary.
    //Địa chỉ ví ==> ProfileData (VD: 0x111... ==> fullName: "Nguyễn Văn A",bio:"Web Dev"...)
    mapping(address => ProfileData) public profiles;

    //event là một cơ chế trong Solidity dùng để ghi lại nhật ký (log) của các giao dịch trên blockchain.

    //Được phát ra khi người dùng tạo Profile lần đầu tiên. (Qua Hàm createOrUpdateProfile())
    //indexed giúp tham số đó có thể được lập chỉ mục (index) để tìm kiếm nhanh trong log của blockchain.
    event ProfileCreated(address indexed user, string fullName);
    //Được phát khi người dùng cập nhật Profile. (Qua Hàm createOrUpdateProfile())
    event ProfileUpdated(address indexed user, string fullName);
    //Được phát khi người dùng chỉ thay đổi trường avatarHash (ví dụ cập nhật ảnh đại diện hoặc hash IPFS của CV).
    event AvatarUpdated(address indexed user, string avatarHash);

    function createOrUpdateProfile(
        //memory nghĩa là dữ liệu chỉ tồn tại tạm thời trong lúc thực thi hàm, không được lưu trực tiếp lên blockchain.
        //Vì phải có dữ liệu mới đẩy lên dc9 blockchain ==> lưu vào memory
        string memory _fullName,
        string memory _bio,
        string memory _email,
        string memory _phone,
        string memory _avatarHash,
        string memory _github,
        string memory _linkedin,
        string memory _website
    ) external {
        //external là một visibility modifier trong Solidity, dùng để quy định ai được phép gọi hàm. (Cho Gọi từ bên ngoài Contract,Contract kế thừa NHưng Không Gọi bên trong Contract)


        //msg.sender: Là địa chỉ ví đang gọi Smart Contract.
        //storage nghĩa là tạo một biến tham chiếu (reference) tới dữ liệu đang lưu trên blockchain.
        //Lấy storage của profile đang gọi Smart Contract.
        ProfileData storage profile = profiles[msg.sender];

        //Cập nhật dữ liệu
        profile.fullName   = _fullName;
        profile.bio        = _bio;
        profile.email      = _email;
        profile.phone      = _phone;
        profile.avatarHash = _avatarHash;
        profile.github     = _github;
        profile.linkedin   = _linkedin;
        profile.website    = _website;
        profile.updatedAt  = block.timestamp;

        if (!profile.exists) {
            //Đánh dấu rằng địa chỉ ví này đã có Profile.(Nếu !profile.exists(profile.exists == false))
            profile.exists = true;
            //Phát Event: ProfileCreated
            emit ProfileCreated(msg.sender, _fullName);
        } else {
            //Nếu Profile đã tồn tại phát Event ProfileUpdated
            emit ProfileUpdated(msg.sender, _fullName);
        }
    }

    //require: nghĩa là điều kiện bắt buộc.
    function updateAvatar(string memory _avatarHash) external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        profiles[msg.sender].avatarHash = _avatarHash;//trong BlockChain khi thay đổi dữ liệu ==> mã hash thay đổi ==> avatarHash = _avatarHash (_avatarHash là hash mới)
        //Phát Event: AvatarUpdated
        emit AvatarUpdated(msg.sender, _avatarHash);
    }

    //Hàm dùng để đọc toàn bộ thông tin Profile của một địa chỉ ví.
    //view: Chỉ đọc dữ liệu.(Không ghi hay thay đổi blockchain.)
    //getProfile(address _user) ==> Tìm user theo address(Địa chỉ Ví)
    function getProfile(address _user) external view returns (
        string memory fullName,
        string memory bio,
        string memory email,
        string memory phone,
        string memory avatarHash,
        string memory github,
        string memory linkedin,
        string memory website,
        uint256 updatedAt,
        bool exists
    ) {
        //storage giúp biến p trỏ trực tiếp đến dữ liệu đang lưu trên blockchain (struct ở trên).
        ProfileData storage p = profiles[_user];
        return (
            p.fullName,
            p.bio,
            p.email,
            p.phone,
            p.avatarHash,
            p.github,
            p.linkedin,
            p.website,
            p.updatedAt,
            p.exists
        );
    }

    function profileExists(address _user) external view returns (bool) {
        //ví đã tạo Profile thì trả về user luôn
        return profiles[_user].exists;
    }
    // Thêm vào Profile.sol

struct ShareRecord {
    address sharer;
    string signature;
    uint256 timestamp;
    bool exists;
}

mapping(address => ShareRecord[]) public shares;
mapping(address => mapping(address => bool)) public hasShared;

event ProfileShared(address indexed profileAddress, address indexed sharer, uint256 timestamp);

function shareProfile(
    address _profileAddress,
    string memory _signature
    //string memory _data
) external {
    require(profiles[_profileAddress].exists, "Profile does not exist");
    require(!hasShared[_profileAddress][msg.sender], "Already shared");
    
    shares[_profileAddress].push(ShareRecord({
        sharer: msg.sender,
        signature: _signature,
        timestamp: block.timestamp,
        exists: true
    }));
    
    hasShared[_profileAddress][msg.sender] = true;
    
    emit ProfileShared(_profileAddress, msg.sender, block.timestamp);
}

function getShares(address _profileAddress) external view returns (
    address[] memory sharers,
    uint256[] memory timestamps
) {
    ShareRecord[] storage userShares = shares[_profileAddress];
    sharers = new address[](userShares.length);
    timestamps = new uint256[](userShares.length);
    
    for (uint i = 0; i < userShares.length; i++) {
        sharers[i] = userShares[i].sharer;
        timestamps[i] = userShares[i].timestamp;
    }
    
    return (sharers, timestamps);
}

function getShareCount(address _profileAddress) external view returns (uint256) {
    return shares[_profileAddress].length;
}
}
