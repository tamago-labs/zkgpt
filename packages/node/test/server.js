import chai from "chai";
import chaiHttp from "chai-http"
import { server, gpt } from "../lib/index.js"

import { ethers } from "ethers"

chai.use(chaiHttp)

const { expect } = chai

const SAMPLE_DOCS = "10 Best Cities in Japan 1.Tokyo 2.Yokohama 3.Osaka 4.Kyoto 5.Kobe 6.Sapporo 7.Hakodate 8.Hiroshima 9.Aomori 10.Naha and Okinawa City"
const PASSWORD = "1234"

describe('#api', function () {

    before(function () {
        gpt.useMemory()
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
            docs: SAMPLE_DOCS,
            password: PASSWORD
        }

        chai.request(server)
            .post('/docs/new')
            .send(input)
            .end((err, res) => {
                const { body } = res
                expect(body.docsCommitment).equal("15503903167908348755327793333186539423696709066170461443290096958058599065733")
                done();
            });
    })

    it('should get docs from the collection success ', (done) => {

        chai.request(server)
            .get('/docs/my-new-collection/15503903167908348755327793333186539423696709066170461443290096958058599065733?password=1234')
            .end((err, res) => {
                const { body } = res
                expect(body.content).equal(SAMPLE_DOCS)
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

    it('should query success ', (done) => {

        const signature = "0xef63679b8cb74a2f5183b9fe36b14890020b2819fe44a5cc22813894569fa19c6e42a41571f7be05f3aad49510848f6caccb654040fa44725f76840dc3ece54c1c"

        gpt.generateCollectionCommitment(1, PASSWORD).then(
            (collectionCommitment) => {
                const input = {
                    signature,
                    prompt: "What are top 3 cities in Japan?",
                    collectionId: 1,
                    collection: "My new collection",
                    password: PASSWORD,
                    collectionCommitment: `${collectionCommitment}`,
                    docsIds: ["15503903167908348755327793333186539423696709066170461443290096958058599065733"]
                }

                chai.request(server)
                    .post('/query')
                    .send(input)
                    .end((err, res) => {
                        const { body } = res
                        const { output } = body
                        expect(output.includes("Tokyo")).to.true
                        expect(output.includes("Yokohama")).to.true
                        expect(output.includes("Osaka")).to.true
                        done();
                    });
            }
        )
    })

    it('should get prompt result success ', (done) => {

        const addressInPoseison = "12471271009054474401476677111111445258455795464701002131744189241477548691390"

        chai.request(server)
            .get(`/prompt/${addressInPoseison}`) 
            .end((err, res) => { 
                const { body } = res
                const { prompts  } = body
                expect(prompts[0]).to.equal("What are top 3 cities in Japan?")
                done();
            });
    })

})

