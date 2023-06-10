import { expect } from "chai";
import { PromptClient, OpenAIEmbeddingFunction } from "promptdb"
import { server } from "../lib/index.js"

let client

describe('#sdk()', function () {

    before(function () {
        client = new PromptClient()
    })

    after(function () {
        server.close((err) => {
            console.log('server closed')
            process.exit(err ? 1 : 0)
        })
    })

    it('should return default host', async function () {
        expect(client.host).equal("http://localhost:8000")
    })

    it('should return ok status', async function () {
        const status = await client.check()
        expect(status).equal("ok")
    })

})