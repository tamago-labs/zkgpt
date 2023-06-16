import { buildPoseidon } from "circomlibjs"
import { slugify, encode } from "../helpers";

export class Base {

    generateDocsCommitment = async (owner, docs) => { 
        return await this.hashItems([owner,docs])
    }

    generateCollectionCommitment = async (collectionId, collectionPassword) => {
        const poseidon = await buildPoseidon()
        const preImage = [encode(collectionId), encode(collectionPassword)].reduce((sum, x) => sum + x, 0n);
        return poseidon.F.toObject(poseidon([preImage]))
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

}