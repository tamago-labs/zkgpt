const bigintConversion = require('bigint-conversion')
const { plonk } = require("snarkjs") 

exports.bitcoinAbstract = `
Bitcoin is a purely peer-to-peer version of electronic cash would allow online
payments to be sent directly from one party to another without going through a
financial institution. Digital signatures provide part of the solution, but the main
benefits are lost if a trusted third party is still required to prevent double-spending.
We propose a solution to the double-spending problem using a peer-to-peer network.
The network timestamps transactions by hashing them into an ongoing chain of
hash-based proof-of-work, forming a record that cannot be changed without redoing
the proof-of-work. The longest chain not only serves as proof of the sequence of
events witnessed, but proof that it came from the largest pool of CPU power. As
long as a majority of CPU power is controlled by nodes that are not cooperating to
attack the network, they'll generate the longest chain and outpace attackers. The
network itself requires minimal structure. Messages are broadcast on a best effort
basis, and nodes can leave and rejoin the network at will, accepting the longest
proof-of-work chain as proof of what happened while they were gone.
`

exports.bancorAbstract = `
The Bancor protocol enables built-in price discovery and a liquidity mechanism for tokens on smart contract blockchains. These “smart tokens” hold one or more other tokens in reserve, and enable any party to instantly purchase or liquidate the smart token in exchange for one of its reserve tokens, directly through the smart token's contract, at a continuously calculated price, according to a formula which balances buy and sell volumes.
`

exports.encode = (val) => {
    switch (typeof val) {
        case "number":
            return BigInt(val);
        case "string":
            return bigintConversion.textToBigint(val);
        case "object":
            return bigintConversion.bufToBigint(val.buffer);
        default:
            return 0n;
    }
}
