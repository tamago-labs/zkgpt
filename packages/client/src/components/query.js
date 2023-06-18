import { useCallback, useContext, useEffect, useState } from "react"
import { X } from "react-feather"
import { SpinnerWithRow } from "./loading"
import { Spinner } from "@/components/loading"
import { GptContext } from "@/hooks/useGPT"
import { useWeb3React } from "@web3-react/core"


const Query = ({ slug, loading, collection, docs }) => {

    const [modal, setModal] = useState(false)

    const { account } = useWeb3React()

    const { query, loadPromptResult } = useContext(GptContext)

    const [prompt, setPrompt] = useState()
    const [password, setPassword] = useState()

    const [error, setError] = useState()
    const [processing, setProcessing] = useState(false)

    const [result, setResult] = useState()

    const onProceed = useCallback(async () => {

        setModal(false)

        setError()
        setProcessing(true)

        try {

            await query({
                collection,
                password,
                prompt,
                docs
            })

            setPrompt()
            loadPromptResult().then(setResult)

        } catch (e) {
            let message = e.message
            if (e.response && e.response.data) {
                message = e.response.data.error
            }

            setError(message)
        }

        setProcessing(false)

    }, [password, prompt, collection, docs])

    useEffect(() => {
        account && loadPromptResult().then(setResult)
    }, [account])

    console.log("result -- >", result)

    return (
        <>
            {modal && (
                <div class="fixed inset-0 flex items-center justify-center z-50">
                    <div class="absolute inset-0 bg-gray-900 opacity-50"></div>
                    <div class="relative bg-gray-800 p-6 w-full max-w-xl text-white rounded-lg">
                        <h5 class="text-xl font-bold">Enter Password</h5>
                        <button class="absolute top-3 right-3 text-gray-500 hover:text-gray-400" onClick={() => setModal(false)}>
                            <X />
                        </button>
                        <div class="w-full mt-2 text-white">
                            <div className="pt-2 flex flex-col">
                                <label class="block text-md text-md font-medium text-gray-300 mt-auto mb-auto mr-auto">Hub Password</label>
                                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="1234" class="mt-2 block w-full py-2 px-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" type="text" />
                            </div>
                        </div>
                        <div class="flex mt-3">
                            <button onClick={onProceed} disabled={!password} class={`bg-blue-500 hover:bg-blue-600 text-white mx-auto py-2 px-4  flex flex-row rounded ${!password && "opacity-60"}`}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )

            }
            <div class="w-full">
                <div class="grid grid-cols-2">
                    <div class="col-span-1 p-6">
                        <div class="flex flex-col mb-2">
                            <h1 class="text-2xl text-white font-bold  mb-2">
                                Query Hub
                            </h1>
                            <h1 class="text-xl text-gray-400 font-bold  mb-2">
                                {slug}
                            </h1>

                            {loading
                                ?
                                <SpinnerWithRow
                                    text="loading..."
                                />
                                :
                                <>
                                    <div className="pt-2 mt-1 flex flex-col">
                                        <label class="block text-md text-md font-medium text-gray-300 mt-auto mb-auto mr-auto">Enter your question within this knowledge hub</label>
                                        <textarea onChange={(e) => setPrompt(e.target.value)} value={prompt} id="message" rows="8" class={`mt-2 block p-2.5 w-full text-sm text-gray-300 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500  `} placeholder="How many vacation days per year?"></textarea>
                                    </div>
                                    <div class="flex mt-3">
                                        <button onClick={() => setModal(true)} disabled={!prompt || processing} class={`bg-blue-500 hover:bg-blue-600 text-white   py-2 px-4  flex flex-row rounded ${(!prompt || processing) && "opacity-60"}`}>
                                            {processing && <Spinner />}
                                            Query
                                        </button>
                                    </div>
                                    {error && <div className="mt-3  text-sm text-gray-300 h-2">{error}</div>}
                                    <div class="p-5">
                                        <ul class="list-disc">
                                            <li>Must provide the password that has been set by the hub owner</li>
                                            <li>Only 5 questions per account are allowed</li>
                                        </ul>
                                    </div>

                                </>
                            }
                        </div>
                    </div>
                    <div class="bg-gray-800 h-screen col-span-1 pt-4 overflow-y-auto">
                        {result && result.prompts.map((p, index) => {
                            return (
                                <div class="p-6 m-3 border-2 border-gray-400 rounded-lg" >
                                    <div class="mb-4">
                                        <h3 class="flex items-center mb-4 text-lg font-medium text-white">
                                            ({index + 1}){` `}
                                            {p}
                                        </h3>
                                        <p class="text-gray-400">
                                            {result.result[index]}
                                        </p>
                                    </div>
                                </div>
                            )
                        })

                        }
                        {result && result.prompts.length === 0 && (
                            <div class="p-6 m-3  " >
                            <div>
                                <p class="text-gray-400">
                                    No question has been asked
                                </p>
                            </div>
                        </div>
                        )

                        }
                    </div>
                </div>
            </div>
        </>

    )
}

export default Query