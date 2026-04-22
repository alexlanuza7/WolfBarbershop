#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

function resolveSupabaseBin() {
  const candidates = [
    path.join(repoRoot, '.local', 'bin', process.platform === 'win32' ? 'supabase.exe' : 'supabase'),
    path.join(repoRoot, '.local', 'bin', 'supabase.exe'),
    path.join(repoRoot, '.local', 'bin', 'supabase'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return process.platform === 'win32' ? 'supabase.exe' : 'supabase';
}

function runSupabaseCommand(args, options = {}) {
  const bin = options.bin || resolveSupabaseBin();
  const result = spawnSync(bin, args, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
    shell: false,
    timeout: options.timeoutMs || 120000,
  });

  return {
    bin,
    status: typeof result.status === 'number' ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || (result.error ? String(result.error.message || result.error) : ''),
    error: result.error || null,
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/supabase-cli.js <args...>');
    process.exit(1);
  }

  const result = runSupabaseCommand(args, {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to run Supabase CLI (${result.bin}): ${result.stderr || result.error.message}`);
  }

  process.exit(result.status);
}

if (require.main === module) {
  main();
}

module.exports = {
  repoRoot,
  resolveSupabaseBin,
  runSupabaseCommand,
};
