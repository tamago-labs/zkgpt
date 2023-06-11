import pkg from 'hardhat';
const { ethers } = pkg;

import { expect } from "chai"


describe("zkPrompt - contracts", function () {

    let zkPrompt

    let admin
    let alice
    let bob

    before(async () => {

        [admin, alice, bob] = await ethers.getSigners();

        const ZkPrompt = await ethers.getContractFactory("zkPrompt");

        zkPrompt = await ZkPrompt.deploy()
    })

    // after(function () {
    //     server.close((err) => {
    //         console.log('server closed')
    //         process.exit(err ? 1 : 0)
    //     })
    // })

    it("should create new collection success", async function () {

        console.log("should create new collection success...")

        expect("hello").to.equal("hello")

    })

});
