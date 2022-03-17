const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractNFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("ContractNFTMarket");
    const market = await Market.deploy();
    await market.deployed(); //deploy the nftMarket contract
    const marketAddress = market.address;


    const NFT = await ethers.getContractFactory("ContractNFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed(); //deploy the NFT contract
    const nftAddress = nft.address;

    //get listing price
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    //set auction price
    const auctionPrice = ethers.utils.parseUnits("0.0001","ether");

    //Create sample tokens
    await nft.createToken("https://www.mytoken.com");
    await nft.createToken("https://www.mytoken2.com");


    //create sample NFT
    await market.createMarketItem(nftAddress,1,auctionPrice,{value: listingPrice});
    await market.createMarketItem(nftAddress,2,auctionPrice,{value: listingPrice});


    const [_ ,buyerAddress ]= await ethers.getSigners();

    await market.connect(buyerAddress).createMarketSale(nftAddress, 1 , {value: auctionPrice});

    //fetch market items
    let items = await market.fetchMarketItems();
     items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller:i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }));

    console.log('items:' , items);

   
  });
});
