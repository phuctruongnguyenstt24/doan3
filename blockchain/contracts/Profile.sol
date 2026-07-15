// SPDX-License-Identifier: MIT
// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: Profile.sol

// blockchain/contracts/Profile.sol

pragma solidity ^0.8.19;


contract Profile is Ownable {
    struct ProfileData {
        string fullName;
        string bio;
        string email;
        string phone;
        string avatarHash;    // IPFS hash
      
        string website;
        uint256 updatedAt;
        bool exists;
    }

    mapping(address => ProfileData) public profiles;
    
    event ProfileCreated(address indexed user, string fullName);
    event ProfileUpdated(address indexed user, string fullName);
    event AvatarUpdated(address indexed user, string avatarHash);

    // --- ĐOẠN ĐÃ ĐƯỢC SỬA: Thêm constructor cho Ownable ---
    constructor() Ownable(msg.sender) {}
    // -----------------------------------------------------

    // Tạo hoặc cập nhật profile
    function createOrUpdateProfile(
        string memory _fullName,
        string memory _bio,
        string memory _email,
        string memory _phone,
        string memory _avatarHash,
    
        string memory _website
    ) external {
        ProfileData storage profile = profiles[msg.sender];
        
        profile.fullName = _fullName;
        profile.bio = _bio;
        profile.email = _email;
        profile.phone = _phone;
        profile.avatarHash = _avatarHash;
   
        profile.website = _website;
        profile.updatedAt = block.timestamp;
        
        if (!profile.exists) {
            profile.exists = true;
            emit ProfileCreated(msg.sender, _fullName);
        } else {
            emit ProfileUpdated(msg.sender, _fullName);
        }
    }

    // Cập nhật avatar
    function updateAvatar(string memory _avatarHash) external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        profiles[msg.sender].avatarHash = _avatarHash;
        emit AvatarUpdated(msg.sender, _avatarHash);
    }

    // Lấy profile
    function getProfile(address _user) external view returns (
        string memory fullName,
        string memory bio,
        string memory email,
        string memory phone,
        string memory avatarHash,
        
        string memory website,
        uint256 updatedAt,
        bool exists
    ) {
        ProfileData storage profile = profiles[_user];
        return (
            profile.fullName,
            profile.bio,
            profile.email,
            profile.phone,
            profile.avatarHash,
          
            profile.website,
            profile.updatedAt,
            profile.exists
        );
    }

    // Kiểm tra profile tồn tại
    function profileExists(address _user) external view returns (bool) {
        return profiles[_user].exists;
    }
}