import '@/styles/globals.css'

import { ethers } from "ethers";
import { Web3ReactProvider } from '@web3-react/core';
import AccountProvider from "../hooks/useAccount"

const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AccountProvider>
        <Component {...pageProps} />
      </AccountProvider>
    </Web3ReactProvider>
  )
}
