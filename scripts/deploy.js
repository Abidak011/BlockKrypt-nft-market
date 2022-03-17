// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ContractNFTMarket = await hre.ethers.getContractFactory("ContractNFTMarket");
  const nftMarket = await ContractNFTMarket.deploy();

  await nftMarket.deployed();

  console.log("NNftMarket deployed to:", nftMarket.address);

  const ContractNFT = await hre.ethers.getContractFactory("ContractNFT");
  const nft = await ContractNFT.deploy(nftMarket.address);

  await nft.deployed();

  console.log("ContractNFT deployed to:", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
