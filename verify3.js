const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('data/abs_database.e2e.json');
const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : null;
const hash = db?.users?.[0]?.passwordHash;

const results = {
  dbExists: !!db,
  storedHash: hash,
  matchesDocPassword: hash ? bcrypt.compareSync('AdminPassword@2026!', hash) : null,
  matchesAdmin123456: hash ? bcrypt.compareSync('admin123456', hash) : null,
  freshHashMatchesDocPassword: bcrypt.compareSync('AdminPassword@2026!', bcrypt.hashSync('AdminPassword@2026!', 10)),
};
console.log(JSON.stringify(results, null, 1));