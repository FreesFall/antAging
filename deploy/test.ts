import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

function sleep(time:any) {
    return new Promise(resolve => setTimeout(resolve, time));
}


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  // 检查网络标签，决定是否继续部署
//   if (!network.tags.use_root) {
//     log(`Skipping deployment on network ${network.name} as 'use_root' tag is not set.`);
//     return;
//   }

  // 1. 部署 MockERC20 合约
  const feeTokenDeployment = await deploy('MockERC20', {
    from: deployer,
    args: [ethers.parseUnits('1000000', 18)], // 名称、符号和初始供应量
    log: true,
  });

  if (!feeTokenDeployment.newlyDeployed) {
    log(`MockERC20 already deployed at ${feeTokenDeployment.address}`);
  } else {
    log(`MockERC20 deployed to ${feeTokenDeployment.address}`);
  }

  // 2. 部署 BasicNft 合约
  const basicNftDeployment = await deploy('BasicNfts', {
    from: deployer,
    args: [], // 如果 BasicNft 有构造函数参数，请在此添加
    log: true,
  });

  const basicNftContract = await ethers.getContractAt('BasicNfts', basicNftDeployment.address);
  const res_1= await basicNftContract.initialize(deployer,"test","TEST","http://","coms",500);
  await res_1.wait();
  log("Basic_初始化成功。。。。。。。")

  if (!basicNftDeployment.newlyDeployed) {
    log(`BasicNft already deployed at ${basicNftDeployment.address}`);
  } else {
    log(`BasicNft deployed to ${basicNftDeployment.address}`);
  }

  // 3. 部署 AntAgingPills 合约，传递 feeToken 和 basicNft 地址
  const antAgingDeployment = await deploy('AntAgingPills', {
    from: deployer,
    args: [],
    log: true,
  });
  const AntAgingPillsContract = await ethers.getContractAt('AntAgingPills', antAgingDeployment.address);

  if (!antAgingDeployment.newlyDeployed) {
    log(`AntAgingPills already deployed at ${antAgingDeployment.address}`);
  } else {
    log(`AntAgingPills deployed to ${antAgingDeployment.address}`);
  }
  const res= await AntAgingPillsContract.initialize(basicNftDeployment.address,feeTokenDeployment.address);
  await res.wait();
    //nft 转给控制合约
  const res_2= await basicNftContract.transferOwnership(antAgingDeployment.address);
  await res_2.wait();
  log("AntAgingPills_初始化成功。。。。。。。")

  // 4. 授权 AntAgingPills 合约使用 MockERC20 代币
  const feeTokenContract = await ethers.getContractAt('MockERC20', feeTokenDeployment.address);
  const approveAmount = ethers.parseUnits('100000', 18); // 授权 100,000 MCK
  const approveTx = await feeTokenContract.approve(antAgingDeployment.address, approveAmount);
  await approveTx.wait();
  log(`Approved AntAgingPills to spend ${approveAmount.toString()} MockERC20 tokens`);
  log(`Deployment completed successfully.`);

  const approveTxs = await feeTokenContract.allowance(deployer,antAgingDeployment.address);
  console.log("balanceOf",approveTxs)











    // 获取最新区块
    const latestBlock:any = await ethers.provider.getBlock("latest");
    const latestTimestamp = latestBlock.timestamp;

    // 获取当前系统时间的Unix时间戳（秒）
    const currentTime = Math.floor(Date.now() / 1000);

    // 计算新的时间戳，确保它大于最新区块的时间戳
    const newTimestamp = currentTime > latestTimestamp ? currentTime : latestTimestamp + 1;

    console.log(`设置新区块时间戳为: ${newTimestamp} (当前时间: ${currentTime}, 最新区块时间戳: ${latestTimestamp})`);

    // 设置下一个区块的时间戳
    await network.provider.send("evm_setNextBlockTimestamp", [newTimestamp]);

    // 挖掘一个新区块以应用设置的时间戳
    await network.provider.send("evm_mine");

    // 验证新区块的时间戳
    const newBlock:any = await ethers.provider.getBlock("latest");
    console.log(`新区块时间戳: ${newBlock.timestamp}`);


  const transactions = [];
  const res_4= await AntAgingPillsContract.getblckTime();
  console.log(res_4.toString());  
 

  // 输出为一个普通的数字
  for (let i = 25; i <= 500; i++) {
      const currentTime = parseInt(res_4.toString());
      const txPromise = AntAgingPillsContract.createAntAging(deployer, 1000, currentTime, currentTime + 10, i)
          .then(tx => tx.wait());  // 将等待交易完成的逻辑也包括在 Promise 中
      transactions.push(txPromise);
  }


  // 使用 Promise.all() 等待所有交易完成
  try {
      await Promise.all(transactions);
      console.log('All transactions have been processed.');
  } catch (error) {
      console.error('An error occurred:', error);
  }


  const rest:any=[];
  await sleep(1000); // 等待5秒
  for(let i=1;i<=475;i++){
    const res_3= await AntAgingPillsContract.getReleasedTokens(i);
    const number = parseInt(res_3.toString());
    // console.log(number);  // 输出为一个普通的数字
    rest.push(number);
  }
  let sum = rest.reduce((accumulator: any, currentValue: any) => {
    return accumulator + currentValue;
  }, 0);  // 0 是初始值
  console.log("rest:::::",rest)
  console.log("result++",sum)

//   console.log("开始等待了.............")
//   const rest1:any=[];
//   await sleep(3000); // 等待5秒
//   for(let i=1;i<=475;i++){
//     const res_3= await AntAgingPillsContract.getReleasedTokens(i);
//     const number = parseInt(res_3.toString());
//     console.log(number);  // 输出为一个普通的数字
//     rest1.push(number);
//   }
//   let sum1 = rest1.reduce((accumulator: any, currentValue: any) => {
//     return accumulator + currentValue;
//   }, 0);  // 0 是初始值
//   console.log("result===================",sum1)
 


};
func.id = 'AntAgingPills_deploy';
func.tags = ['MockERC20', 'BasicNft', 'AntAgingPills'];
func.dependencies = ['registry', 'root']; // 根据您的实际依赖关系调整
export default func;
