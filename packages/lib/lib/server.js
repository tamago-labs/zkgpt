import PouchDB from 'pouchdb';
import { ethers } from "ethers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { slugify, encode } from "../helpers";
import { Base } from "./base"

import fs from "node:fs/promises";
import cryptoPouch from "crypto-pouch"
import pounchAdapterMemory from "pouchdb-adapter-memory"
import { loadQARefineChain } from "langchain/chains"

import { MAX_PROMPT, DEFAULT_MESSAGE, VERIFICATION_KEY } from './constants';

import { plonk } from 'snarkjs';

PouchDB.plugin(cryptoPouch)
PouchDB.plugin(pounchAdapterMemory)

export class GptServer extends Base {

    isMemory

    embeddings
    model

    constructor(args) {
        super()
        this.isMemory = false

        if (args && args.openAIApiKey) {
            this.model = new OpenAI({ openAIApiKey: args.openAIApiKey, temperature: 0 })
            this.embeddings = new OpenAIEmbeddings({ openAIApiKey: args.openAIApiKey })
        }

    }

    useMemory = () => {
        this.isMemory = true
    }

    // keep track all collection slug
    addCollection = async (slug) => {
        const db = this.getDb("slugs")
        await db.put({
            _id: `${slug}`
        })

    }

    allCollection = async () => {
        const slugDb = this.getDb("slugs")
        const { rows } = await slugDb.allDocs();
        return rows.map(item => (item.id))
    }

    getDb = (slug) => {
        if (this.isMemory) {
            return new PouchDB(slug, { adapter: 'memory' })
        }
        return new PouchDB(slug)
    }

    requestCollectionCreation = async (collectionName) => {
        const slug = slugify(collectionName)

        // check if exist
        try {
            const slugDb = this.getDb("slugs")
            await slugDb.get(`${slug}`)
            throw new Error("DUPLICATED")
        } catch (e) {
            if (e.message === "DUPLICATED") {
                throw new Error("Given name is duplicated")
            }
        }

        const db = this.getDb(slug)

        this.addCollection(slug)

        return {
            name: collectionName,
            slug
        }
    }

    requestDocsCreation = async ({
        collection,
        password,
        signature,
        docs
    }) => {

        const slug = slugify(collection)
        const db = this.getDb(slug)

        const docsOwner = ethers.utils.verifyMessage(DEFAULT_MESSAGE, signature)
        const docsCommitment = await this.generateDocsCommitment(docsOwner, docs)

        const accountHashed = await this.hash(docsOwner)
        const docsHashed = await this.hash(docs)

        if (password) {
            await db.crypto(password)
        }

        await db.put({
            _id: `${docsCommitment}`,
            document: docs
        })

        if (password) {
            db.removeCrypto()
        }

        return {
            docsCommitment: `${docsCommitment}`,
            accountHashed: `${accountHashed}`,
            docsHashed: `${docsHashed}`
        }
    }

    getDocs = async ({
        collection,
        docsCommitment,
        password
    }) => {
        const slug = slugify(collection)
        const db = this.getDb(slug)

        if (password) {
            await db.crypto(password)
        }

        const docs = await db.get(`${docsCommitment}`)

        if (password) {
            db.removeCrypto()
        }

        return docs.document
    }

    encodePrompt = async ({
        signature,
        prompt
    }) => {

        const address = ethers.utils.verifyMessage(DEFAULT_MESSAGE, signature) 
        const addressHashed = await this.hash(address)

        const {prompts} = await this.getPromptResult(addressHashed)
        
        let encoded = []

        for (let i = 0; i < MAX_PROMPT; i++) { 
            const p = prompts[i] 
            if (p) {
                encoded.push(await this.hash(p))
            } else {
                encoded.push(0)
            }
        }

        const index = encoded.indexOf(0)
        if (index === -1) {
            throw new Error("No more prompt allowed for given address")
        }

        encoded[index] = await this.hash(prompt)

        return encoded
    }

    // wallet address in poseidon hash
    getPromptResult = async (address) => {

        let db = this.getDb("prompts")
        let prompts
        let result

        try {
            const exist = await db.get(`${address}`)
            prompts = exist.prompts
            result = exist.result
        } catch (e) {
            // console.log(e)
            prompts = []
            result= []
        }
        return {
            prompts,
            result
        }
    }

    query = async ({
        signature,
        prompt,
        password,
        collection,
        prove,
        docsIds
    }) => {

        const address = ethers.utils.verifyMessage(DEFAULT_MESSAGE, signature) 
        const addressHashed = await this.hash(address)
 
        if (!docsIds && docsIds.length === 0) {
            throw new Error("No docs ID provided")
        }

        // verify prove
        const res = await plonk.verify(VERIFICATION_KEY, prove.publicSignals, prove.proof);
        if (res === false) {
            throw new Error("Invalid proof")
        }

        let contents = []

        // load all docs to in-memory vector store
        for (let docsId of docsIds) { 
            const content = await this.getDocs({
                collection,
                password,
                docsCommitment : docsId
            })
            contents.push(content) 
        }

       
        const output = await this.qa(prompt, contents)
 
        // save result 
        const existing = await this.getPromptResult(addressHashed) 
        const { prompts, result } = existing

        const db = this.getDb("prompts")

        await db.put({
            _id: `${addressHashed}`,
            prompts : prompts.concat([prompt]),
            result : result.concat([output])
        })

        return output
    }

    qa = async (prompt, contents) => {

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000
        });
        
        const parseDocs = await splitter.createDocuments(contents);
        // import to vector db
       
        const vectorStore = await MemoryVectorStore.fromTexts( parseDocs.map(item => item.pageContent), parseDocs.map(item => item.metadata) , this.embeddings)
        const chain = loadQARefineChain(this.model);

        const question = prompt
        const relevantDocs = await vectorStore.similaritySearch(question);

        const res = await chain.call({
            input_documents: relevantDocs,
            question,
        });

        return res["output_text"]
    }

    destroy = async () => {

        if (this.isMemory === false) {

            const collections = await this.allCollection()
            for (let collection of collections) {
                const db = new PouchDB(collection)
                await db.destroy();
                // delete directory recursively
                await fs.rm(collection, { recursive: true, force: true })
            }
            const db = new PouchDB("slugs")
            await db.destroy()
        }

    }

}