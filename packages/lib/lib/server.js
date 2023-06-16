// import { HNSWLib } from "langchain/vectorstores/hnswlib";
import PouchDB from 'pouchdb';
import { ethers } from "ethers";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { slugify, encode } from "../helpers";
import { Base } from "./base"

import fs from "node:fs/promises";
import cryptoPouch from "crypto-pouch"
import pounchAdapterMemory from "pouchdb-adapter-memory"

PouchDB.plugin(cryptoPouch)
PouchDB.plugin(pounchAdapterMemory)

export class GptServer extends Base {

    isMemory

    constructor() {
        super()
        this.isMemory = false
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

        const docsOwner = ethers.utils.verifyMessage("Sign to proceed", signature)
        const docCommitment = await this.generateDocsCommitment(docsOwner, docs)
        if (password) {
            await db.crypto(password)
        }

        await db.put({
            _id: `${docCommitment}`,
            document: docs
        })

        if (password) {
            db.removeCrypto()
        }

        return `${docCommitment}`
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