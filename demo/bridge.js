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
 * god-terminal bridge.js
 * v1.3.3 - 2026-05-16
 * AFT: AI-generated-user-reviewed-pending
 *
 * Localhost HTTP server that gives god-terminal HTML client access to
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
  console.log(`${C.bold}${C.blue}  GOD TERMINAL // BRIDGE${C.reset} ${C.dim}v1.3.3${C.reset}`);
  console.log(`${C.dim}  ============================${C.reset}`);
  console.log(`${C.dim}  Bind:${C.reset}     ${C.cyan}http://${BIND_HOST}:${PORT}${C.reset}`);
  console.log(`${C.dim}  Posture:${C.reset}  ${REQUIRE_CONFIRM ? C.yellow + 'GLOVES ON (require-confirm)' : C.red + 'GHOST PEPPER (full access)'}${C.reset}`);
  console.log(`${C.dim}  Shell:${C.reset}    ${C.cyan}${ACTIVE_SHELL}${C.reset}`);
  console.log(`${C.dim}  Platform:${C.reset} ${process.platform}`);
  console.log(`${C.dim}  CWD:${C.reset}      ${process.cwd()}`);
  console.log(`${C.dim}  Home:${C.reset}     ${os.homedir()}`);
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
    version: '1.3.3',
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

    // --- NATIVE COMMAND INTERCEPTION (ECR-WG / C-DAWG) ---
    const trimmedCmd = command.trim();
    if (trimmedCmd === '?_') {
      const rituals = fs.readFileSync(expandPath('rituals/man_rituals.py'), 'utf-8');
      sendJson(res, 200, {
        command: '?_',
        stdout: `---[ CONTINUUM RITUALS // HELP ]---\n\n${rituals}\n`,
        exitCode: 0,
        correlationId: corrId
      });
      logReq(corrId, 'POST', '/shell/exec', 'INTERCEPT: ?_ (HELP)', 'ok');
      return;
    }
    if (trimmedCmd === '/_') {
      const glossary = fs.readFileSync(expandPath('GLOSSARY.md'), 'utf-8');
      sendJson(res, 200, {
        command: '/_',
        stdout: `---[ CONTINUUM GLOSSARY // REHYDRATION ]---\n\n${glossary}\n`,
        exitCode: 0,
        correlationId: corrId
      });
      logReq(corrId, 'POST', '/shell/exec', 'INTERCEPT: /_ (GLOSSARY)', 'ok');
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

// ---------- Identity Manager (v2) ----------
// Replaces the v1.3.2 identity section. Design: docs/identity-manager-v2-spec.md
//
// Principles enforced here:
//  - Identity is a FILE the agent authored, not bridge process metadata.
//  - Hashing is deterministic: SHA256 of raw file bytes, no timestamps, no pid.
//  - The bridge computes hashes on request. It never decides identity.
//  - A signature binds two real hashes (work file + signer identity file).
//  - Nothing hashes itself: the signature file is separate from the work.

// Deterministic SHA256 of a file's raw bytes.
function hashFileBytes(resolvedPath) {
  const buf = fs.readFileSync(resolvedPath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const HMAC_SECRET_RELATIVE_PATH = 'continuum-local/identity/hmac_secret.key';

function readHmacSecret(createIfMissing) {
  const secretPath = expandPath(HMAC_SECRET_RELATIVE_PATH);
  if (fs.existsSync(secretPath)) {
    const secret = fs.readFileSync(secretPath, 'utf-8').trim();
    if (secret) return secret;
  }
  if (!createIfMissing) return null;

  fs.mkdirSync(path.dirname(secretPath), { recursive: true });
  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretPath, secret + '\n', { encoding: 'utf-8', mode: 0o600 });
  return secret;
}

function buildWorkSignaturePayload(workFile, workHash, signerName, signerIdentityHash) {
  return [
    'continuum-work-signature-v2',
    workFile,
    workHash,
    signerName,
    signerIdentityHash
  ].join('\n');
}

function hmacSha256Hex(payload, createIfMissing) {
  const secret = readHmacSecret(createIfMissing);
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqualHex(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a), 'hex');
  const right = Buffer.from(String(b), 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

// POST /identity/hash-file
// Input:  { path }
// Output: { path, hash, size }
// The deterministic fingerprint primitive. Same file in, same hash out, always.
async function handleIdentityHashFile(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const filePath = body.path;
    if (!filePath) {
      sendJson(res, 400, { error: 'path required', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/hash-file', 'no path', 'error');
      return;
    }
    const resolved = expandPath(filePath);
    if (!fs.existsSync(resolved)) {
      sendJson(res, 404, { error: 'file not found: ' + resolved, correlationId: corrId });
      logReq(corrId, 'POST', '/identity/hash-file', 'not found', 'error');
      return;
    }
    const stats = fs.statSync(resolved);
    if (stats.isDirectory()) {
      sendJson(res, 400, { error: 'path is a directory, not a file', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/hash-file', 'is dir', 'error');
      return;
    }
    const hash = hashFileBytes(resolved);
    sendJson(res, 200, {
      path: resolved,
      hash,
      size: stats.size,
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/identity/hash-file', `${resolved} -> ${hash.substring(0, 16)}...`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/identity/hash-file', e.message, 'error');
  }
}

// POST /identity/sign-work
// Input:  { workPath, signerName, signerIdentityHash, signaturePath? }
// Output: { signaturePath, signature: {...} }
// Hashes the REAL work file and writes a separate signature file binding that
// work hash to the signer's identity hash. The signature file never contains
// its own hash. The timestamp records when signing happened; it never feeds
// the work hash, so the work hash stays deterministic.
async function handleIdentitySignWork(req, res) {
  const corrId = genCorrelationId();
  try {
    const body = await readBody(req);
    const workPath = body.workPath;
    const signerName = body.signerName || 'UNKNOWN_SIGNER';
    const signerIdentityHash = body.signerIdentityHash;

    if (!workPath) {
      sendJson(res, 400, { error: 'workPath required', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'no workPath', 'error');
      return;
    }
    if (!signerIdentityHash) {
      sendJson(res, 400, { error: 'signerIdentityHash required (enroll the agent first)', correlationId: corrId });
      logReq(corrId, 'POST', '/identity/sign-work', 'no signerIdentityHash', 'error');
      return;
    }
    const resolvedWork = expandPath(workPath);
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

    const workHash = hashFileBytes(resolvedWork);
    const signaturePayload = buildWorkSignaturePayload(resolvedWork, workHash, signerName, signerIdentityHash);
    const signature = {
      schema: 'continuum-work-signature-v2',
      work_file: resolvedWork,
      work_hash: workHash,
      signer: signerName,
      signer_identity_hash: signerIdentityHash,
      signature_alg: 'HMAC-SHA256',
      signature_hmac: hmacSha256Hex(signaturePayload, true),
      signed_at: new Date().toISOString()
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
// Output: { valid, workMatches, recorded_hash, current_hash, signer, ... }
// Re-hashes the work file the signature points at and reports whether it still
// matches. The bridge does NOT check the identity hash against Keeper; Keeper is
// off-machine and operator-held. The bridge reports the claimed signer identity
// hash so the operator can check it against Keeper themselves.
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
        signer_identity_hash: signature.signer_identity_hash || null,
        correlationId: corrId
      });
      logReq(corrId, 'POST', '/identity/validate-work', 'work file gone', 'ok');
      return;
    }

    const currentHash = hashFileBytes(resolvedWork);
    const workMatches = currentHash === recordedHash;
    let hmacMatches = null;
    if (signature.signature_hmac) {
      const signaturePayload = buildWorkSignaturePayload(
        workFile,
        recordedHash,
        signature.signer || 'UNKNOWN_SIGNER',
        signature.signer_identity_hash || ''
      );
      hmacMatches = safeEqualHex(signature.signature_hmac, hmacSha256Hex(signaturePayload, false));
    }
    const valid = workMatches && hmacMatches !== false;

    sendJson(res, 200, {
      valid,
      workMatches,
      hmacMatches,
      work_file: resolvedWork,
      recorded_hash: recordedHash,
      current_hash: currentHash,
      signer: signature.signer || null,
      signer_identity_hash: signature.signer_identity_hash || null,
      signature_alg: signature.signature_alg || null,
      signed_at: signature.signed_at || null,
      note: valid
        ? 'Work file is unchanged since signing and local HMAC verification did not fail. Check signer_identity_hash against Keeper to confirm authorship.'
        : 'WORK FILE OR SIGNATURE HAS CHANGED since it was signed. The signature no longer covers the current file.',
      correlationId: corrId
    });
    logReq(corrId, 'POST', '/identity/validate-work', `${resolvedWork} ${valid ? 'MATCH' : 'CHANGED'}`, 'ok');
  } catch (e) {
    sendJson(res, 500, { error: e.message, correlationId: corrId });
    logReq(corrId, 'POST', '/identity/validate-work', e.message, 'error');
  }
}

// ---------- Router ----------
const ROUTES = {
  'GET /health': handleHealth,
  'POST /fs/read': handleFsRead,
  'POST /fs/write': handleFsWrite,
  'POST /fs/list': handleFsList,
  'POST /fs/delete': handleFsDelete,
  'POST /shell/exec': handleShellExec,
  'POST /identity/hash-file': handleIdentityHashFile,
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
  banner();
  console.log(`${C.green}  ready.${C.reset}`);
  console.log('');
});

process.on('SIGINT', () => {
  console.log('');
  console.log(`${C.dim}  shutting down.${C.reset}`);
  process.exit(0);
});
