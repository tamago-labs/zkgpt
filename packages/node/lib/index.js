
import * as fastq from "fastq";
import express from "express";
import cors from "cors"
import pkg from 'lib';

const { GptServer } = pkg

import 'dotenv/config'

// API

export const app = express();

export const gpt = new GptServer({
    openAIApiKey: process.env.OPENAI_API_KEY
})

app.use(express.json());
app.use(cors())

export const server = app.listen(8000, () => {
    console.log(`Server Started at ${8000}`)
})

app.get('/', async (req, res) => {
    return res.status(200).json({ status: "ok" });
});

// return all collection in the server memory
app.get('/collections', async (req, res) => {

    try {
        const collections = await gpt.allCollection()
        return res.status(200).json({ status: "ok", collections });
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }

})

// new collection
app.post('/collection/new', async (req, res) => {

    try {
        const { body } = req
        const { collectionName } = body
        const { slug } = await gpt.requestCollectionCreation(collectionName)

        return res.status(200).json({ status: "ok", slug });
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }

})

// new docs
app.post('/docs/new', async (req, res) => {

    try {
        const { body } = req
        const { collection, signature, docs, password } = body

        const { docsCommitment, docsHashed, accountHashed } = await gpt.requestDocsCreation({
            collection,
            signature,
            docs,
            password
        })

        return res.status(200).json({ status: "ok", docsCommitment, docsHashed, accountHashed });
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }

})

// get docs
app.get('/docs/:collection/:commitment', async (req, res) => {

    try {
        const { params, query } = req
        const { commitment, collection } = params

        let password

        if (query && query.password) {
            password = query.password
        }

        const content = await gpt.getDocs({
            collection,
            docsCommitment: commitment,
            password
        })

        return res.status(200).json({ status: "ok", content });
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }
})

// query
app.post('/query', async (req, res) => {

    try {
        const { body } = req

        const { prompt, signature, collection, collectionId, password, collectionCommitment, docsIds } = body

        const encodedPrompt = await gpt.encodePrompt({
            prompt,
            signature
        })

        const prove = await gpt.generatePromptProve({
            collectionId,
            password,
            collectionCommitment,
            signature,
            encodedPrompt
        })

        const output = await gpt.query({
            prompt,
            signature,
            collection,
            password,
            prove,
            docsIds
        })

        return res.status(200).json({ status: "ok", output });
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }
})

// get prompts 
app.get('/prompt/:address', async (req, res) => {

    try {
        const { params } = req

        const { address } = params

        const result = await gpt.getPromptResult(address)
 
        return res.status(200).json({ status: "ok" , ...result});
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }
})

