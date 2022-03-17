import {useState} from 'react'
import {ethers} from 'ethers'
import {create as ipfsHttpCLient} from 'ipfs-http-client'
import {useRouter} from 'next/router'
import Web3Modal from 'web3modal'
import 
{
    nftaddress,nftmarketaddress
} from '../config';

import ContractNFT from '../artifacts/contracts/ContractNFT.sol/ContractNFT.json'
import ContractNFTMarket from '../artifacts/contracts/ContractNFTMarket.sol/ContractNFTMarket.json'

import Image from 'next/image'

const client = ipfsHttpCLient('https://ipfs.infura.io:5001/api/v0');

export default function CreateItem() 
{

    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''});
    const router = useRouter();

    async function onChange(e)
    {
        const file = e.target.files[0];
        //try uploading the file
        try
        { 

            const added  = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            //file saved in the url path below
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        }
        catch(e)
        {
            console.log(e)
        }
    }

    //create item(image/video) and upload to ipfs

    async function createItem()
    {
        const {name,description,price} = formInput;  //get the value from the form input
        //form validation
        if(!name || !description || !price || !fileUrl) return  
        const data = JSON.stringify({
            name,description, image: fileUrl
        });

        try
        {

            const added = await client.add(data);
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            //pass the url to save it on polygon after it has been uploaded to IPFS
            createSale(url) 

        }
        catch(error)
        {
            console.log(`Error uploading the file :`, error);
        }
    }

    //List item for sale

    async function createSale(url)
    {

        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);


        //sign the transaction
        const signer = provider.getSigner();
        let contract = new ethers.Contract(nftaddress,ContractNFT.abi,signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait();

        //get the tokenId from the transaction that occured above
        //there events array that is returned the first item from that event 
        //is the event third item is the token id 
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber() //we need to convert it to a number 

        //get a reference to the price entered in the form

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(nftmarketaddress,ContractNFTMarket.abi,signer); 

        //getthe listing price
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();


        transaction = await contract.createMarketItem(
            nftaddress,tokenId, price, {value: listingPrice}
        )

        await transaction.wait();

        router.push('/')

    }
    return(
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input 
                    placeholder='Asset name'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({...formInput, name: e.target.value})}
                    />
                <textarea
                    placeholder='Item description'
                    className='mt-2 border rounded p-4'
                    onChange={e => updateFormInput({...formInput, description: e.target.value})}
                />
                <input 
                    placeholder='Asset price in ETH'
                    className='mt-8 border rounded p-4'
                    type="number"
                    onChange={e => updateFormInput({...formInput, price: e.target.value})}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                />
                {
                    fileUrl && (
                      
                    <Image
                        src = {fileUrl}
                        alt = "Picture of the author"
                        className='rounded mt-4'
                        width={350} 
                        height={500}   
                        />
                    )
                }

                <button onClick={createItem} className="font-bold bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create NFT
                </button>

            </div>
        </div>
    )


}