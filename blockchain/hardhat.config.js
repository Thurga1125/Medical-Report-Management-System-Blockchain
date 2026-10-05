require("@nomicfoundation/hardhat-ethers");

// Key the backend signs anchor transactions with. Generate one with `npm run keygen`.
// When set, `hardhat node` funds this account instead of Hardhat's publicly known dev accounts.
const key = process.env.CHAIN_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337,
      ...(key && { accounts: [{ privateKey: key, balance: "10000000000000000000000" }] }),
    },
    localhost: {
      url: process.env.CHAIN_RPC_URL || "http://127.0.0.1:8545",
      chainId: 1337,
      ...(key && { accounts: [key] }),
    },
  },
};
