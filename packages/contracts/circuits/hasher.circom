pragma circom 2.0.0;

include "./utils.circom";

template HashCollection() {

    signal input id;
    signal input groupPassword;

    signal output out;

    component preImage = CalculateTotal(2);
    component hasher = Poseidon(1);

    preImage.nums[0] <== id;
    preImage.nums[1] <== groupPassword;

    hasher.inputs[0] <== preImage.sum;

    out <== hasher.out;
}

template HashDocs() {

    signal input address;
    signal input docs;

    signal output docsCommitment;

    component preImage = CalculateTotal(2);
    component hasher = Poseidon(1);

    preImage.nums[0] <== address;
    preImage.nums[1] <== docs;

    hasher.inputs[0] <== preImage.sum;

    docsCommitment <== hasher.out;
}