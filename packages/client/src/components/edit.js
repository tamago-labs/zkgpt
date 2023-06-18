import { useWeb3React } from "@web3-react/core"
import { Spinner } from "./loading"
import { Plus } from "react-feather"
import { useContext, useState, useEffect } from "react"
import { GptContext } from "@/hooks/useGPT"
import { SpinnerWithRow } from "./loading"


const Edit = ({ slug, collection , loading, docs }) => {

    const { showAddDocsModal } = useContext(GptContext)
    const { account } = useWeb3React()

    return (
        <div class="w-full p-6">
            <div class="grid grid-cols-2">
                <div class="flex flex-col mb-2">
                    <h1 class="text-2xl text-white font-bold  mb-2">
                        Manage Docs
                    </h1>
                    <h1 class="text-xl text-gray-400 font-bold  mb-2">
                        {slug}
                    </h1>
                </div>
                <div className="flex pb-4">
                    <button type="button" disabled={!collection} onClick={() => account && showAddDocsModal(slug, collection)} class="text-gray-900 h-10 ml-auto mt-auto mb-auto bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-md px-2.5 py-1.5 mr-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                        +{` `}Add Docs
                    </button>
                </div>
            </div>
            <div class="mt-4">
                {loading
                    ?
                    <SpinnerWithRow
                        text="loading..."
                    />
                    :
                    <>
                        {/* TABLE */}
                        <div class="relative mt-2  shadow-md sm:rounded-lg">
                            <table class="w-full text-sm text-left text-white">
                                <thead class="text-xs ppercase border-b bg-transparent">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">
                                            #
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            Name
                                        </th>
                                        <th scope="col" width="10%" class="px-6 py-3">
                                            Commitment
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs && docs.map((item, index) => {
                                        // const { pageContent } = item
                                        // const id = item["_id"]
                                        return (
                                            <tr key={index} class=" border-b bg-transparent">
                                                <td class="px-6 py-4">
                                                    {index+1}
                                                </td>
                                                <td class="px-6 py-4">
                                                    {item.name}
                                                </td>
                                                <td class="px-6 py-4">
                                                    {item.commitment}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default Edit