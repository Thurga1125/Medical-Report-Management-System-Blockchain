const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Registry = await hre.ethers.getContractFactory("MedicalRecordRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("Deployer:", deployer.address);
  console.log(`CHAIN_CONTRACT_ADDRESS=${await registry.getAddress()}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
