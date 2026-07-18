import { network } from "hardhat";

// Ví sẽ nhận tiền donate (rút bằng withdraw()). Để trống = ví deploy sẽ là owner.
const OWNER_ADDRESS = process.env.DONATE_OWNER_ADDRESS || "";

async function main() {
  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();
  const owner = OWNER_ADDRESS || deployer.address;

  const DonateVault = await ethers.getContractFactory("DonateVault");
  const donateVault = await DonateVault.deploy(owner);
  await donateVault.waitForDeployment();

  console.log("DonateVault deployed to:", await donateVault.getAddress());
  console.log("Owner (nhận tiền donate):", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
