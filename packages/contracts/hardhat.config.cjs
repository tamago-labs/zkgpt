require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  mocha: {
    timeout: 1200000,
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  networks: {
    bnbTestnet: {
      chainId: 97,
      url: "https://data-seed-prebsc-2-s1.binance.org:8545",
      accounts: [PRIVATE_KEY],
    }
  }
};
