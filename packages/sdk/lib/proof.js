
import { plonk } from "snarkjs";
import { encode } from "../helpers"

export async function unpackProof(raw) {
    let { proof, publicSignals } = await raw;

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
    const argv = calldata.replace(/["[\]\s]/g, "").split(',').map((x) => BigInt(x));

    const solidityProof = ethers.utils.arrayify(ethers.utils.hexlify(argv[0]));
    let commitment = argv[1];

    return { proof, solidityProof, commitment }
}

function unstringifyBigInts(o) {
    if ((typeof (o) == "string") && (/^[0-9]+$/.test(o))) {
        return BigInt(o);
    } else if ((typeof (o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o))) {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o === null) return null;
        let res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}
 