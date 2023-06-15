
import axios from "axios"
// import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { slugify, encode } from "../helpers";
import * as bigintConversion from 'bigint-conversion'
import { buildPoseidon } from "circomlibjs"
import { ethers } from "ethers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";



export class PragmaClient {

    host

    constructor(host = "http://localhost:8000") {
        this.host = host
    }

    generateDocsCommitment = async (password, docs) => {
        const poseidon = await buildPoseidon()
        const preImage = [encode(password), encode(docs)].reduce((sum, x) => sum + x, 0n);
        return poseidon.F.toObject(poseidon([preImage]))
    }
 

    // createCollection = async ({
    //     name,
    //     signer
    // }) => {
    //     const signature = await signer.signMessage(MESSAGE)
    //     console.log("signature --> ", signature)
    // }

    // listCollections = async () => {

    // }

    // getCollection = async () => {

    // }

    // deleteCollection = async () => {

    // }

}
