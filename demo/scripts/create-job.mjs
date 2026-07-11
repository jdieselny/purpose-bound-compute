#!/usr/bin/env node
/**
 * Create an inbox job for an enrolled synth (worker preferred).
 *
 *   node demo/scripts/create-job.mjs --assign demo-worker --instruction "Write hello and sign it"
 *   node demo/scripts/create-job.mjs --list-agents
 *
 * Bridge must be running: node demo/shared/bridge/bridge.js
 */
const BRIDGE = process.env.PBC_BRIDGE_URL || 'http://127.0.0.1:7878';

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  return process.argv[i + 1] ?? fallback;
}

function has(flag) {
  return process.argv.includes(flag);
}

async function main() {
  if (has('--help') || has('-h')) {
    console.log(`Usage:
  node demo/scripts/create-job.mjs --assign <agent_id> --instruction "..."
  node demo/scripts/create-job.mjs --list-agents
  node demo/scripts/create-job.mjs --list-jobs

Options:
  --assign, -a       agent_id or public_key (required to create)
  --instruction, -i  job instruction text
  --job-id           optional slug
  --work-body        template (supports {{AGENT}} {{AGENT_ID}} {{JOB_ID}} {{UTC}})
  --work-path        relative path under .pbc-data
  --allow-companion  allow assigning a companion
  --bridge           bridge base URL (default ${BRIDGE})
`);
    process.exit(0);
  }

  const bridge = arg('--bridge', BRIDGE);

  if (has('--list-agents')) {
    const res = await fetch(bridge + '/pbc/agents');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    for (const a of data.agents || []) {
      console.log(
        `${a.agent_id.padEnd(16)} ${(a.synth_type || '').padEnd(10)} ${(a.display_name || '').padEnd(20)} ${String(a.public_key || '').slice(0, 24)}…`
      );
    }
    console.log(`(${data.count || 0} enrolled)`);
    return;
  }

  if (has('--list-jobs')) {
    const res = await fetch(bridge + '/pbc/jobs?status=open');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    for (const j of data.jobs || []) {
      console.log(`${j.job_id.padEnd(24)} → ${(j.assign_to_agent_id || j.assigned_to || '').toString().slice(0, 32)}`);
      console.log(`  ${j.instruction}`);
    }
    console.log(`(${data.count || 0} open)`);
    return;
  }

  const assign = arg('--assign') || arg('-a');
  const instruction = arg('--instruction') || arg('-i');
  if (!assign) {
    console.error('error: --assign <agent_id> required (or --list-agents)');
    process.exit(1);
  }

  const body = {
    assign_to: assign,
    instruction: instruction || undefined,
    job_id: arg('--job-id') || undefined,
    work_body: arg('--work-body') || undefined,
    work_path: arg('--work-path') || undefined,
    allow_companion: has('--allow-companion')
  };

  const res = await fetch(bridge + '/pbc/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('error:', data.error || res.status);
    process.exit(1);
  }
  console.log('created:', data.job.job_id);
  console.log('assignee:', data.assignee.agent_id, `(${data.assignee.synth_type})`);
  console.log('path:', data.path);
  console.log('instruction:', data.job.instruction);
}

main().catch((e) => {
  console.error('failed:', e.message);
  console.error('Is the bridge running?  node demo/shared/bridge/bridge.js');
  process.exit(1);
});
