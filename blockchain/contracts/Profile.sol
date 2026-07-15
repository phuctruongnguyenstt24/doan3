// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Profile {
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

    mapping(address => ProfileData) public profiles;

    event ProfileCreated(address indexed user, string fullName);
    event ProfileUpdated(address indexed user, string fullName);
    event AvatarUpdated(address indexed user, string avatarHash);

    function createOrUpdateProfile(
        string memory _fullName,
        string memory _bio,
        string memory _email,
        string memory _phone,
        string memory _avatarHash,
        string memory _github,
        string memory _linkedin,
        string memory _website
    ) external {
        ProfileData storage profile = profiles[msg.sender];

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
            profile.exists = true;
            emit ProfileCreated(msg.sender, _fullName);
        } else {
            emit ProfileUpdated(msg.sender, _fullName);
        }
    }

    function updateAvatar(string memory _avatarHash) external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        profiles[msg.sender].avatarHash = _avatarHash;
        emit AvatarUpdated(msg.sender, _avatarHash);
    }

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
        return profiles[_user].exists;
    }
}
