import { GptContext } from "@/hooks/useGPT"
import { useCallback, useContext, useState } from "react"
import { X } from "react-feather"
import { Spinner } from "@/components/loading"

const CreateCollectionModal = ({ closeModal }) => {

    const { createCollection } = useContext(GptContext)

    const [collectionName, setCollectionName] = useState()
    const [password, setPassword] = useState()

    const [error, setError ] = useState()

    const [loading, setLoading ] = useState(false)

    const onCreate = useCallback(async () => {

        if (!password || !collectionName) {
            return
        }
        
        setError()
        setLoading(true)

        try {

            await createCollection(collectionName, password)

        } catch (e) { 
            let message = e.message
            if (e.response && e.response.data) {
                message = e.response.data.error
            }

            setError(message)
        }

        setLoading(false)

    }, [collectionName, password, createCollection])

    return (
        <div class="fixed inset-0 flex items-center justify-center z-50">
            <div class="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div class="relative bg-gray-800 p-6 w-full max-w-2xl text-white rounded-lg">
                <h5 class="text-xl font-bold">Create Hub</h5>
                <button class="absolute top-3 right-3 text-gray-500 hover:text-gray-400" onClick={closeModal}>
                    <X />
                </button>
                <div class="w-full mt-1 text-white">
                    <div className="grid grid-cols-8 p-2 gap-3">
                        <div class="col-span-1 flex">
                            <label class="block text-md text-md font-medium text-gray-300 mt-auto mb-auto mr-auto">Name</label>
                        </div>
                        <div class="col-span-7">
                            <input onChange={(e) => setCollectionName(e.target.value)} value={collectionName} placeholder="My new hub" class="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" type="text" />
                        </div>
                    </div>
                    <div className="grid grid-cols-8 p-2 gap-3">
                        <div class="col-span-1 flex">
                            <label class="block text-md text-md font-medium text-gray-300 mt-auto mb-auto mr-auto">Password</label>
                        </div>
                        <div class="col-span-7">
                            <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="1234" class="mt-1 block w-full py-2 px-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" type="text" />
                        </div>
                    </div>
                    <div class="flex mt-3">
                        <button onClick={onCreate} disabled={loading} class={`bg-blue-500 hover:bg-blue-600 text-white mx-auto py-2 px-4  flex flex-row rounded ${loading && "opacity-60"}`}>
                            { loading && <Spinner/>}
                            Create
                        </button> 
                    </div>
                    {/* {completed && (
                        <p class=" text-gray-300 mt-3 text-center text-sm">
                            Your transaction is being processed by the indexer node and will be completed in 3-4 mins.
                        </p>
                    )} */}
                    {error && <div className="mt-3 text-center text-sm text-gray-300 h-2">{error}</div>} 
                </div>
            </div>
        </div>
    )
}

export default CreateCollectionModal