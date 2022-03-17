//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "./@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./@openzeppelin/contracts/security/ReentrancyGuard.sol"; // prevents re-entrancy attacks
import "./@openzeppelin/contracts/utils/Counters.sol";

contract ContractNFTMarket is ReentrancyGuard
{
    using Counters for Counters.Counter;
    Counters.Counter private itemIds; //total number of items created
    Counters.Counter private itemSold; // total number of item sold

    address payable owner; // owner of smart contract

    //people have to pay to buy their NFT on this marketplace
    uint256 listingPrice = 0.000002 ether;

    constructor(){

        owner = payable(msg.sender);

    }

    struct MarketItems {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    //accessing values of the Market item struct above by passing integer ID
    mapping(uint256 => MarketItems) private idMarketItem;
    
    //log message (when item is sold)
    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        bool sold
    );

    //function to get listing price
    function getListingPrice() public view returns (uint256)
    {
        return listingPrice;
    }

    function setListingPrice(uint _price) public returns(uint) 
    {
         if(msg.sender == address(this) ){
             listingPrice = _price;
         }
         return listingPrice;
    }
    // function creates Market item
    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public  payable nonReentrant
    {
        require(price > 0, "Price cannot be 0");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        
        itemIds.increment(); // add 1 to total number of items created
        uint256 itemId = itemIds.current();

        idMarketItem[itemId] = MarketItems(itemId,
                                            nftContract,
                                            tokenId, 
                                            payable(msg.sender), //(address of the seller)seller putting the nft for the sale 
                                            payable(address(0)), // no owner yet
                                            price,
                                            false
                                             );

       //transfer the ownership of the NFT 
       IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        //log this transaction
        // emit MarketItemCreated(
        //         itemId,
        //      nftContract,
        //      tokenId,
        //      msg.sender,
        //      address(0),
        //      price,
        //      false);

    }
      //function to create a sale
        function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant 
        {
           // uint pric = idMarketItem[itemId].price;
            uint tokenId = idMarketItem[itemId].tokenId;

           // require(msg.value == pric, "Please submit the asking price in order to complete the purchase");


            //pay the seller the amount
            idMarketItem[itemId].seller.transfer(msg.value);

            
            //transfer the ownership of the NFT from the contract to the buyer
            IERC721(nftContract).transferFrom(address(this),msg.sender , tokenId);

            idMarketItem[itemId].owner = payable(msg.sender); // mark buyer as new owner
            idMarketItem[itemId].sold = true; //mark that it has been sold
            itemSold.increment(); //increments the total number of items sold by 1
            payable(owner).transfer(listingPrice); // pay owner of the contract the listing price
        }

        // total number of  items unsold on our platform 
        function fetchMarketItems() public view returns (MarketItems[] memory){
        uint itemCount = itemIds.current(); //total number of items created
        //total number of items unsold = total number of items created - total items sold
        uint unsoldItemCount = itemIds.current() - itemSold.current(); 
        uint currentIndex = 0;

        MarketItems[] memory items = new MarketItems[](unsoldItemCount);
        
        //Loop through all items created
        for(uint i = 0; i < itemCount; i++)
        {
            //get only unsold item
            //check if item has not been sold
            //by checking if the owner field is empty
            if(idMarketItem[i+1].owner == address(0))
            {
                //yes this item has never been sold
                uint currentId = idMarketItem[i+1].itemId;
                MarketItems storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items; //return array of all unsold items
    }


    //fetch list of NFTs owned/bought by this user
    function fetchmyNFTs() public view returns(MarketItems[] memory)
    {
        //get total number of items created
        uint totalItemCount = itemIds.current();

        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i =0 ; i< totalItemCount; i++)
        {
            //get only the  item that this user has bought/ is the owner
            if(idMarketItem[i+1].owner == msg.sender)
            {
                itemCount += 1; //total length
            }
        }

        MarketItems[] memory items = new MarketItems[](itemCount);
        for(uint i =0 ; i < totalItemCount; i++)
        {
            if(idMarketItem[i+1].owner == msg.sender)
            {
                uint currentId = idMarketItem[i+1].itemId;
                MarketItems storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;

    }


     //fetch list of NFTs owned/bought by this user
    function fetchItemsCreated() public view returns(MarketItems[] memory)
    {
        //get total number of items created
        uint totalItemCount = itemIds.current();

        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i =0 ; i< totalItemCount; i++){
            //get only the  item that this user has bought/ is the owner
            if(idMarketItem[i+1].seller == msg.sender)
            {
                itemCount += 1; //total length
            }
        }

        MarketItems[] memory items = new MarketItems[](itemCount);
        for(uint i =0 ; i < totalItemCount; i++)
        {
            if(idMarketItem[i+1].seller == msg.sender)
            {
                uint currentId = idMarketItem[i+1].itemId;
                MarketItems storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;

    }

    

}