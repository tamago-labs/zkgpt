
import { GptContext } from "@/hooks/useGPT"
import { useCallback, useContext, useState } from "react"
import { X } from "react-feather"
import { Spinner } from "@/components/loading"

const AddDocsModal = ({
    collection,
    slug,
    closeModal
}) => {

    const { addDocs } = useContext(GptContext)

    const [password, setPassword] = useState()
    const [docs, setDocs] = useState()

    const [error, setError] = useState()

    const [loading, setLoading] = useState(false)

    const onSave = useCallback(async () => {

        if (!password || !docs) {
            return
        }

        setError()
        setLoading(true)

        try {

            await addDocs(collection, slug, password, docs)

        } catch (e) { 
            let message = e.message
            if (e.response && e.response.data) {
                message = e.response.data.error
            }

            setError(message)
        }

        setLoading(false)


    }, [slug, collection, docs, password])

    return (
        <div class="fixed inset-0 flex items-center justify-center z-50">
            <div class="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div class="relative bg-gray-800 p-6 w-full max-w-4xl text-white rounded-lg">
                <h5 class="text-xl font-bold">Add Docs</h5>
                <button class="absolute top-3 right-3 text-gray-500 hover:text-gray-400" onClick={closeModal}>
                    <X />
                </button>
                <div class="w-full mt-2 text-white">
                    <div className="pt-2 flex flex-col">
                        <label class="block text-md text-md font-medium text-gray-300 mt-auto mb-auto mr-auto">Hub Password</label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="1234" class="mt-2 block w-full py-2 px-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base" type="text" />
                    </div>
                    <div className="pt-2 flex flex-col">
                        <label class="block text-md text-md font-medium text-gray-300 mt-auto mb-auto mr-auto">Paste your document below</label>
                        <textarea onChange={(e) => setDocs(e.target.value)} value={docs} id="message" rows="8" class={`mt-2 block p-2.5 w-full text-sm text-gray-300 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500  `} placeholder="Write your content here..."></textarea>
                    </div>
                </div>
                <div class="flex mt-3">
                    <button onClick={onSave} disabled={loading} class={`bg-blue-500 hover:bg-blue-600 text-white mx-auto py-2 px-4  flex flex-row rounded ${loading && "opacity-60"}`}>
                        {loading && <Spinner />}
                        Save
                    </button>
                </div>
                {error && <div className="mt-3 text-center text-sm text-gray-300 h-2">{error}</div>}
            </div>
        </div>
    )
}

export default AddDocsModal