require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const { PRIVATE_KEY, SNOWTRACE_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      avalanche: SNOWTRACE_API_KEY,
      avalancheFujiTestnet: SNOWTRACE_API_KEY,
      fuji: SNOWTRACE_API_KEY,
    },
    customChains: [
      {
        network: "fuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io",
        },
      },
    ],
  },
};
