#!/usr/bin/env node
/**
 * Offline receipt verifier (machine B) — fail-closed.
 * Validates continuum-work-signature-v4 artifacts without private keys.
 *
 * Usage:
 *   node demo/verify-receipts.mjs [path-to-.pbc-data]
 *   PBC_DATA_DIR=./export node demo/verify-receipts.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SCHEMA_V4 = 'continuum-work-signature-v4';
const dataRoot = path.resolve(process.env.PBC_DATA_DIR || process.argv[2] || '.pbc-data');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (name.endsWith('.sig.json')) acc.push(full);
  }
  return acc;
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function buildPayloadV4(workHash, signer, publicKey) {
  return [SCHEMA_V4, workHash, signer, publicKey].join('\n');
}

function verifySignature(sigPath) {
  const sig = JSON.parse(fs.readFileSync(sigPath, 'utf-8'));
  const workFile = sig.work_file;
  const recordedHash = sig.work_hash;
  if (!workFile || !recordedHash || !sig.public_key || !sig.signature_base64) {
    return { sigPath, valid: false, reason: 'incomplete signature artifact' };
  }
  if (!fs.existsSync(workFile)) {
    return { sigPath, valid: false, reason: 'work file missing: ' + workFile };
  }
  const currentHash = hashFile(workFile);
  if (currentHash !== recordedHash) {
    return { sigPath, valid: false, reason: 'work hash mismatch (file changed)' };
  }
  const signer = sig.signer || 'UNKNOWN_SIGNER';
  const expected = buildPayloadV4(recordedHash, signer, sig.public_key);
  const payload = typeof sig.signed_message === 'string' ? sig.signed_message : expected;
  if (payload !== expected) {
    return { sigPath, valid: false, reason: 'signed_message does not match v4 convention' };
  }
  try {
    const pub = crypto.createPublicKey({ key: Buffer.from(sig.public_key, 'base64'), format: 'der', type: 'spki' });
    const ok = crypto.verify(null, Buffer.from(payload, 'utf-8'), pub, Buffer.from(sig.signature_base64, 'base64'));
    return { sigPath, valid: ok, reason: ok ? 'ok' : 'Ed25519 verify failed' };
  } catch (e) {
    return { sigPath, valid: false, reason: e.message };
  }
}

if (!fs.existsSync(dataRoot)) {
  console.error('FAIL: data directory not found:', dataRoot);
  process.exit(1);
}

const sigFiles = walk(dataRoot);
if (sigFiles.length === 0) {
  console.error('FAIL: no .sig.json files under', dataRoot);
  process.exit(1);
}

let passed = 0;
let failed = 0;
for (const sigPath of sigFiles) {
  const r = verifySignature(sigPath);
  if (r.valid) {
    passed++;
    console.log('OK  ', path.relative(dataRoot, sigPath));
  } else {
    failed++;
    console.log('FAIL', path.relative(dataRoot, sigPath), '—', r.reason);
  }
}

console.log('');
console.log(`Summary: ${passed}/${sigFiles.length} signatures valid`);
if (failed > 0) process.exit(1);