const fs = require('fs');
const path = require('path');

const envFile = path.join(process.cwd(), '.env.local');
const env = {};
for (const line of fs.readFileSync(envFile, 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=][^=]*)=\s*(.*)\s*$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const tables = [
  'packages', 'services', 'products', 'product_categories', 'product_brands',
  'product_images', 'faqs', 'site_settings', 'profiles', 'audit_logs',
  'contact_submissions', 'orders', 'shop_products', 'users', 'sessions',
];

async function main() {
  for (const t of tables) {
    try {
      const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (r.status === 200) {
        console.log(`${t}: EXISTS (200)`);
      } else {
        console.log(`${t}: status ${r.status}`);
      }
    } catch (e) {
      console.log(`${t}: error ${e.message}`);
    }
  }
}
main();