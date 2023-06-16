import chai from "chai";
import chaiHttp from "chai-http"
import { server, pragma } from "../lib/index.js"

import { ethers } from "ethers"

chai.use(chaiHttp)

const { expect } = chai


describe('#api', function () {

    before(function () {
        pragma.useMemory()
    })

    it('should get server status success ', (done) => {
        chai.request(server)
            .get('/')
            .end((err, res) => {
                const { body, status } = res
                expect(status).equal(200)
                expect(body.status).equal("ok")
                done();
            });
    })

    it('should create new collection success ', (done) => {

        const input = {
            collectionName: "My new collection"
        }
        chai.request(server)
            .post('/collection/new')
            .send(input)
            .end((err, res) => {
                const { body, status } = res
                expect(body.slug).equal("my-new-collection")
                done();
            });
    })

    it('should add docs to the collection success ', (done) => {

        const signature = "0xef63679b8cb74a2f5183b9fe36b14890020b2819fe44a5cc22813894569fa19c6e42a41571f7be05f3aad49510848f6caccb654040fa44725f76840dc3ece54c1c"

        const input = {
            collection: "My new collection",
            signature,
            docs: "hello this is my docs",
            password: "1234"
        }

        chai.request(server)
            .post('/docs/new')
            .send(input)
            .end((err, res) => {
                const { body } = res
                expect(body.docsCommitment).equal("826992418427306594009410061166172399047308976833405385028894093579568749752")
                done();
            });
    })

    it('should get docs from the collection success ', (done) => {

        chai.request(server)
            .get('/docs/my-new-collection/826992418427306594009410061166172399047308976833405385028894093579568749752?password=1234')
            .end((err, res) => {
                const { body } = res
                expect(body.content).equal("hello this is my docs")
                done();
            });
    })

    it('should get all collection success ', (done) => {
        chai.request(server)
            .get('/collections')
            .end((err, res) => {
                const { body, status } = res
                expect(body.collections[0]).to.equal('my-new-collection')
                done();
            });
    })

})


// describe('#server', function () {
//     let client
//     before(function () {
//         client = new PragmaClient()
//     })
//     after(function () {
//         server.close((err) => {
//             console.log('server closed')
//             process.exit(err ? 1 : 0)
//         })
//     })
//     it('should return default host', async function () { 
//         expect(client.host).equal("http://localhost:8000")
//     })
//     it('should return ok status', async function () {
//         const status = await client.check()
//         expect(status).equal("ok")
//     })
// })