// import { HNSWLib } from "langchain/vectorstores/hnswlib";
import PouchDB from 'pouchdb';
import { ethers } from "ethers";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { slugify, encode } from "../helpers";
import { Base } from "./base"
import fs from "node:fs/promises";

PouchDB.plugin(require('crypto-pouch'))

export class PragmaServer extends Base {

    collections

    constructor() {
        super()
        this.collections = []
    }

    requestCollectionCreation = async (collectionName) => {
        const slug = slugify(collectionName)

        if (this.collections.includes(slug)) {
            throw new Error("Given name is duplicated")
        }

        const db = new PouchDB(slug)

        this.collections.push(slug)

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
        const db = new PouchDB(slug)

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

        return docCommitment
    }

    getDocs = async ({
        collection,
        docsCommitment,
        password
    }) => {
        const slug = slugify(collection)
        const db = new PouchDB(slug)

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

        for (let collection of this.collections) {
            const db = new PouchDB(collection)
            await db.destroy();
            // delete directory recursively
            await fs.rm(collection, { recursive: true, force: true })
        }
    }

}