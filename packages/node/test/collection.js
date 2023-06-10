import { expect } from "chai";
import { PromptClient , OpenAIEmbeddingFunction } from "promptdb"

let client

describe('#collection()', function () {

    before(function () {

        client = new PromptClient()

    })

    after(function () {
        server.close((err) => {
            console.log('server closed')
            process.exit(err ? 1 : 0)
        })
    })

    it('should add a single item', async function () {
        
        console.log("hello...")
        
    })

})