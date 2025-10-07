const hre = require("hardhat");

async function main() {
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistryRentable");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.deployed();

  console.log("Contract deployed to:", agentRegistry.address);

  if (hre.network.name === "fuji") {
    try {
      await hre.run("verify:verify", {
        address: agentRegistry.address,
        constructorArguments: [],
      });
    } catch (err) {
      console.log("Verification failed:", err);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
