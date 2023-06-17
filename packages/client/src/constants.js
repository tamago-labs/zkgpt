import { InjectedConnector } from "@web3-react/injected-connector"

export const injected = new InjectedConnector()

export const SUPPORT_CHAINS = [97]

export const Connectors = [
    {
        name: "MetaMask",
        connector: injected
    }
]

export const host = "http://localhost:8000" 

export const contractAddress = "0x53BdF45DfC131b791F57b1ee9ec5246498E33f60"