import { AccountContext } from "@/hooks/useAccount"
import { useContext, useEffect } from "react"
import { useWeb3React } from "@web3-react/core"
import { shortAddress } from "@/helpers"

const Header = () => {

    const { showSignInModal, corrected, closeModal } = useContext(AccountContext)
    const { account } = useWeb3React()

    useEffect(() => {
        account && closeModal()
    }, [account])

    return (
        <div class="grid grid-cols-2 gap-3 px-2 mt-4 mb-4">
            <div class="col-span-1 flex flex-col">
                <h1 class="text-3xl text-white font-bold">
                    zkPrompt
                </h1>
                <p class="text-sm text-gray-300 hidden md:block ">A self-sovereign generative AI protocol</p>
            </div>
            <div class="col-span-1">
                <div class="flex flex-row ">
                    <div class="flex-1 text-right">
                        <a href="https://github.com/pisuthd/zk-pragma" target="_blank" className="text-sm mr-5 hover:underline">GitHub</a>
                        {(account && corrected) && (
                            <>
                                <button class=" bg-transparent border-0 text-white font-semibold hover:underline py-2 px-4  rounded-lg text-sm  ">
                                    {shortAddress(account)}
                                </button>
                            </>
                        )}
                        {(account && !corrected) && (
                            <>
                                <button class=" bg-transparent hover:bg-white  text-white font-semibold hover:text-slate-700 py-2 px-4 border border-white hover:border-transparent rounded-lg text-sm  ">
                                    Wrong Network
                                </button>
                            </>
                        )}
                        {!account && (
                            <button type="button" onClick={() => showSignInModal()} class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Sign In</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header