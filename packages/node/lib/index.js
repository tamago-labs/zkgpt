
import * as fastq from "fastq";
import express from "express";
import cors from "cors"
import { PragmaServer } from "sdk"

import 'dotenv/config'

// API

export const app = express();

export const pragma = new PragmaServer()

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
        const collections = await pragma.allCollection()
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
        const { slug } = await pragma.requestCollectionCreation(collectionName)

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

        const docsCommitment = await pragma.requestDocsCreation({
            collection,
            signature,
            docs,
            password
        })

        return res.status(200).json({ status: "ok", docsCommitment });
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

        const content = await pragma.getDocs({
            collection,
            docsCommitment: commitment,
            password
        })

        return res.status(200).json({ status: "ok", content });
    } catch (e) {
        return res.status(400).json({ status: "error", error: e.message });
    }


})







