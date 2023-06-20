import { InjectedConnector } from "@web3-react/injected-connector"

export const injected = new InjectedConnector()

export const SUPPORT_CHAINS = [97]

export const Connectors = [
    {
        name: "MetaMask",
        connector: injected
    }
]

export const host = process.env.HOST || "http://localhost:8000"
// export const host = "http://localhost:8000" 

export const contractAddress = "0xd074fEDb0E82bBDC91CD032719D0F9549796521c" // replace with your contract here
