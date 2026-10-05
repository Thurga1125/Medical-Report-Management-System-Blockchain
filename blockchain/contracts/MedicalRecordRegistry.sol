// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Anchors SHA-256 fingerprints of medical bills and lab reports on-chain.
/// Anchored records are immutable: a record id can only be written once.
contract MedicalRecordRegistry {
    struct Anchor {
        bytes32 hash;
        string recordType; // "BILL" | "REPORT"
        address submitter;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Anchor) private anchors;
    uint256 public totalAnchored;

    event RecordAnchored(string indexed recordId, bytes32 hash, string recordType, address submitter, uint256 timestamp);

    function anchorRecord(string calldata recordId, bytes32 hash, string calldata recordType) external {
        require(!anchors[recordId].exists, "Record already anchored");
        anchors[recordId] = Anchor(hash, recordType, msg.sender, block.timestamp, true);
        totalAnchored++;
        emit RecordAnchored(recordId, hash, recordType, msg.sender, block.timestamp);
    }

    function getAnchor(string calldata recordId)
        external view
        returns (bool exists, bytes32 hash, string memory recordType, address submitter, uint256 timestamp)
    {
        Anchor storage a = anchors[recordId];
        return (a.exists, a.hash, a.recordType, a.submitter, a.timestamp);
    }

    function verifyRecord(string calldata recordId, bytes32 hash) external view returns (bool) {
        Anchor storage a = anchors[recordId];
        return a.exists && a.hash == hash;
    }
}
