import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy'
const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks:{
    hardhat: {
      allowUnlimitedContractSize: false,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // 默认使用第一个账户
    },
    owner: {
      default: 0, // 默认使用第二个账户
    },
  }

};

export default config;




// const config: HardhatUserConfig = {
//   networks: {
//     // hardhat: {
//     //   saveDeployments: false,
//     //   tags: ['test', 'legacy', 'use_root'],
//     //   allowUnlimitedContractSize: false,
//     // },
//     hardhat: {
//       saveDeployments: true,
//       tags: ['test', 'use_root'],
//       allowUnlimitedContractSize: false,
//       // mining: {
//       //   auto: true,
//       //   interval: 5000 // 你可以根据需要设置这个间隔时间
//       // }
//     },
//     'smartbch-amber': {
//       url: 'https://rpc-testnet.smartbch.org',
//       accounts: real_accounts,
//       chainId: 10001,
//       live: true,
//       saveDeployments: true,
//       tags: ['test', 'use_root'],
//       gasPrice: 1046739556,
//     },
//     localhost: {
//       url: 'http://127.0.0.1:8545',
//       saveDeployments: true,
//       tags: ['test', 'use_root'],
//     },
//     rinkeby: {
//       url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
//       tags: ['test', 'legacy', 'use_root'],
//       chainId: 4,
//       accounts: real_accounts,
//     },
//     ropsten: {
//       url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
//       tags: ['test', 'legacy', 'use_root'],
//       chainId: 3,
//       accounts: real_accounts,
//     },
//     goerli: {
//       url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
//       tags: ['test', 'legacy', 'use_root'],
//       chainId: 5,
//       accounts: real_accounts,
//     },
//     mainnet: {
//       url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
//       tags: ['legacy', 'use_root'],
//       chainId: 1,
//       accounts: real_accounts,
//     },
//   },
//   mocha: {},
//   solidity: {
//     compilers: [
//       {
//         version: '0.8.17',
//         settings: {
//           optimizer: {
//             enabled: true,
//             runs: 2499,
//           },
//         },
//       },
//     ],
//   },
//   abiExporter: {
//     path: './build/contracts',
//     runOnCompile: true,
//     clear: true,
//     flat: true,
//     except: [
//       'Controllable$',
//       'INameWrapper$',
//       'SHA1$',
//       'Ownable$',
//       'NameResolver$',
//       'TestBytesUtils$',
//       'legacy/*',
//     ],
//     spacing: 2,
//     pretty: true,
//   },
//   namedAccounts: {
//     deployer: {
//       default: 0,
//     },
//     owner: {
//       default: 1,
//     },
//   },
//   external: {
//     contracts: [
//       {
//         artifacts: [archivedDeploymentPath],
//       },
//     ],
//   },
// }

// export default config
