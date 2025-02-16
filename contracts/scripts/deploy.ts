import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MasterControl
  const MasterControl: ContractFactory = await ethers.getContractFactory("MasterControl");
  
  // Polygon Mainnet Chainlink ETH/USD Price Feed
  const CHAINLINK_PRICE_FEED = "0xF9680D99D6C9589e2a93a78A04A279e509205945";
  
  const masterControl: Contract = await MasterControl.deploy(
    "Synthetic USD",  // name
    "sUSD",          // symbol
    CHAINLINK_PRICE_FEED
  );

  await masterControl.deployed();

  console.log("MasterControl deployed to:", masterControl.address);
  
  // Verify contract on Polygonscan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("Waiting for 6 block confirmations before verification...");
    await masterControl.deployTransaction.wait(6);
    
    await hre.run("verify:verify", {
      address: masterControl.address,
      constructorArguments: [
        "Synthetic USD",
        "sUSD",
        CHAINLINK_PRICE_FEED
      ],
    });
    console.log("Contract verified on Polygonscan");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 