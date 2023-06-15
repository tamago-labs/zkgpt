pragma circom 2.0.0;

include "./hasher.circom";

template AddCollection() {

    signal input id;
    signal input groupPassword;

    signal output commitment;

    component collection = HashCollection();

    collection.id <== id;
    collection.groupPassword <== groupPassword;

    commitment <== collection.out;
}

component main  {public [id]} = AddCollection();