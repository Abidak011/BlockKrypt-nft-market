//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./@openzeppelin/contracts/utils/Counters.sol";

contract ContractNFT is ERC721URIStorage
{
    //Auto increment field for each token 
    using Counters for Counters.Counter;

    Counters.Counter private tokenIds;

    // address of the NFT marketplace
    address contractAddress;

    constructor(address marketAddress) ERC721("BlockKrypt Tokens","BKT")
    {
        contractAddress = marketAddress;
    }

    //Creating a new token
    /// @param tokenURI : token URI
    function createToken(string memory tokenURI) public returns(uint)
    {
        // Set a new token id for the token to be minted
        tokenIds.increment();
        
        uint newItemId = tokenIds.current();

        _mint(msg.sender, newItemId); //minting the token
        _setTokenURI(newItemId, tokenURI); //generate the URI
        setApprovalForAll(contractAddress, true);//grant transaction permission to marketplace

        //return token ID
        return newItemId;

    }
}  