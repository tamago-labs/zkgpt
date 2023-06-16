// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./collectionVerifier.sol";
import "./docsVerifier.sol";

contract zkGPT {
    struct Collection {
        string name;
        uint256 commitment;
        address owner;
    }

    struct Document {
        string name;
        uint256 commitment;
        uint timestamp;
    }

    mapping(uint256 => Collection) public collections;
    mapping(uint256 => mapping(uint256 => Document)) public documents;

    collectionVerifier public cVerifier;
    docsVerifier public dVerifier;

    uint256 public collectionCount;
    // collection id -> doc id
    mapping(uint256 => uint256) public docCount;

    event CollectionCreated(uint256 _id, address indexed owner);
    event DocsAdded(uint256 _collectionId, uint256 _docId, uint256 _commitment);

    constructor(address _collectionVerifier, address _docsVerifier) {
        cVerifier = collectionVerifier(_collectionVerifier);
        dVerifier = docsVerifier(_docsVerifier);
    }

    // create new collection
    function createCollection(
        string memory _name,
        uint256 _commitment,
        uint256[24] calldata proof
    ) external {
        collectionCount += 1;

        collections[collectionCount].name = _name;
        collections[collectionCount].commitment = _commitment;
        collections[collectionCount].owner = msg.sender;

        require(
            (cVerifier).verifyProof(proof, [_commitment, collectionCount]),
            "SNARK verification failed"
        );

        emit CollectionCreated(collectionCount, msg.sender);
    }

    // check collection owner
    function collectionOwner(
        uint256 _collectionId
    ) external view returns (address) {
        return collections[_collectionId].owner;
    }

    // check collection name
    function collectionName(
        uint256 _collectionId
    ) external view returns (string memory) {
        return collections[_collectionId].name;
    }

    // check collection commitment
    function collectionCommitment(
        uint256 _collectionId
    ) external view returns (uint256) {
        return collections[_collectionId].commitment;
    }

    // add new docs
    function attachDocs(
        string memory _name, // public
        uint256 _collectionId,
        uint256 _docsCommitment,
        uint256 _ownerAddress, // in poseidon hash
        uint256[24] calldata proof
    ) external {
        docCount[_collectionId] += 1;

        documents[_collectionId][docCount[_collectionId]].name = _name;
        documents[_collectionId][docCount[_collectionId]]
            .commitment = _docsCommitment;
        documents[_collectionId][docCount[_collectionId]].timestamp = block
            .timestamp;

        require(
            (dVerifier).verifyProof(
                proof,
                [
                    _docsCommitment,
                    _collectionId,
                    collections[_collectionId].commitment,
                    _ownerAddress
                ]
            ),
            "SNARK verification failed"
        );

        emit DocsAdded(_collectionId, docCount[_collectionId], _docsCommitment);
    }

    // list all docs id in the collection
    function listDocs(
        uint256 _collectionId
    ) external view returns (uint256[] memory) {
        uint256[] memory docsIds = new uint256[](docCount[_collectionId]);
        for (uint i = 0; i < docCount[_collectionId]; i++) {
            docsIds[i] = i;
        }
        return docsIds;
    }

    // get docs commitment
    function getDocsCommitment(uint256 _collectionId, uint256 _docsId) external view returns (uint256) {
        return documents[_collectionId][_docsId].commitment;
    }

    // get docs name
    function getDocsName(uint256 _collectionId, uint256 _docsId) external view returns (string memory) {
        return documents[_collectionId][_docsId].name;
    }
}
