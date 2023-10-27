// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Proxy = await ethers.getContractFactory("Proxy");
  const proxy = await Proxy.deploy();

  const Logic1 = await ethers.getContractFactory("Logic1");
  const logic1 = await Logic1.deploy();

  const Logic2 = await ethers.getContractFactory("Logic2");
  const logic2 = await Logic2.deploy();

  console.log("Proxy Deployed:", proxy.target);
  console.log("Logic1 Deployed:", logic1.target);
  console.log("Logic2 Deployed:", logic2.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
