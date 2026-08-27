const BASE = 'http://localhost:3011';

async function main() {
  const loginHtml = await (await fetch(BASE + '/admin/login')).text();
  const am = loginHtml.match(/\$ACTION_[a-f0-9]+/g);
  const actionId = am ? [...new Set(am)][0] : null;
  console.log('ACTION_ID=' + actionId);
  if (!actionId) { console.log('ACTION_NOT_FOUND'); return; }

  const body = new URLSearchParams();
  body.append(actionId, '');
  body.append('email', 'admin@absnetwork.pk');
  body.append('password', 'AdminPassword@2026!');

  const resp = await fetch(BASE + '/admin/login', {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const sc = resp.headers.get('set-cookie');
  console.log('ACTION_STATUS=' + resp.status);
  console.log('SET_COOKIE=' + sc);
  const token = sc ? sc.split(';')[0].split('=')[1] : null;
  if (!token) { console.log('NO_TOKEN'); return; }

  const dash = await fetch(BASE + '/admin/dashboard', {
    redirect: 'manual',
    headers: { Cookie: 'abs_admin_session_token=' + token },
  });
  console.log('DASH_STATUS=' + dash.status);
  console.log('DASH_LOC=' + dash.headers.get('location') || '');
}
main();