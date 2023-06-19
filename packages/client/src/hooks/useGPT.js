
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { useWeb3React } from "@web3-react/core"
import axios from "axios"
import { ethers } from "ethers";
import { buildPoseidon } from "circomlibjs"
import ABI from "../abi"
import CreateCollectionModal from "@/modals/createCollection"
import AddDocsModal from "@/modals/addDocs";
// import { PromptClient } from "sdk"
// import { GptClient } from "lib"

const { plonk } = require("snarkjs")

import { encode, shorterText, slugify } from "@/helpers"
import { host, contractAddress } from "../constants"

export const GptContext = createContext()

const MODAL = {
    NONE: "NONE",
    CREATE: "CREATE",
    ADD: "ADD"
}

const Provider = ({ children }) => {

    const [values, dispatch] = useReducer(
        (curVal, newVal) => ({ ...curVal, ...newVal }),
        {
            modal: MODAL.NONE,
            slug: undefined,
            collection: undefined
        }
    )

    const { modal, slug, collection } = values

    const { account, library } = useWeb3React()

    const check = async () => {
        const { data } = await axios.get(host)
        return data.status === "ok"
    }

    const closeModal = () => {
        dispatch({ modal: MODAL.NONE })
    }

    const showCreateModal = () => {
        dispatch({ modal: MODAL.CREATE })
    }

    const showAddDocsModal = (slug, collection) => {
        dispatch({ modal: MODAL.ADD, slug, collection })
    }

    const createCollection = useCallback(async (collectionName, password) => {

        console.log(account, library)

        // check available id
        const contract = new ethers.Contract(contractAddress, ABI, library.getSigner());
        const collectionId = Number(await contract.collectionCount()) + 1

        console.log("collectionId: ", collectionId)
        // create collection  

        const { data } = await axios.post(`${host}/collection/new`, {
            collectionName
        })
        const { slug } = data

        console.log("slug: ", slug)

        // generate proof

        const prove = await plonk.fullProve(
            {
                id: collectionId,
                groupPassword: encode(password)
            },
            `./circuits/addCollection.wasm`,
            `./circuits/addCollection.zkey`
        )

        const calldata = await plonk.exportSolidityCallData(prove.proof, prove.publicSignals)

        const proof = JSON.parse(calldata.substring(0, calldata.indexOf("]") + 1))
        console.log("proof:", proof)

        const commitment = prove.publicSignals[0]
        console.log("commitment:", commitment)

        // submit proof
        const tx = await contract.createCollection(collectionName, commitment, proof)

        await tx.wait()
    }, [account, library])


    const getCollection = useCallback(async (slug) => {

        const contract = new ethers.Contract(contractAddress, ABI, library.getSigner());
        const max = Number(await contract.collectionCount())

        let commitment
        let id
        let name

        for (let i = 1; i < max + 1; i++) {
            const iname = (await contract.collectionName(i))
            if (slugify(iname) === slug) {
                id = i
                name = iname
                commitment = (await contract.collectionCommitment(i))
            }
        }

        return {
            commitment: `${commitment}`,
            id,
            name
        }

    }, [account, library])

    const addDocs = useCallback(async (collection, slug, password, docs) => {

        // get collection commitment

        const contract = new ethers.Contract(contractAddress, ABI, library.getSigner());

        const collectionCommitment = collection.commitment
        const collectionId = collection.id

        if (!collectionCommitment) {
            throw new Error("Can't find collection commitment")
        }

        console.log("collectionCommitment : ", collectionCommitment)

        const signature = await library.getSigner().signMessage("Sign to proceed")

        // upload docs to zkGPT node

        const input = {
            collection: slug,
            signature,
            docs,
            password
        }

        const { data } = await axios.post(`${host}/docs/new`, {
            ...input
        })

        const { docsCommitment, docsHashed, accountHashed } = data

        console.log("docsCommitment : ", docsCommitment)
        console.log("docsHashed : ", docsHashed)
        console.log("accountHashed : ", accountHashed)

        // generate proof

        const prove = await plonk.fullProve(
            {
                id: collectionId,
                groupPassword: encode(password),
                collectionCommitment: `${collectionCommitment}`,
                docs: docsHashed,
                address: accountHashed
            },
            `../circuits/addDocs.wasm`,
            `../circuits/addDocs.zkey`
        )

        const calldata = await plonk.exportSolidityCallData(prove.proof, prove.publicSignals)

        const proof = JSON.parse(calldata.substring(0, calldata.indexOf("]") + 1))
        console.log("proof:", proof)

        // submmit proof
        const tx = await contract.attachDocs(shorterText(docs), collectionId, docsCommitment, accountHashed, proof)

        await tx.wait()

    }, [account, library])


    const listCollection = useCallback(async () => {
        const { data } = await axios.get(`${host}/collections`)
        return data.collections
    }, [])

    const listDocs = useCallback(async (collection) => {

        const collectionId = collection.id

        const contract = new ethers.Contract(contractAddress, ABI, library.getSigner());
        const max = Number(await contract.docCount(collectionId))

        let docs = []

        for (let i = 1; i < max + 1; i++) {
            const name = (await contract.getDocsName(collectionId, i))
            const commitment = (await contract.getDocsCommitment(collectionId, i))
            docs.push({
                name,
                commitment: `${commitment}`
            })
        }

        return docs

    }, [account, library])

    const hash = async (content) => {
        const poseidon = await buildPoseidon()
        return poseidon.F.toObject(poseidon([encode(content)]))
    }

    const encodePrompt = async ({
        prompt,
        prompts
    }) => {


        let encoded = []

        for (let i = 0; i < 5; i++) {
            const p = prompts[i]
            if (p) {
                encoded.push(await hash(p))
            } else {
                encoded.push(0)
            }
        }

        const index = encoded.indexOf(0)
        if (index === -1) {
            throw new Error("No more prompt allowed for given address")
        }

        encoded[index] = await hash(prompt)

        return encoded
    }

    const query = useCallback(async ({
        password,
        prompt,
        collection,
        docs,
        prompts
    }) => {

        const signature = await library.getSigner().signMessage("Sign to proceed")

        const encoded = await encodePrompt({
            prompt,
            prompts
        })

        console.log("encoded : ", encoded)

        const prove = await plonk.fullProve(
            {
                id: collection.id,
                groupPassword: encode(password),
                collectionCommitment : collection.commitment,
                address: (await hash(account)),
                prompt: encoded
            },
            `../circuits/query.wasm`,
            `../circuits/query.zkey`
        )

        console.log("prove : ", prove)

        const { proof , publicSignals } = prove

        const input = {
            prompt,
            signature,
            collection :collection.name,
            password,
            proof,
            publicSignals,
            docsIds : docs.map(item => item.commitment),
        }

        console.log("input : ", input)

        const { data } = await axios.post(`${host}/query2`, {
            ...input
        })

        console.log("data : ", data)

    }, [account, library])

    const loadPromptResult = useCallback(async () => {

        // convert to poseidon hash
        const poseidon = await buildPoseidon()
        const hash = `${poseidon.F.toObject(poseidon([encode(account)]))}`

        console.log("hash : ", hash)

        const { data } = await axios.get(`${host}/prompt/${hash}`)

        return data
    }, [account])

    const gptContext = useMemo(
        () => ({
            showCreateModal,
            createCollection,
            listCollection,
            check,
            showAddDocsModal,
            addDocs,
            listDocs,
            getCollection,
            query,
            loadPromptResult
        }),
        [createCollection, query, getCollection, addDocs, listDocs, loadPromptResult]
    )

    return (
        <GptContext.Provider value={gptContext}>
            {modal === MODAL.CREATE && <CreateCollectionModal closeModal={closeModal} />}
            {modal === MODAL.ADD && <AddDocsModal closeModal={closeModal} slug={slug} collection={collection} />}
            {children}
        </GptContext.Provider>
    )
}

export default Provider