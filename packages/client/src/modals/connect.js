
import { X } from "react-feather"
import Image from "next/image"

const WrongNetwork = () => (<small>Support <a class="underline" href="https://chainlist.org/chain/97" target="_blank">BNB Testnet</a> only</small>)

const ConnectModal = ({
    closeModal,
    connect
}) => {
    return (
        <div class="fixed inset-0 flex items-center justify-center z-50">
            <div class="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div class="relative bg-gray-800 p-6 w-full max-w-sm text-white rounded-lg">
                <h5 class="text-xl font-bold">Sign In</h5>
                <button class="absolute top-3 right-3 text-gray-500 hover:text-gray-400" onClick={closeModal}>
                    <X />
                </button>
                <div class="text-white text-center">
                    <div class="mt-6 mb-4 flex">
                        <div onClick={connect} class="bg-gray-900 cursor-pointer border-2 border-transparent hover:border-blue-700  p-4 w-1/2 mx-auto h-40 rounded-lg">
                            <Image
                                src={"/metamask-icon.svg"}
                                height={80}
                                width={80}
                                class="ml-auto mr-auto mt-2 mb-4"
                            />
                            <h5 class="text-md ">MetaMask</h5>
                        </div>
                    </div>
                    <WrongNetwork />
                </div>
            </div>
        </div>
    )
}

export default ConnectModal