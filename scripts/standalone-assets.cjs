/* Copies .next/static and public/ into .next/standalone so the
   standalone server.js can serve assets (Next 15 + output: standalone). */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcStatic = path.join(root, '.next', 'static');
const dstStatic = path.join(root, '.next', 'standalone', '.next', 'static');
const srcPublic = path.join(root, 'public');
const dstPublic = path.join(root, '.next', 'standalone', 'public');

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.error(`standalone-assets: missing ${src}`);
    process.exit(1);
  }
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, { recursive: true });
}

copyDir(srcStatic, dstStatic);
copyDir(srcPublic, dstPublic);
console.log('standalone-assets: staged static + public into .next/standalone');