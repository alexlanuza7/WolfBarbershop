#!/usr/bin/env node
'use strict';

const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawnSync } = require('child_process');
const { resolveSupabaseBin, runSupabaseCommand, repoRoot } = require('./supabase-cli');

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
  };
}

function parseDotEnv(content) {
  const entries = {};
  String(content || '')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const separator = trimmed.indexOf('=');
      if (separator === -1) {
        return;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      entries[key] = value;
    });

  return entries;
}

function readEnvFile() {
  const envPath = path.join(repoRoot, '.env');
  if (!fs.existsSync(envPath)) {
    return {
      exists: false,
      path: envPath,
      values: {},
    };
  }

  return {
    exists: true,
    path: envPath,
    values: parseDotEnv(fs.readFileSync(envPath, 'utf8')),
  };
}

function readSupabasePorts() {
  const configPath = path.join(repoRoot, 'supabase', 'config.toml');
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const content = fs.readFileSync(configPath, 'utf8');
  const readPort = (section, fallback) => {
    const escapedSection = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\[${escapedSection}\\][\\s\\S]*?port\\s*=\\s*(\\d+)`);
    const match = content.match(pattern);
    return match ? Number.parseInt(match[1], 10) : fallback;
  };

  return {
    configPath,
    apiPort: readPort('api', 54321),
    dbPort: readPort('db', 54322),
    studioPort: readPort('studio', 54323),
    inbucketPort: readPort('inbucket', 54324),
  };
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    shell: false,
    timeout: options.timeoutMs || 15000,
  });

  return {
    status: typeof result.status === 'number' ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || (result.error ? String(result.error.message || result.error) : ''),
  };
}

function compactText(value, maxLength = 300) {
  const text = String(value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function assessEnv() {
  const envFile = readEnvFile();
  if (!envFile.exists) {
    return {
      id: 'env-file',
      status: 'fail',
      summary: '.env is missing',
      detail: `Create ${envFile.path} from .env.example before starting the app.`,
    };
  }

  const url = envFile.values.EXPO_PUBLIC_SUPABASE_URL || '';
  const anonKey = envFile.values.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  const placeholderKey = anonKey.includes('replace-with');

  if (!url || !anonKey || placeholderKey) {
    return {
      id: 'env-values',
      status: 'fail',
      summary: 'Supabase env values are incomplete',
      detail: 'Set EXPO_PUBLIC_SUPABASE_URL and a real EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.',
    };
  }

  const hostWarning = !url.includes('127.0.0.1') && !url.includes('localhost');
  return {
    id: 'env-values',
    status: hostWarning ? 'warn' : 'pass',
    summary: 'Supabase env values look usable',
    detail: hostWarning
      ? `Current URL is ${url}. Local development normally targets localhost/127.0.0.1.`
      : `Using ${url}.`,
  };
}

function assessSupabaseConfig() {
  const ports = readSupabasePorts();
  if (!ports) {
    return {
      id: 'supabase-config',
      status: 'fail',
      summary: 'supabase/config.toml is missing',
      detail: 'Run Supabase init or restore the tracked config file.',
    };
  }

  return {
    id: 'supabase-config',
    status: 'pass',
    summary: 'Supabase local config found',
    detail: `api=${ports.apiPort} db=${ports.dbPort} studio=${ports.studioPort} inbucket=${ports.inbucketPort}`,
  };
}

function assessSupabaseCli() {
  const bin = resolveSupabaseBin();
  const result = runSupabaseCommand(['--version'], {
    timeoutMs: 15000,
  });

  if (result.status !== 0) {
    return {
      id: 'supabase-cli',
      status: 'fail',
      summary: 'Supabase CLI is not usable',
      detail: compactText(result.stderr || result.stdout) || `Expected binary at ${bin}`,
    };
  }

  return {
    id: 'supabase-cli',
    status: 'pass',
    summary: 'Supabase CLI is available',
    detail: `${bin} (${compactText(result.stdout) || 'version detected'})`,
  };
}

function assessDocker() {
  const result = runCommand('docker', ['info', '--format', '{{.ServerVersion}}'], {
    timeoutMs: 15000,
  });

  if (result.status !== 0) {
    return {
      id: 'docker-access',
      status: 'fail',
      summary: 'Docker API is not accessible',
      detail: compactText(result.stderr || result.stdout) || 'Docker Desktop may be stopped or the current shell cannot access the Docker pipe.',
    };
  }

  return {
    id: 'docker-access',
    status: 'pass',
    summary: 'Docker API is accessible',
    detail: `Server version ${compactText(result.stdout)}`,
  };
}

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (status) => {
      socket.destroy();
      resolve(status);
    };

    socket.setTimeout(1000);
    socket.once('connect', () => done('open'));
    socket.once('timeout', () => done('closed'));
    socket.once('error', () => done('closed'));
  });
}

async function assessPorts() {
  const ports = readSupabasePorts();
  if (!ports) {
    return {
      id: 'supabase-ports',
      status: 'warn',
      summary: 'Port audit skipped',
      detail: 'No Supabase config was available.',
    };
  }

  const states = await Promise.all([
    ['api', ports.apiPort],
    ['db', ports.dbPort],
    ['studio', ports.studioPort],
    ['inbucket', ports.inbucketPort],
  ].map(async ([label, port]) => `${label}=${port}:${await checkPort('127.0.0.1', port)}`));

  const openCount = states.filter((entry) => entry.endsWith(':open')).length;
  return {
    id: 'supabase-ports',
    status: openCount > 0 ? 'warn' : 'pass',
    summary: openCount > 0 ? 'Some Supabase local ports are already open' : 'Supabase local ports look free',
    detail: states.join(' | '),
  };
}

function assessSupabaseStatus(dockerCheck) {
  if (dockerCheck.status !== 'pass') {
    return {
      id: 'supabase-status',
      status: 'warn',
      summary: 'Supabase status skipped',
      detail: 'Docker is not accessible, so the local stack status cannot be inspected safely.',
    };
  }

  const result = runSupabaseCommand(['status'], {
    timeoutMs: 20000,
  });

  if (result.status !== 0) {
    return {
      id: 'supabase-status',
      status: 'warn',
      summary: 'Supabase local stack does not appear to be running',
      detail: compactText(result.stderr || result.stdout) || 'Run npm run db:start to start the local stack.',
    };
  }

  return {
    id: 'supabase-status',
    status: 'pass',
    summary: 'Supabase local stack is reachable',
    detail: compactText(result.stdout),
  };
}

async function buildDoctorReport() {
  const checks = [];
  checks.push(assessEnv());
  checks.push(assessSupabaseConfig());
  checks.push(assessSupabaseCli());
  const dockerCheck = assessDocker();
  checks.push(dockerCheck);
  checks.push(await assessPorts());
  checks.push(assessSupabaseStatus(dockerCheck));

  const summary = {
    passCount: checks.filter((check) => check.status === 'pass').length,
    warnCount: checks.filter((check) => check.status === 'warn').length,
    failCount: checks.filter((check) => check.status === 'fail').length,
  };

  return {
    generatedAt: new Date().toISOString(),
    repoRoot,
    checks,
    summary,
    ok: summary.failCount === 0,
  };
}

function printTextReport(report) {
  console.log('Wolf Barbershop doctor');
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Root: ${report.repoRoot}`);
  console.log('');

  for (const check of report.checks) {
    console.log(`- ${check.id}: ${check.status}`);
    console.log(`  ${check.summary}`);
    if (check.detail) {
      console.log(`  detail: ${check.detail}`);
    }
  }

  console.log('');
  console.log(
    `Summary: pass=${report.summary.passCount} warn=${report.summary.warnCount} fail=${report.summary.failCount}`,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = await buildDoctorReport();

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printTextReport(report);
  }

  if (!report.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Doctor failed: ${error.message}`);
  process.exit(1);
});
