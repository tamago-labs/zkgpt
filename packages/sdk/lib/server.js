// import { HNSWLib } from "langchain/vectorstores/hnswlib";
import PouchDB from 'pouchdb';

import { buildPoseidon } from "circomlibjs"
import { ethers } from "ethers";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { slugify, encode } from "../helpers";

import fs from "node:fs/promises";


PouchDB.plugin(require('crypto-pouch'))

export class PragmaServer {

    collections

    constructor() {
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

    generateDocsCommitment = async (owner, docs) => { 
        return await this.hashItems([owner,docs])
    }

    hash = async (content) => {
        const poseidon = await buildPoseidon()
        // const preImage = [this.encode(content)].reduce((sum, x) => sum + x, 0n);
        return poseidon.F.toObject(poseidon([encode(content)]))
    }

    hashItems = async (items) => {
        const poseidon = await buildPoseidon()
        let hashed = []
        for (let item of items) {
            hashed.push(await this.hash(item))
        }
        const preImage = hashed.reduce((sum, x) => sum + x, 0n);
        return poseidon.F.toObject(poseidon([preImage]))
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