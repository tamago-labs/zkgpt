
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useWeb3React } from "@web3-react/core"
import { PromptClient } from "promptdb"

export const PromptContext = createContext()

const Provider = ({ children }) => {

    const check = async  () => {
        const client = new PromptClient()
        return await client.check()
    }

    const promptContext = useMemo(
        () => ({
            check
        }),
        []
    )

    return (
        <PromptContext.Provider value={promptContext}>
            {children}
        </PromptContext.Provider>
    )

}

export default Provider