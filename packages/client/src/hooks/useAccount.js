import ConnectModal from "@/modals/connect"
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useWeb3React } from "@web3-react/core"
import useEagerConnect from "@/hooks/useEagerConnect";
import useInactiveListener from "@/hooks/useInactiveListener"; 

import { Connectors, SUPPORT_CHAINS } from "../constants"

export const AccountContext = createContext()

const MODAL = {
    NONE: "NONE",
    SIGNIN: "SIGNIN"
}

const Provider = ({children}) => {

    const context = useWeb3React()

    const { account, activate, deactivate, error, chainId } = context

    const [currentModal, setCurrentModal] = useState(MODAL.NONE)

    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = useState()

    // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
    const triedEager = useEagerConnect()

    // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
    useInactiveListener(!triedEager || !!activatingConnector)

    const closeModal = () => {
        setCurrentModal(MODAL.NONE)
    }
    
    const onConnect = () => {
        setActivatingConnector(Connectors[0].connector)
        activate(Connectors[0].connector)
    }

    const corrected = SUPPORT_CHAINS.includes(chainId)

    const accountContext = useMemo(
        () => ({
            showSignInModal: () => {
                setCurrentModal(MODAL.SIGNIN)
            },
            closeModal,
            corrected
        }),
        [corrected]
    )

    return (
        <AccountContext.Provider value={accountContext}>
            {currentModal === MODAL.SIGNIN && <ConnectModal connect={onConnect} closeModal={closeModal} />}
            {children}
        </AccountContext.Provider>
    )
}

export default Provider
