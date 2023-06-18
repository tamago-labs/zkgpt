const { ethers } = require("hardhat")
const { expect } = require("chai")
const { plonk } = require("snarkjs")

const { GptServer } = require("lib")

const { bitcoinAbstract, bancorAbstract, encode } = require("./helpers")

const QueryVerificationKey = require("../circuits/query.json")

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

describe("#query", () => {

    let server

    let alice

    let collectionCommitment
    let docsIds = []

    COLLECTION_NAME = "My New Collection"
    PASSWORD = "1234"

    before(async () => {

        [alice] = await ethers.getSigners();

        server = new GptServer({
            openAIApiKey: OPENAI_API_KEY
        })

        server.useMemory()
    })

    it("should load docs success", async function () {

        await server.requestCollectionCreation(COLLECTION_NAME)

        const prove = await plonk.fullProve(
            {
                id: 1,
                groupPassword: encode(PASSWORD)
            },
            `./circuits/addCollection.wasm`,
            `./circuits/addCollection.zkey`
        )

        collectionCommitment = prove.publicSignals[0]

        const signature = await alice.signMessage("Sign to proceed")

        // load docs

        for (let docs of [bitcoinAbstract, bancorAbstract]) {
            const { docsCommitment } = await server.requestDocsCreation({
                collection: "My New Collection",
                signature,
                docs,
                password: PASSWORD
            })
            docsIds.push(docsCommitment)
        }

        expect(docsIds.length).to.equal(2)

        // verifying
        const bitcoinDocs = await server.getDocs({
            collection: COLLECTION_NAME,
            docsCommitment: docsIds[0],
            password: PASSWORD
        })

        expect(bitcoinAbstract).to.equal(bitcoinDocs)

        const bancorDocs = await server.getDocs({
            collection: COLLECTION_NAME,
            docsCommitment: docsIds[1],
            password: PASSWORD
        })

        expect(bancorAbstract).to.equal(bancorDocs)
    })

    it("should query success", async function () {

        const signature = await alice.signMessage("Sign to proceed")

        const encodedPrompt = await server.encodePrompt({
            prompt: "What is bitcoin?",
            signature
        })

        const prove = await plonk.fullProve(
            {
                id: 1,
                groupPassword: encode(PASSWORD),
                collectionCommitment,
                address: (await server.hash(alice.address)),
                prompt: encodedPrompt
            },
            `./circuits/query.wasm`,
            `./circuits/query.zkey`
        )

        // verify proof
        const res = await plonk.verify(QueryVerificationKey, prove.publicSignals, prove.proof);
        expect(res).to.true

        const output = await server.query({
            prompt: "What is bitcoin?",
            signature,
            collection: COLLECTION_NAME,
            password: PASSWORD,
            prove,
            docsIds
        })

        const { result } = await server.getPromptResult((await server.hash(alice.address)))
        expect(result[0]).to.equal(output)

    })

})