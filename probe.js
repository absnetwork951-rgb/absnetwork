const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dd = p.devDependencies || {};
const dbHead = fs
  .readFileSync('lib/db/index.ts', 'utf8')
  .split('\n')
  .slice(0, 70)
  .join('\n');
const out =
  'vitest=' + (dd.vitest || 'NA') +
  '\nplaywright=' + (dd['@playwright/test'] || 'NA') +
  '\nscripts=' + JSON.stringify(p.scripts) +
  '\n\n=== lib/db/index.ts head ===\n' + dbHead;
fs.writeFileSync('probe.txt', out);