const { ethers } = require("hardhat")
const { expect } = require("chai")
const { plonk } = require("snarkjs")

const { PragmaServer } = require("sdk")

const { bitcoinAbstract, bancorAbstract, encode } = require("./helpers")

describe("#contracts", () => {

    let collectionOwner
    let alice
    let bob

    let zkpragma

    // let client
    let server

    let collectionCommitment

    before(async () => {

        [collectionOwner, alice, bob] = await ethers.getSigners();

        const ZKPragma = await ethers.getContractFactory("zkPragma");
        const collectionVerifier = await ethers.deployContract("collectionVerifier");
        const docsVerifier = await ethers.deployContract("docsVerifier")

        zkpragma = await ZKPragma.deploy(collectionVerifier, docsVerifier)

        server = new PragmaServer()
    })

    after(async () => {
        await server.destroy()
    })

    it("should create new collection success", async function () {

        const { name } = await server.requestCollectionCreation("My New Collection")

        const prove = await plonk.fullProve(
            {
                id: 1,
                groupPassword: encode("1234")
            },
            `./circuits/addCollection.wasm`,
            `./circuits/addCollection.zkey`
        )

        const calldata = await plonk.exportSolidityCallData(prove.proof, prove.publicSignals)

        const proof = JSON.parse(calldata.substring(0, calldata.indexOf("]") + 1))

        const commitment = prove.publicSignals[0]

        expect(`${await server.generateCollectionCommitment(1, "1234")}`, `${commitment}`)

        await zkpragma.createCollection(name, commitment, proof)

        const collectionName = await zkpragma.collectionName(1)
        expect(collectionName).to.equal("My New Collection")

        const owner = await zkpragma.collectionOwner(1)
        expect(owner).to.equal(collectionOwner.address)

        collectionCommitment = await zkpragma.collectionCommitment(1)
        expect(collectionCommitment).to.equal(commitment)

    })

    it("should Alice add new document success", async function () {

        const signature = await alice.signMessage("Sign to proceed")

        const docsCommit = await server.requestDocsCreation({
            collection: "My New Collection",
            signature,
            docs: bitcoinAbstract,
            password: "5678"
        })

        const prove = await plonk.fullProve(
            {
                id: 1,
                groupPassword: encode("1234"),
                collectionCommitment: `${collectionCommitment}`,
                docs: await server.hash(bitcoinAbstract),
                address: await server.hash(alice.address)
            },
            `./circuits/addDocs.wasm`,
            `./circuits/addDocs.zkey`
        )

        const calldata = await plonk.exportSolidityCallData(prove.proof, prove.publicSignals)

        const proof = JSON.parse(calldata.substring(0, calldata.indexOf("]") + 1))

        await zkpragma.attachDocs("Bitcoin abstract",1, docsCommit, await server.hash(alice.address), proof)

    })

    it("should Bob add new document success", async function () {

        const signature = await bob.signMessage("Sign to proceed")

        const docsCommit = await server.requestDocsCreation({
            collection: "My New Collection",
            signature,
            docs: bancorAbstract,
            password: "ABCD"
        })

        const prove = await plonk.fullProve(
            {
                id: 1,
                groupPassword: encode("1234"),
                collectionCommitment: `${collectionCommitment}`,
                docs: await server.hash(bancorAbstract),
                address: await server.hash(bob.address)
            },
            `./circuits/addDocs.wasm`,
            `./circuits/addDocs.zkey`
        )

        const calldata = await plonk.exportSolidityCallData(prove.proof, prove.publicSignals)

        const proof = JSON.parse(calldata.substring(0, calldata.indexOf("]") + 1))

        await zkpragma.attachDocs("Bancor abstract",1, docsCommit, await server.hash(bob.address), proof)

    })

    it("should list all docs on the collection and verify its owner success", async function () {

        const docsIds = await zkpragma.listDocs(1)
        expect(docsIds.length).to.equal(2)

        // check 1st docs
        const docsCommitment1 = await zkpragma.getDocsCommitment(1, 1)
        expect(await server.generateDocsCommitment(alice.address, bitcoinAbstract)).to.equal(docsCommitment1)

        // check 2nd docs
        const docsCommitment2 = await zkpragma.getDocsCommitment(1, 2)
        expect(await server.generateDocsCommitment(bob.address, bancorAbstract)).to.equal(docsCommitment2)
    })

    it("should get all docs and decrypt the original content back success", async function () {

        // check 1st docs
        const docsCommitment1 = await zkpragma.getDocsCommitment(1, 1)
        const content1 = await server.getDocs({
            collection : "My New Collection",
            docsCommitment : docsCommitment1,
            password : "5678"
        })

        expect(content1).to.equal(bitcoinAbstract)

        // check 2nd docs
        const docsCommitment2 = await zkpragma.getDocsCommitment(1, 2)
        const content2 = await server.getDocs({
            collection : "My New Collection",
            docsCommitment : docsCommitment2,
            password : "ABCD"
        })

        expect(content2).to.equal(bancorAbstract)
        
    })

})