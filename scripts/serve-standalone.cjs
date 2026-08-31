const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = process.cwd();
const envFile = path.join(root, '.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

// The standalone server starts with process.cwd() === .next/standalone, so the
// on-disk JSON DB would otherwise land inside the build output. Pin ABS_DB_PATH
// to the real project DB (unless the caller already chose one, e.g. e2e).
if (!('ABS_DB_PATH' in process.env)) {
  process.env.ABS_DB_PATH = path.join(root, 'data', 'abs_database.json');
}

const serverPath = path.join(root, '.next', 'standalone', 'server.js');
const args = process.argv.slice(2);
const child = spawn(process.execPath, [serverPath, ...args], {
  stdio: 'inherit',
  env: process.env,
});
child.on('exit', (code) => process.exit(code ?? 0));
