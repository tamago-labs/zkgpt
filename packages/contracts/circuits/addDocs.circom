pragma circom 2.0.0;

include "./hasher.circom";

template addDocs() {

    signal input id;
    signal input groupPassword;
    signal input collectionCommitment;

    signal input docs;
    signal input address;

    signal output docsCommitment;

    // verify collectionHash
    component collectionHasher = HashCollection();
    collectionHasher.id <== id;
    collectionHasher.groupPassword <== groupPassword;

    collectionCommitment === collectionHasher.out;

    // produce a docs commitment
    component docsHasher = HashDocs();

    docsHasher.address <== address;
    docsHasher.docs <== docs;

    docsCommitment <== docsHasher.docsCommitment;
}

component main {public [id, collectionCommitment, address]} = addDocs();