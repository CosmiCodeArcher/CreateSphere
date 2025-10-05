const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting CreateSphere deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("📍 Deploying to network:", network.name);
  console.log("👤 Deploying with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // Deploy ProjectFactory
  console.log("📄 Deploying ProjectFactory...");
  const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
  const projectFactory = await ProjectFactory.deploy(deployer.address);
  await projectFactory.waitForDeployment();
  const factoryAddress = await projectFactory.getAddress();
  console.log("✅ ProjectFactory deployed to:", factoryAddress);

  // Deploy RewardNFT
  console.log("\n📄 Deploying RewardNFT...");
  const RewardNFT = await hre.ethers.getContractFactory("RewardNFT");
  const rewardNFT = await RewardNFT.deploy(factoryAddress, deployer.address);
  await rewardNFT.waitForDeployment();
  const nftAddress = await rewardNFT.getAddress();
  console.log("✅ RewardNFT deployed to:", nftAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      ProjectFactory: factoryAddress,
      RewardNFT: nftAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestPath = path.join(deploymentsDir, `${network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📝 Deployment info saved to:", filepath);

  // Generate frontend config
  const frontendConfig = {
    contractAddresses: {
      projectFactory: factoryAddress,
      rewardNFT: nftAddress,
    },
    chainId: Number(network.chainId),
    networkName: network.name,
  };

  const frontendConfigPath = path.join(__dirname, "../../frontend/src/config/contracts.json");
  const configDir = path.dirname(frontendConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));

  console.log("📝 Frontend config saved to:", frontendConfigPath);

  // Verify on Etherscan (if not on hardhat network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await projectFactory.deploymentTransaction().wait(5);

    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [],
      });
      console.log("✅ ProjectFactory verified");

      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [factoryAddress],
      });
      console.log("✅ RewardNFT verified");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  console.log("\n✨ Deployment complete!\n");
  console.log("Summary:");
  console.log("========");
  console.log("Network:", network.name);
  console.log("ProjectFactory:", factoryAddress);
  console.log("RewardNFT:", nftAddress);
  console.log("\n🎉 Ready to use CreateSphere!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });