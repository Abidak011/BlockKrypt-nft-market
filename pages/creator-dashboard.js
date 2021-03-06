import axios from 'axios'
import { useEffect, useState } from 'react'
import {ethers} from 'ethers'
import Web3Modal from 'web3modal'
import Image from 'next/image'

import {
    nftaddress,nftmarketaddress
} from '../config';

import ContractNFT from '../artifacts/contracts/ContractNFT.sol/ContractNFT.json'
import ContractNFTMarket from '../artifacts/contracts/ContractNFTMarket.sol/ContractNFTMarket.json'

export default function CreatorDashboard() 
{

    const [nfts, setNfts] = useState([])
    const [sold , setSold] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() =>{
        loadNFTs()
    },[])
    async function loadNFTs()
    {
        const web3Modal = new Web3Modal({
            // network: 'mainnet',
            // cacheProvider: true,
        })

        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, ContractNFTMarket.abi,signer)
        const tokenContract = new ethers.Contract(nftaddress, ContractNFT.abi,provider)
        const data = await marketContract.fetchItemsCreated()

        const items = await Promise.all(data.map(async i =>
        {
                const tokenUri = await tokenContract.tokenURI(i.tokenId)
                const meta = await axios.get(tokenUri)
                let price = ethers.utils.formatUnits(i.price.toString(),'ether')
                let item = {
                    price, 
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    sold: i.sold,
                    image: meta.data.image,
                }
            return item
        }))
        
        // create a filtered array of items that have been sold
        const soldItems = items.filter(i => i.sold)
        setSold(soldItems)
        setNfts(items)
        setLoadingState('loaded')
    }

    if(loadingState === 'loaded' && !nfts.length) return (<h1 className='py-10 px-20 text-3xl'>NO assets created</h1>)
    return(
        <div className='p-4'>
            <h2 className='text-2xl py-2'>Items Created</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
            {
                nfts.map((nft,i) =>(
                    <div key={i} className='  p-4 border shadow rounded-xl overflow-hidden'>
                    <Image
                                src = {nft.image}
                                alt = "Picture of the author"
                                className='rounded'
                                width={500}
                                height={500}/>
                    <div className='p-4 bg-black'>
                        <p className='text-2xl font-bold text-white'>Price - {nft.price} ETH</p>
                    </div>
                    </div>
                ))
            }
            </div>
        </div>
    )
}