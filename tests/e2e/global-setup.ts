import fs from 'node:fs';

const E2E_DB = require('node:path').resolve(__dirname, '../../data/abs_database.e2e.json');

export default function globalSetup() {
  if (fs.existsSync(E2E_DB)) {
    fs.unlinkSync(E2E_DB);
  }
}