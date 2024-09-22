// scripts/deploy.ts

import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 部署 MockERC20 合约
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const feeToken = await MockERC20.deploy(1000000); // 初始供应量为 1,000,000
  await feeToken.deployed();
  console.log("MockERC20 deployed to:", feeToken.address);

  // 部署 BasicNft 合约
  const BasicNft = await ethers.getContractFactory("BasicNft");
  const basicNft = await BasicNft.deploy();
  await basicNft.deployed();
  console.log("BasicNft deployed to:", basicNft.address);

  // 部署 AntAging 合约
  const AntAging = await ethers.getContractFactory("AntAgingPills");
  const antAging = await AntAging.deploy(feeToken.address, basicNft.address);
  await antAging.deployed();
  console.log("AntAging deployed to:", antAging.address);

  // 授权 AntAging 合约使用 MockERC20 代币
  const approveAmount = ethers.utils.parseUnits("100000", 18); // 100,000 MCK
  const approveTx = await feeToken.approve(antAging.address, approveAmount);
  await approveTx.wait();
  console.log("AntAging contract approved to spend MockERC20 tokens");

  // 保存合约地址到文件
  const addresses = {
    feeToken: feeToken.address,
    basicNft: basicNft.address,
    antAging: antAging.address,
  };

  fs.writeFileSync("deployedAddresses.json", JSON.stringify(addresses, null, 2));
  console.log("Deployed contract addresses saved to deployedAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署出错:", error);
    process.exit(1);
  });
