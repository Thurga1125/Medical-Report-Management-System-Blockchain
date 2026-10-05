const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const hre = require("hardhat");

const HASH_A = hre.ethers.sha256(hre.ethers.toUtf8Bytes("record A"));
const HASH_B = hre.ethers.sha256(hre.ethers.toUtf8Bytes("record B"));

let registry, submitter;

beforeEach(async () => {
  [submitter] = await hre.ethers.getSigners();
  registry = await (await hre.ethers.getContractFactory("MedicalRecordRegistry")).deploy();
  await registry.waitForDeployment();
});

test("getAnchor reports a missing record as not existing", async () => {
  const [exists, hash] = await registry.getAnchor("nope");
  assert.equal(exists, false);
  assert.equal(hash, hre.ethers.ZeroHash);
});

test("anchorRecord stores hash, type, submitter and timestamp", async () => {
  await (await registry.anchorRecord("bill-1", HASH_A, "BILL")).wait();
  const [exists, hash, recordType, who, timestamp] = await registry.getAnchor("bill-1");
  assert.equal(exists, true);
  assert.equal(hash, HASH_A);
  assert.equal(recordType, "BILL");
  assert.equal(who, submitter.address);
  assert.ok(timestamp > 0n);
  assert.equal(await registry.totalAnchored(), 1n);
});

test("anchorRecord emits RecordAnchored", async () => {
  const tx = await registry.anchorRecord("rep-1", HASH_A, "REPORT");
  const receipt = await tx.wait();
  const events = await registry.queryFilter(registry.filters.RecordAnchored(), receipt.blockNumber);
  assert.equal(events.length, 1);
  assert.equal(events[0].args.hash, HASH_A);
  assert.equal(events[0].args.recordType, "REPORT");
});

test("a record id can only be anchored once", async () => {
  await (await registry.anchorRecord("bill-1", HASH_A, "BILL")).wait();
  await assert.rejects(registry.anchorRecord("bill-1", HASH_B, "BILL"), /Record already anchored/);
  const [, hash] = await registry.getAnchor("bill-1");
  assert.equal(hash, HASH_A, "original fingerprint must be untouched");
  assert.equal(await registry.totalAnchored(), 1n);
});

test("verifyRecord is true only for the anchored hash", async () => {
  await (await registry.anchorRecord("bill-1", HASH_A, "BILL")).wait();
  assert.equal(await registry.verifyRecord("bill-1", HASH_A), true);
  assert.equal(await registry.verifyRecord("bill-1", HASH_B), false);
  assert.equal(await registry.verifyRecord("unknown", HASH_A), false);
});
