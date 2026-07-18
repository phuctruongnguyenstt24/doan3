import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const Profile = await ethers.getContractFactory("Profile");

  const profile = await Profile.deploy();

  await profile.waitForDeployment();

  console.log(
    "Contract deployed to:",
    await profile.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});