const { expect } = require("chai")
const wasm_tester = require("circom_tester").wasm;
const path = require("path");
const { encode } = require("./helpers")

describe('#circuits', () => {

    let addCollectionCircuit
    let addDocsCircuit
    let queryCircuit

    let collectionCommitment
    
    before(async () => {
        addCollectionCircuit = await wasm_tester(path.join("circuits", "addCollection.circom"))
        addDocsCircuit = await wasm_tester(path.join("circuits", "addDocs.circom"))
        queryCircuit = await wasm_tester(path.join("circuits", "query.circom"))
    })

    it("should verify the collection creation", async () => {
        
        const input = {
            id : 1,
            groupPassword : encode("1234")
        }

        const witness = await addCollectionCircuit.calculateWitness(input);

        collectionCommitment = witness[1]

        await addCollectionCircuit.assertOut(witness, { commitment: "15129250603373055641101161919233764293779002629665838107987875381893234494088" });
    })

    it("should verify the docs creation", async () => {

        const input = {
            id : 1,
            groupPassword : encode("1234"),
            collectionCommitment,
            docs: encode("0xf5c04934fb3372c8fbef36e6a831788f0e043698f670801e08e2c11c4796b0ff"),
            address: encode("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
        }

        const witness = await addDocsCircuit.calculateWitness(input);
  
        await addDocsCircuit.assertOut(witness, { docsCommitment: "9602593956175656509882540171867835582370566457461565151432462255255408447125" });
    })

    it("should verify the prompts creation", async () => {

        const input = {
            id : 1,
            groupPassword : encode("1234"),
            collectionCommitment,
            address: encode("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
            prompt: [encode("Hello"), encode("How are you?") , encode("I'm fine") , 0,0 ]
        }

        const witness = await queryCircuit.calculateWitness(input);
        await queryCircuit.assertOut(witness, { out: "5461633340640799655521832303159113811720260819049691428697293701542705152956" });
    })



})