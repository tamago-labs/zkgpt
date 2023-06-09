import { InjectedConnector } from "@web3-react/injected-connector"

export const injected = new InjectedConnector()

export const SUPPORT_CHAINS = [97]

export const Connectors = [
    {
        name: "MetaMask",
        connector: injected
    }
]
