// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DonateVault
/// @notice Cho phép người ghé thăm gửi ETH kèm lời nhắn để "donate" cho chủ trang.
///         Lịch sử donate được lưu on-chain nên hiển thị lại được bất cứ lúc nào,
///         không cần backend / database riêng.
contract DonateVault {
    address public owner;

    struct Donation {
        address donor;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    Donation[] private donations;
    uint256 public totalDonated;

    event DonationReceived(
        address indexed donor,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "DonateVault: not owner");
        _;
    }

    constructor(address _owner) {
        owner = _owner == address(0) ? msg.sender : _owner;
    }

    /// @notice Gửi donate kèm lời nhắn. Tiền được giữ trong contract cho tới khi owner rút.
    function donate(string calldata _message) external payable {
        require(msg.value > 0, "DonateVault: amount must be > 0");
        require(bytes(_message).length <= 280, "DonateVault: message too long");

        donations.push(
            Donation({
                donor: msg.sender,
                amount: msg.value,
                message: _message,
                timestamp: block.timestamp
            })
        );
        totalDonated += msg.value;

        emit DonationReceived(msg.sender, msg.value, _message, block.timestamp);
    }

    /// @notice Nhận thẳng ETH gửi tới contract (không gọi hàm donate) và coi như donate không lời nhắn.
    receive() external payable {
        donations.push(
            Donation({
                donor: msg.sender,
                amount: msg.value,
                message: "",
                timestamp: block.timestamp
            })
        );
        totalDonated += msg.value;
        emit DonationReceived(msg.sender, msg.value, "", block.timestamp);
    }

    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    /// @notice Lấy 1 donate theo index (0 = donate đầu tiên).
    function getDonation(uint256 index)
        external
        view
        returns (address donor, uint256 amount, string memory message, uint256 timestamp)
    {
        require(index < donations.length, "DonateVault: out of range");
        Donation storage d = donations[index];
        return (d.donor, d.amount, d.message, d.timestamp);
    }

    /// @notice Lấy 1 trang donate, mới nhất trước, để hiển thị realtime trên web.
    /// @param offset Số donate mới nhất đã bỏ qua (0 = bắt đầu từ donate mới nhất).
    /// @param limit Số lượng donate muốn lấy tối đa.
    function getDonations(uint256 offset, uint256 limit)
        external
        view
        returns (
            address[] memory donors,
            uint256[] memory amounts,
            string[] memory messages,
            uint256[] memory timestamps
        )
    {
        uint256 total = donations.length;
        if (offset >= total) {
            return (new address[](0), new uint256[](0), new string[](0), new uint256[](0));
        }

        uint256 remaining = total - offset;
        uint256 count = remaining < limit ? remaining : limit;

        donors = new address[](count);
        amounts = new uint256[](count);
        messages = new string[](count);
        timestamps = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Donation storage d = donations[total - 1 - offset - i];
            donors[i] = d.donor;
            amounts[i] = d.amount;
            messages[i] = d.message;
            timestamps[i] = d.timestamp;
        }
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Chủ trang rút toàn bộ ETH đã donate về ví của mình.
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "DonateVault: nothing to withdraw");
        (bool ok, ) = payable(owner).call{value: balance}("");
        require(ok, "DonateVault: withdraw failed");
        emit Withdrawn(owner, balance, block.timestamp);
    }

    function setOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "DonateVault: zero address");
        emit OwnerChanged(owner, _newOwner);
        owner = _newOwner;
    }
}
