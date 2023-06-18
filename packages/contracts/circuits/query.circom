pragma circom 2.0.0;

include "./hasher.circom";

template query(k) {

    signal input id;
    signal input groupPassword;
    signal input collectionCommitment;

    signal input prompt[k];
    signal input address;
    
    signal output out;

    // verify collectionHash
    component collectionHasher = HashCollection();
    collectionHasher.id <== id;
    collectionHasher.groupPassword <== groupPassword;

    collectionCommitment === collectionHasher.out;

    // Hash prompts 
    component hasher = Poseidon(k+1);

    for (var i=0;i<k;i++) {
        hasher.inputs[i] <== prompt[i];
    }

    hasher.inputs[k] <== address;

    out <== hasher.out;
}

component main = query(5);