import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Deploy mặc định: owner = ví deploy (tài khoản đầu tiên trong SEPOLIA_PRIVATE_KEY).
// Muốn set owner khác (vd ví donate riêng), chạy:
// npx hardhat ignition deploy --network sepolia ignition/modules/DonateVault.ts \
//   --parameters '{"DonateVaultModule":{"ownerAddress":"0xYourAddress"}}'
export default buildModule("DonateVaultModule", (m) => {
  const ownerAddress = m.getParameter("ownerAddress", m.getAccount(0));

  const donateVault = m.contract("DonateVault", [ownerAddress]);

  return { donateVault };
});
