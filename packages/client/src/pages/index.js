import { SpinnerWithRow } from "@/components/loading";
import { GptContext } from "@/hooks/useGPT";
import FullLayout from "@/layouts/fullLayout";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useContext, useEffect, useState } from "react";
import Blockies from 'react-blockies';
import { useRouter } from 'next/router'

export default function Home() {

  const router = useRouter()

  const { account, chainId } = useWeb3React()
  const { check, showCreateModal, listCollection } = useContext(GptContext)
  const [error, setError] = useState()

  const [loading, setLoading] = useState(true)

  const [collections, setCollections] = useState([])

  useEffect(() => {
    account && setError()
  },[account])

  const onNav = useCallback((slug) => {

    setError()
    if (account) {
      if (chainId === 97) {
        router.push(`/collection/${slug}`)
      } else {
        setError("Support BNB Testnet only")
      }

    } else {
      setError("Connect wallet first")
    }

  }, [chainId, account])

  useEffect(() => {
    check().then(
      (ok) => {
        ok && setLoading(false)
        ok && listCollection().then(setCollections)

      }
    )
  }, [])

  return (
    <main>
      <FullLayout>

        <div class="w-full xl:w-1/2  rounded-lg ml-auto mr-auto text-center py-8 ">
          <div class=" w-full rounded-md bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-1">
            <div class="flex h-full w-full items-center justify-center bg-gray-800 back flex-col">
              <div class="p-6 pt-8 pb-6">
                <h1 class="text-2xl font-black text-white">Build a private GPT-based knowledge hub for your organization & team</h1>
                <div class="mt-4 flex justify-center">
                  <div class="inline-flex rounded-md bg-white shadow">
                    <div onClick={
                      () => {
                        setError()
                        if (account) {
                          if (chainId === 97) {
                            showCreateModal()
                          } else {
                            setError("Support BNB Testnet only")
                          }

                        } else {
                          setError("Connect wallet first")
                        }

                      }
                    } class="text-gray-700 font-bold py-2 px-6 hover:cursor-pointer">
                      Create Hub
                    </div>
                  </div>
                </div>
                {/* {!error && <div className="mt-2 text-sm text-gray-300 h-2"><a href="https://github.com/pisuthd/zkgpt" target="_blank" className="hover:underline">Visit Repo</a></div>} */}
              </div>
            </div>
          </div>
          {error && <div class="p-4 mt-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
            <span class="font-medium">Error: </span> {error}
          </div>}
        </div>


        {loading ? (
          <SpinnerWithRow
            text="Connecting zkGPT node..."
          />
        ) : (
          <div class="w-full xl:w-1/2 ml-auto mr-auto text-center">
            <h1 class="text-2xl text-center text-white font-bold">
              Available Hubs
            </h1>

            <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 px-2 mt-4 mb-6">
              {collections.map((slug, index) => {
                return (
                  <div key={index} onClick={() => onNav(slug)} class="bg-gray-900 cursor-pointer border-2 border-transparent hover:border-blue-700  p-4 w-full mx-auto  rounded-lg">
                    <Blockies
                      seed={slug}
                      size="20"
                      className="rounded-full mb-3 ml-auto mr-auto"
                    />
                    <h5 class="text-md ">{slug}</h5>
                  </div>
                )
              })}
            </div>
            {/* <h1 class="text-2xl mt-4 text-center text-white font-bold">
              How It Works
            </h1> */}
          </div>
        )}
      </FullLayout>
    </main>
  )
}