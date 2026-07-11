#!/usr/bin/env node
/**
 * AFT: user-approved-ai-generated
 * AGENT: P-Dawg-CODEX
 * GENERATED_AT: 2026-05-21T18:18:19.357Z
 * PRODUCT_STAGE: S3_ENTERPRISE_INSTALL
 * REQUIRED_FOR: S3,S4
 * FILE_ROLE: runtime
 * PREVIOUS_PROVENANCE: Dima // 2026-05-21T18:11:52.349Z
 * +----------------------------------------------------------------------------+
 * | CONTINUUM-META SUBSTRATE // v1.0.1                                           |
 * | PROVENANCE: P-Dawg-CODEX // 2026-05-21T18:18:19.357Z                         |
 * +----------------------------------------------------------------------------+
 */
/**
 * PBC demo bridge (Synth Desk + PBC Shift)
 * v0.1.0 - 2026-07-11
 * AFT: AI-generated-user-reviewed-pending
 *
 * Localhost HTTP server that gives PBC demo clients access to
 * filesystem + shell on the local machine. Localhost-only by hard bind.
 *
 * v1.3.3 changes from v1.3.2:
 *   - Identity Manager v2 (see docs/identity-manager-v2-spec.md). The v1.3.2
 *     identity endpoints were non-functional: a process.platform() crash, a
 *     non-deterministic fingerprint, and a model that identified the bridge
 *     process instead of the agent. Replaced with:
 *       /identity/hash-file     deterministic SHA256 of a file's bytes
 *       /identity/sign-work     binds a work file hash to a signer identity hash
 *       /identity/validate-work re-hashes signed work, reports match/changed
 *   - Removed /identity/fingerprint (broken concept; identity is a file the
 *     agent authored, not bridge process metadata).
 *   - Fixed process.platform() crash (process.platform is a string).
 *   - All filesystem + shell features preserved unchanged.
 *
 * USAGE:
 *   node bridge.js                       # ghost pepper mode, auto-shell
 *   node bridge.js --require-confirm     # prompts before destructive ops
 *   node bridge.js --port 7878           # change port (default 7878)
 *   node bridge.js --shell pwsh          # force PowerShell on Windows
 *   node bridge.js --shell cmd           # force cmd.exe on Windows
 *   node bridge.js --shell bash          # force bash (Unix-like)
 *
 * SECURITY POSTURE: GHOST PEPPER (v1.x default)
 *   Bind: 127.0.0.1 only. Not network-reachable.
 *   No filesystem allow-list. v2.1 will introduce --workspace mode.
 *   Shell exec enabled with destructive-pattern warnings.
 *   Every request logged to stdout with correlation ID. Watch the console.
 *
 * KILL SWITCH: Ctrl+C.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const readline = require('readline');
const crypto = require('crypto');

// ---------- Config ----------
const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}
const PORT = parseInt(argValue('--port') || '7878', 10);
const REQUIRE_CONFIRM = args.includes('--require-confirm');
const SHELL_OVERRIDE = argValue('--shell'); // pwsh | cmd | bash
const BIND_HOST = '127.0.0.1'; // hard-coded localhost. do not change.
const PBC_DATA_DIR = path.resolve(
  process.env.PBC_DATA_DIR || argValue('--data-dir') || path.join(process.cwd(), '.pbc-data')
);

function pbcPaths() {
  const root = PBC_DATA_DIR;
  return {
    root,
    truthroot: path.join(root, 'truthroot', 'known_agents.json'),
    inboxOpen: path.join(root, 'inbox', 'open'),
    inboxDone: path.join(root, 'inbox', 'done'),
    timecards: path.join(root, 'timecards'),
    receipts: path.join(root, 'receipts'),
    keys: path.join(root, 'keys')
  };
}

function ensurePbcDirs() {
  const p = pbcPaths();
  for (const dir of [p.root, path.dirname(p.truthroot), p.inboxOpen, p.inboxDone, p.timecards, p.receipts, p.keys]) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(p.truthroot)) {
    fs.writeFileSync(p.truthroot, JSON.stringify({ agents: [] }, null, 2) + '\n', 'utf-8');
  }
  return p;
}

// Determine which shell to use
function detectShell() {
  if (SHELL_OVERRIDE) return SHELL_OVERRIDE;
  if (process.platform === 'win32') {
    // Prefer PowerShell on Windows since it handles ~ and POSIX-flavored
    // commands better than cmd.exe. Fall back to cmd if pwsh not available.
    try {
      require('child_process').execSync('pwsh -Command "exit 0"', { stdio: 'ignore' });
      return 'pwsh';
    } catch (e) {
      return 'cmd';
    }
  }
  return 'bash';
}
const ACTIVE_SHELL = detectShell();

// ---------- Console helpers ----------
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  blue: '\x1b[38;5;110m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  gray: '\x1b[90m'
};

function banner() {
  console.log('');
  console.log(`${C.bold}${C.blue}  PBC // DEMO BRIDGE${C.reset} ${C.dim}v0.1.0${C.reset}`);
  console.log(`${C.dim}  ============================${C.reset}`);
  console.log(`${C.dim}  Bind:${C.reset}     ${C.cyan}http://${BIND_HOST}:${PORT}${C.reset}`);
  console.log(`${C.dim}  Posture:${C.reset}  ${REQUIRE_CONFIRM ? C.yellow + 'GLOVES ON (require-confirm)' : C.red + 'GHOST PEPPER (full access)'}${C.reset}`);
  console.log(`${C.dim}  Shell:${C.reset}    ${C.cyan}${ACTIVE_SHELL}${C.reset}`);
  console.log(`${C.dim}  Platform:${C.reset} ${process.platform}`);
  console.log(`${C.dim}  CWD:${C.reset}      ${process.cwd()}`);
  console.log(`${C.dim}  Home:${C.reset}     ${os.homedir()}`);
  console.log(`${C.dim}  PBC data:${C.reset} ${PBC_DATA_DIR}`);
  console.log('');
  console.log(`${C.dim}  Kill: Ctrl+C${C.reset}`);
  console.log('');
}

function genCorrelationId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function logReq(corrId, method, endpoint, summary, status = 'ok') {
  const ts = new Date().toLocaleTimeString();
  const statusColor = status === 'ok' ? C.green : status === 'denied' ? C.yellow : C.red;
  console.log(`${C.dim}[${ts}]${C.reset} ${C.gray}#${corrId}${C.reset} ${C.cyan}${method}${C.reset} ${endpoint} ${C.gray}-${C.reset} ${summary} ${C.gray}-${C.reset} ${statusColor}${status}${C.reset}`);
}

// ---------- Path expansion (the v1.1 fix) ----------
function expandPath(p) {
  if (!p) return p;
  if (p.startsWith('~')) {
    return path.resolve(p.replace(/^~/, os.homedir()));
  }
  return path.resolve(p);
}

function expandTildeInCommand(command) {
  // Replace `~/` and `~` (as a token) with the home dir in shell commands.
  // This handles common patterns like `cd ~/Documents`, `ls ~`, etc.
  // It does NOT touch ~ inside quoted strings (best-effort; for full POSIX
  // tilde handling, use --shell bash on Unix or --shell pwsh on Windows).
  const home = os.homedir();
  return command
    .replace(/(^|\s)~\//g, `$1${home.replace(/\\/g, '/')}/`)
    .replace(/(^|\s)~(\s|$)/g, `$1${home.replace(/\\/g, '/')}$2`);
}

// ---------- Confirmation prompt ----------
function promptConfirm(description) {
  return new Promise((resolve) => {
    if (!REQUIRE_CONFIRM) return resolve(true);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(`${C.yellow}${C.bold}  CONFIRM REQUIRED:${C.reset} ${description}`);
    rl.question(`${C.yellow}  Allow? [y/N] ${C.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

const DESTRUCTIVE_PATTERNS = [
  /\brm\s+-rf\b/i,
  /\bremove-item\s+-recurse\b/i,
  /\bgit\s+push\s+(--force|-f)\b/i,
  /\bsudo\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  />\s*\/dev\/sd[a-z]/i,
  /\bformat\s+[a-z]:/i  // windows format command
];

function isDestructive(command) {
  return DESTRUCTIVE_PATTERNS.some((p) => p.test(command));
}

// ---------- HTTP helpers ----------
function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Correlation-Id'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 50 * 1024 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error('invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ---------- Endpoint handlers ----------

async function handleHealth(req, res) {
  const corrId = genCorrelationId();
  sendJson(res, 200, {
    status: 'online',
    version: '0.1.0',
    pbcDataDir: PBC_DATA_DIR,
    posture: REQUIRE_CONFIRM ? 'gloves-on' : 'ghost-pepper',
    shell: ACTIVE_SHELL,
    cwd: process.cwd(),
    home: os.homedir(),
    platform: os.platform(),
    correlationId: corrId
  });
  // Health checks are noisy; only log at correlation level on demand. For now skip noise.
}

async function handleFsRead(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const filePath = body.path;
    if (!filePath) {
      sendJson(res, 400, { error: 'path required', correlationId: corrId });
      logReq(corrId, 'POST', '/fs/read', 'no path', 'error');
      return;
    }
    const resolved = expandPath(filePath);
    const content = fs.readFileSync(resolved, 'utf-8');
    const stats = fs.statSync(resolved);
    sendJson(res, 200, {
      path: resolved,
      content,
      size: stats.size,
      modified: stats.mtime.toISOString(),
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/fs/read', `${resolved} (${stats.size}b)`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/fs/read', e.message, 'error');
  }
}

async function handleFsWrite(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const filePath = body.path;
    const content = body.content;
    if (!filePath || typeof content !== 'string') {
      sendJson(res, 400, { error: 'path and content required', correlationId: corrId });
      logReq(corrId, 'POST', '/fs/write', 'missing params', 'error');
      return;
    }
    const resolved = expandPath(filePath);
    const existed = fs.existsSync(resolved);
    const description = `write ${resolved} (${content.length}b, ${existed ? 'overwrite' : 'new'})`;
    if (existed) {
      const ok = await promptConfirm(description);
      if (!ok) {
        sendJson(res, 403, { error: 'denied by operator', correlationId: corrId });
        logReq(corrId, 'POST', '/fs/write', description, 'denied');
        return;
      }
    }
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf-8');
    sendJson(res, 200, {
      path: resolved,
      bytes: content.length,
      existed,
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/fs/write', description, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/fs/write', e.message, 'error');
  }
}

async function handleFsList(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const dirPath = body.path || '.';
    const resolved = expandPath(dirPath);
    const entries = fs.readdirSync(resolved, { withFileTypes: true }).map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'dir' : e.isFile() ? 'file' : 'other'
    }));
    sendJson(res, 200, { path: resolved, entries, correlationId: corrId });
    logReq(corrId, 'POST', '/fs/list', `${resolved} (${entries.length} entries)`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/fs/list', e.message, 'error');
  }
}

async function handleFsDelete(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const filePath = body.path;
    if (!filePath) {
      sendJson(res, 400, { error: 'path required', correlationId: corrId });
      logReq(corrId, 'POST', '/fs/delete', 'no path', 'error');
      return;
    }
    const resolved = expandPath(filePath);
    const description = `DELETE ${resolved}`;
    const ok = await promptConfirm(description);
    if (!ok) {
      sendJson(res, 403, { error: 'denied by operator', correlationId: corrId });
      logReq(corrId, 'POST', '/fs/delete', description, 'denied');
      return;
    }
    const stats = fs.statSync(resolved);
    if (stats.isDirectory()) {
      fs.rmSync(resolved, { recursive: true, force: true });
    } else {
      fs.unlinkSync(resolved);
    }
    sendJson(res, 200, { path: resolved, deleted: true, correlationId: corrId });
    logReq(corrId, 'POST', '/fs/delete', description, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/fs/delete', e.message, 'error');
  }
}

function execOptions(cwd) {
  const opts = {
    cwd: expandPath(cwd || process.cwd()),
    maxBuffer: 10 * 1024 * 1024,
    timeout: 60000
  };
  if (ACTIVE_SHELL === 'pwsh') opts.shell = 'pwsh.exe';
  else if (ACTIVE_SHELL === 'cmd') opts.shell = 'cmd.exe';
  else if (ACTIVE_SHELL === 'bash') opts.shell = '/bin/bash';
  return opts;
}

async function handleShellExec(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    let command = body.command;
    const cwd = body.cwd;
    if (!command) {
      sendJson(res, 400, { error: 'command required', correlationId: corrId });
      logReq(corrId, 'POST', '/shell/exec', 'no command', 'error');
      return;
    }

    // v1.1 fix: expand ~ in the command itself (cmd.exe doesn't do it)
    const expandedCommand = expandTildeInCommand(command);
    const destructive = isDestructive(expandedCommand);
    if (destructive) {
      const ok = await promptConfirm(`SHELL (destructive): ${expandedCommand}`);
      if (!ok) {
        sendJson(res, 403, { error: 'denied by operator', correlationId: corrId });
        logReq(corrId, 'POST', '/shell/exec', expandedCommand, 'denied');
        return;
      }
    } else if (REQUIRE_CONFIRM) {
      const ok = await promptConfirm(`SHELL: ${expandedCommand}`);
      if (!ok) {
        sendJson(res, 403, { error: 'denied by operator', correlationId: corrId });
        logReq(corrId, 'POST', '/shell/exec', expandedCommand, 'denied');
        return;
      }
    }
    exec(expandedCommand, execOptions(cwd), (err, stdout, stderr) => {
      const exitCode = err ? (err.code || 1) : 0;
      sendJson(res, 200, {
        command: expandedCommand,
        cwd: execOptions(cwd).cwd,
        exitCode,
        stdout: stdout || '',
        stderr: stderr || '',
        error: err ? err.message : null,
        correlationId: corrId
      });
      logReq(corrId, 'POST', '/shell/exec', `${expandedCommand} (exit ${exitCode})`, exitCode === 0 ? 'ok' : 'error');
    });
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/shell/exec', e.message, 'error');
  }
}

// ---------- Identity Manager (v3/v4 work signatures) ----------
// Identity is backed by Ed25519 keypairs. work_hash = SHA256(raw file bytes), lowercase hex.
//
// v4 (current): signs a portable, self-describing message — schema, work_hash, signer,
// public_key — no machine-local paths in the signed bytes. signed_message is persisted
// in the artifact so strangers can verify offline without ghost-pepper source.
// v3 (legacy): absolute work_file path was in the signed message; still validated.

const WORK_SIGNATURE_SCHEMA_V3 = 'continuum-work-signature-v3';
const WORK_SIGNATURE_SCHEMA_V4 = 'continuum-work-signature-v4';
const SIGNED_MESSAGE_ENCODING = 'utf-8';

function hashFileBytes(resolvedPath) {
  const buf = fs.readFileSync(resolvedPath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function buildWorkSignaturePayloadV3(workFile, workHash, signerName, publicKeyBase64) {
  return [
    WORK_SIGNATURE_SCHEMA_V3,
    workFile,
    workHash,
    signerName,
    publicKeyBase64
  ].join('\n');
}

function buildWorkSignaturePayloadV4(workHash, signerName, publicKeyBase64) {
  return [
    WORK_SIGNATURE_SCHEMA_V4,
    workHash,
    signerName,
    publicKeyBase64
  ].join('\n');
}

function resolveSignaturePayload(signature) {
  if (!signature || typeof signature !== 'object') return null;
  const workHash = signature.work_hash;
  const signer = signature.signer || 'UNKNOWN_SIGNER';
  const publicKey = signature.public_key;
  if (!workHash || !publicKey) return null;

  if (signature.schema === WORK_SIGNATURE_SCHEMA_V4) {
    const expected = buildWorkSignaturePayloadV4(workHash, signer, publicKey);
    const payload = typeof signature.signed_message === 'string'
      ? signature.signed_message
      : expected;
    return { payload, expected, encoding: signature.signed_message_encoding || SIGNED_MESSAGE_ENCODING };
  }
  if (signature.schema === WORK_SIGNATURE_SCHEMA_V3) {
    const workFile = signature.work_file;
    if (!workFile) return null;
    const expected = buildWorkSignaturePayloadV3(workFile, workHash, signer, publicKey);
    return { payload: expected, expected, encoding: SIGNED_MESSAGE_ENCODING };
  }
  return null;
}

function verifyWorkSignature(signature) {
  const resolved = resolveSignaturePayload(signature);
  if (!resolved || !signature.signature_base64 || !signature.public_key) {
    return { sigMatches: false, messageMatches: false };
  }
  const messageMatches = resolved.payload === resolved.expected;
  try {
    const publicKeyObj = crypto.createPublicKey({
      key: Buffer.from(signature.public_key, 'base64'),
      format: 'der',
      type: 'spki'
    });
    const sigMatches = crypto.verify(
      null,
      Buffer.from(resolved.payload, resolved.encoding),
      publicKeyObj,
      Buffer.from(signature.signature_base64, 'base64')
    );
    return { sigMatches, messageMatches };
  } catch {
    return { sigMatches: false, messageMatches };
  }
}

// POST /identity/get-public-key
// Input:  { keyPath }
// Output: { path, publicKeyBase64 }
// Reads an Ed25519 private key file and exports the corresponding public key.
async function handleIdentityGetPublicKey(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const keyPath = body.keyPath;
    if (!keyPath) {
      sendJson(res, 400, { error: 'keyPath required', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/get-public-key', 'no keyPath', 'error');
      return;
    }
    const resolved = expandPath(keyPath);
    if (!fs.existsSync(resolved)) {
      sendJson(res, 404, { error: 'key not found: ' + resolved, correlationId: corrId });
      logReq(corrId, 'POST', '/identity/get-public-key', 'not found', 'error');
      return;
    }
    const privateKey = crypto.createPrivateKey(fs.readFileSync(resolved));
    const publicKey = crypto.createPublicKey(privateKey);
    const pubBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
    
    sendJson(res, 200, {
      path: resolved,
      publicKeyBase64: pubBase64,
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/identity/get-public-key', `Derived public key for ${resolved}`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/identity/get-public-key', e.message, 'error');
  }
}

// POST /identity/sign-work
// Input:  { workPath, signerName, keyPath, signaturePath? }
// Output: { signaturePath, signature: {...} }
// Hashes the REAL work file and writes a separate signature file binding that
// work hash to the signer's public key using an Ed25519 signature.
async function handleIdentitySignWork(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const workPath = body.workPath;
    const signerName = body.signerName || 'UNKNOWN_SIGNER';
    const keyPath = body.keyPath;

    if (!workPath) {
      sendJson(res, 400, { error: 'workPath required', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'no workPath', 'error');
      return;
    }
    if (!keyPath) {
      sendJson(res, 400, { error: 'keyPath required (enroll the agent first)', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'no keyPath', 'error');
      return;
    }
    const resolvedWork = expandPath(workPath);
    const resolvedKey = expandPath(keyPath);
    
    if (!fs.existsSync(resolvedWork)) {
      sendJson(res, 404, { error: 'work file not found: ' + resolvedWork, correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'work not found', 'error');
      return;
    }
    if (fs.statSync(resolvedWork).isDirectory()) {
      sendJson(res, 400, { error: 'workPath is a directory, not a file', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'work is dir', 'error');
      return;
    }
    if (!fs.existsSync(resolvedKey)) {
      sendJson(res, 404, { error: 'private key not found: ' + resolvedKey, correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'key not found', 'error');
      return;
    }

    const workHash = hashFileBytes(resolvedWork);
    const privateKey = crypto.createPrivateKey(fs.readFileSync(resolvedKey));
    const publicKey = crypto.createPublicKey(privateKey);
    const pubBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
    
    const signedMessage = buildWorkSignaturePayloadV4(workHash, signerName, pubBase64);
    const signatureBytes = crypto.sign(null, Buffer.from(signedMessage, SIGNED_MESSAGE_ENCODING), privateKey);

    const signature = {
      schema: WORK_SIGNATURE_SCHEMA_V4,
      work_file: resolvedWork,
      work_hash: workHash,
      signer: signerName,
      public_key: pubBase64,
      signature_alg: 'Ed25519',
      signature_base64: signatureBytes.toString('base64'),
      signed_at: new Date().toISOString(),
      signed_message: signedMessage,
      signed_message_encoding: SIGNED_MESSAGE_ENCODING
    };

    // Default signature path sits next to the work file: <work>.sig.json
    const signaturePath = body.signaturePath
      ? expandPath(body.signaturePath)
      : resolvedWork + '.sig.json';

    const sigContent = JSON.stringify(signature, null, 2);
    fs.mkdirSync(path.dirname(signaturePath), { recursive: true });
    fs.writeFileSync(signaturePath, sigContent, 'utf-8');

    sendJson(res, 200, {
      signaturePath,
      signature,
      bytesWritten: sigContent.length,
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/identity/sign-work', `${signerName} signed ${resolvedWork}`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/identity/sign-work', e.message, 'error');
  }
}

// POST /identity/validate-work
// Input:  { signaturePath }
// Output: { valid, workMatches, sigMatches, work_file, ... }
// Re-hashes the work file the signature points at and verifies the Ed25519 signature.
async function handleIdentityValidateWork(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const signaturePath = body.signaturePath;
    if (!signaturePath) {
      sendJson(res, 400, { error: 'signaturePath required', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/validate-work', 'no signaturePath', 'error');
      return;
    }
    const resolvedSig = expandPath(signaturePath);
    if (!fs.existsSync(resolvedSig)) {
      sendJson(res, 404, { error: 'signature file not found: ' + resolvedSig, correlationId: corrId });
      logReq(corrId, 'POST', '/identity/validate-work', 'sig not found', 'error');
      return;
    }

    let signature;
    try {
      signature = JSON.parse(fs.readFileSync(resolvedSig, 'utf-8'));
    } catch (e) {
      sendJson(res, 400, { error: 'signature file is not valid JSON: ' + e.message, correlationId: corrId });
      logReq(corrId, 'POST', '/identity/validate-work', 'bad sig json', 'error');
      return;
    }

    const workFile = signature.work_file;
    const recordedHash = signature.work_hash;
    if (!workFile || !recordedHash) {
      sendJson(res, 400, { error: 'signature missing work_file or work_hash', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/validate-work', 'sig incomplete', 'error');
      return;
    }

    const resolvedWork = expandPath(workFile);
    if (!fs.existsSync(resolvedWork)) {
      sendJson(res, 200, {
        valid: false,
        workMatches: false,
        reason: 'work file referenced by signature no longer exists: ' + resolvedWork,
        signer: signature.signer || null,
        public_key: signature.public_key || null,
        correlationId: corrId
      });
      logReq(corrId, 'POST', '/identity/validate-work', 'work file gone', 'ok');
      return;
    }

    const currentHash = hashFileBytes(resolvedWork);
    const workMatches = currentHash === recordedHash;
    
    const { sigMatches, messageMatches } = verifyWorkSignature(signature);
    const valid = workMatches && sigMatches && (
      signature.schema !== WORK_SIGNATURE_SCHEMA_V4 || messageMatches
    );

    sendJson(res, 200, {
      valid,
      workMatches,
      sigMatches,
      messageMatches,
      schema: signature.schema || null,
      work_file: resolvedWork,
      recorded_hash: recordedHash,
      current_hash: currentHash,
      signer: signature.signer || null,
      public_key: signature.public_key || null,
      signature_alg: signature.signature_alg || null,
      signed_at: signature.signed_at || null,
      signed_message: signature.signed_message || null,
      note: valid
        ? 'Work file is unchanged since signing and Ed25519 signature is cryptographically valid. Check public_key against Keeper to confirm authorship.'
        : !workMatches
          ? 'WORK FILE HAS CHANGED since it was signed. The signature is invalid.'
          : signature.schema === WORK_SIGNATURE_SCHEMA_V4 && !messageMatches
            ? 'signed_message does not match the v4 convention reconstructed from work_hash, signer, and public_key.'
            : 'SIGNATURE DOES NOT VERIFY against the declared signed message.',
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/identity/validate-work', `${resolvedWork} ${valid ? 'MATCH' : 'CHANGED'}`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/identity/validate-work', e.message, 'error');
  }
}

// ---------- PBC data plane ----------
async function handlePbcPaths(req, res) {
  const corrId = genCorrelationId();
  ensurePbcDirs();
  sendJson(res, 200, { paths: pbcPaths(), correlationId: corrId });
}

function readTruthroot() {
  const p = ensurePbcDirs();
  return JSON.parse(fs.readFileSync(p.truthroot, 'utf-8'));
}

function writeTruthroot(doc) {
  const p = ensurePbcDirs();
  fs.writeFileSync(p.truthroot, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
}

function generateEd25519Keypair(agentId) {
  const p = ensurePbcDirs();
  const keyDir = path.join(p.keys, agentId);
  fs.mkdirSync(keyDir, { recursive: true });
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const pubDer = publicKey.export({ type: 'spki', format: 'der' });
  const keyPath = path.join(keyDir, 'private-key.pem');
  fs.writeFileSync(keyPath, privPem, { encoding: 'utf-8', mode: 0o600 });
  return { keyPath, publicKeyBase64: pubDer.toString('base64') };
}

async function handlePbcEnroll(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const agentId = (body.agent_id || '').trim();
    const displayName = (body.display_name || agentId || 'Unnamed synth').trim();
    const synthType = body.synth_type === 'worker' ? 'worker' : 'companion';
    if (!agentId || !/^[a-z0-9][a-z0-9-]{0,31}$/.test(agentId)) {
      sendJson(res, 400, { error: 'agent_id required (lowercase a-z0-9, max 32)', correlationId: corrId });
      return;
    }
    const doc = readTruthroot();
    if ((doc.agents || []).some((a) => a.agent_id === agentId)) {
      sendJson(res, 409, { error: 'agent_id already enrolled', correlationId: corrId });
      return;
    }
    let keyPath = body.key_path ? expandPath(body.key_path) : null;
    let publicKeyBase64 = body.public_key || null;
    if (!keyPath) {
      const generated = generateEd25519Keypair(agentId);
      keyPath = generated.keyPath;
      publicKeyBase64 = generated.publicKeyBase64;
    } else if (!publicKeyBase64) {
      const privateKey = crypto.createPrivateKey(fs.readFileSync(keyPath));
      const publicKey = crypto.createPublicKey(privateKey);
      publicKeyBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
    }
    const entry = {
      agent_id: agentId,
      display_name: displayName,
      synth_type: synthType,
      public_key: publicKeyBase64,
      key_path: keyPath,
      enrolled_at: new Date().toISOString()
    };
    doc.agents = doc.agents || [];
    doc.agents.push(entry);
    writeTruthroot(doc);
    sendJson(res, 200, { enrolled: entry, correlationId: corrId });
    logReq(corrId, 'POST', '/pbc/enroll', `${synthType} ${agentId}`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/pbc/enroll', e.message, 'error');
  }
}

async function handlePbcInitDemo(req, res) {
  const corrId = genCorrelationId();
  try {
    const p = ensurePbcDirs();
    const doc = readTruthroot();
    if ((doc.agents || []).length > 0) {
      sendJson(res, 200, { initialized: false, reason: 'truthroot already has agents', paths: p, correlationId: corrId });
      return;
    }
    const generated = generateEd25519Keypair('demo-worker');
    const worker = {
      agent_id: 'demo-worker',
      display_name: 'Demo Worker',
      synth_type: 'worker',
      public_key: generated.publicKeyBase64,
      key_path: generated.keyPath,
      enrolled_at: new Date().toISOString()
    };
    doc.agents = [worker];
    writeTruthroot(doc);
    const job = {
      job_id: 'demo-hello',
      assigned_to: worker.public_key,
      instruction: 'Write a one-line hello work product, sign it, and retire this job to done/.',
      work_body: 'HELLO FROM {{AGENT}} AT {{UTC}}\n',
      work_path: 'inbox/done/hello-demo-worker.txt',
      grace: {
        goal: 'grid.curtailment.demo',
        note: 'Simulated curtailment fixture — no real MW'
      }
    };
    fs.writeFileSync(path.join(p.inboxOpen, 'demo-hello.json'), JSON.stringify(job, null, 2) + '\n', 'utf-8');
    sendJson(res, 200, { initialized: true, worker, job_id: job.job_id, paths: p, correlationId: corrId });
    logReq(corrId, 'POST', '/pbc/init-demo', 'demo-worker + demo-hello', 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/pbc/init-demo', e.message, 'error');
  }
}

// ---------- Router ----------
const ROUTES = {
  'GET /health': handleHealth,
  'GET /pbc/paths': handlePbcPaths,
  'POST /pbc/enroll': handlePbcEnroll,
  'POST /pbc/init-demo': handlePbcInitDemo,
  'POST /fs/read': handleFsRead,
  'POST /fs/write': handleFsWrite,
  'POST /fs/list': handleFsList,
  'POST /fs/delete': handleFsDelete,
  'POST /shell/exec': handleShellExec,
  'POST /identity/get-public-key': handleIdentityGetPublicKey,
  'POST /identity/sign-work': handleIdentitySignWork,
  'POST /identity/validate-work': handleIdentityValidateWork
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Correlation-Id'
    });
    res.end();
    return;
  }

  const key = `${req.method} ${req.url.split('?')[0]}`;
  const handler = ROUTES[key];
  if (!handler) {
    const corrId = genCorrelationId();
    sendJson(res, 404, { error: 'not found', available: Object.keys(ROUTES), correlationId: corrId });
    logReq(corrId, req.method, req.url, 'unknown route', 'error');
    return;
  }
  handler(req, res);
});

server.listen(PORT, BIND_HOST, () => {
  ensurePbcDirs();
  banner();
  console.log(`${C.green}  ready.${C.reset}`);
  console.log('');
});

process.on('SIGINT', () => {
  console.log('');
  console.log(`${C.dim}  shutting down.${C.reset}`);
  process.exit(0);
});
