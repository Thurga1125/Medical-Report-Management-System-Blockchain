const { Wallet } = require("ethers");

const w = Wallet.createRandom();
console.log(`CHAIN_PRIVATE_KEY=${w.privateKey}`);
console.log(`# address: ${w.address}`);
