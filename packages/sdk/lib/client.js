
import axios from "axios"

const MESSAGE = "Sign this message to submit"

export class PromptClient {

    host

    constructor(host = "http://localhost:8000") {
        this.host = host
    }

    check = async () => {
        const { data } = await axios.get(this.host)
        return data.status
    }

    createCollection = async ({
        name,
        signer
    }) => {
        const signature = await signer.signMessage(MESSAGE)
        console.log("signature --> ", signature)
    }

    listCollections = async () => {

    }

    getCollection = async () => {

    }

    deleteCollection = async () => {

    }

}
