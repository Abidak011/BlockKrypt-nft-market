import '../styles/globals.css'
import Link from 'next/link'


function MyApp({ Component, pageProps }) 
{
  return (
    <div>
    <nav className='border-b p-6'>
      <p className='text-4xl font-extrabold'>BlockKrypt NFT Market</p>
      <div className='flex mt-4'></div>
      <Link href="/">
        <a className="mr-12 ml-96 text-pink-800 font-bold text-xl" >Home</a>
      </Link>
      <Link href="/create-Item">
        <a className="ml-12 mr-12 text-pink-800 font-bold text-xl">Sell NFT</a>
      </Link>
      <Link href="/my-assets">
        <a className="mr-6 ml-12 text-pink-800 font-bold text-xl" >My NFT</a>
      </Link>
      <Link href="/creator-dashboard">
        <a className="mr-12 ml-12 text-pink-800 text-xl font-bold">Dashboard</a>
      </Link>
    </nav>
  <Component {...pageProps} />
  </div>
  )
}

export default MyApp
