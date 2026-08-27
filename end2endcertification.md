# End-to-End Production Certification Specification
## ABS Network Broadband SMCVP Pvt Ltd — Next.js 15 ISP Platform

- **Document type:** Executable, evidence-based Release Certification master plan
- **Derived from:** `audit.md` (baseline) + full authoritative source inspection (this run)
- **Date:** 2026-08-27
- **Scope:** Public site + Admin panel + JSON-file datastore + deployment readiness. **This document is the plan — no source, DB, UI, or Supabase changes are executed by it.**

---

## 1. Certification Philosophy & Conventions

### 1.1 Guiding Rules
1. **Source code is authoritative.** `audit.md` is baseline context only. Every check below cites the exact file/function to verify.
2. **Never mark CERTIFIED from source inspection alone.** CERTIFIED requires: (a) implementation exists, (b) verification was executed (command/step recorded), (c) expected result observed, (d) no contradictory evidence.
3. **PASS ≠ CERTIFIED.** PASS means a single check observed the expected result. CERTIFIED requires the full evidence chain (above).
4. **Every finding in audit.md maps to ≥1 check** (see §4 Findings Import Matrix). No finding is dropped.
5. **No fabrication of business data.** The certification never "certifies" false claims; it certifies claims only against real evidence.

### 1.2 Conventions
- All terminal commands are run from project root (Windows PowerShell 5.1). `where` clauses in commands are for Linux/CI parity docs.
- `EVIDENCE` is a mandatory artifact (log excerpt, screenshot, script output) saved with the check.
- Redaction: passwords/secrets recorded as `[REDACTED]`.
- Statuses: `NOT_STARTED`, `IN_PROGRESS`, `PASS`, `FAIL`, `BLOCKED`, `NOT_APPLICABLE`, `CERTIFIED`.

### 1.3 Status Semantics (binding)
| Status | Meaning |
|--------|---------|
| NOT_STARTED | Not yet executed |
| IN_PROGRESS | Execution begun, evidence incomplete |
| PASS | Expectation observed for the single run |
| FAIL | Expectation not observed |
| BLOCKED | Cannot execute (missing tool/data/permission) |
| NOT_APPLICABLE | Requirement does not apply to this project |
| CERTIFIED | Full evidence chain complete (impl + run + observed + no contradiction) |

---

## 2. Test Environment Standard (binding baseline for all E2E runs)

| Param | Value |
|-------|-------|
| Node | ≥ 20 (lock files `package-lock.json`; `bun.lock` present but unused) |
| Runtime | `next start` production build OR `node .next/standalone/server.js` (canonical for this project: **standalone server.js**) |
| Browser | Chromium (Playwright), plus Firefox + WebKit for cross-browser matrix |
| Viewports | 375×667, 768×1024, 1280×800, 1920×1080 |
| Network throttling | 4G slow (150ms RTT, 1.6Mbps down, 750Kbps up) for CWV checks |
| Golden DB | Snapshot of `data/abs_database.json` copied to `data/abs_database.json.certification.bak` before each destructive run; restored after |
| Secrets | Test admin: seed user `admin@absnetwork.pk` / `AdminPassword@2026!` (used ONLY in this doc + local test env) |

**CRITICAL runtime note (from source):** `lib/db/index.ts:18-19` resolves the DB at `path.join(process.cwd(), 'data', 'abs_database.json')`. Under `output: 'standalone'`, `process.cwd()` at runtime is the standalone folder, so **`data/` must be present/mounted next to the standalone server**. Every runtime test must confirm the DB file is found and seeded before asserting data-dependent behavior.

---

## 3. Certification Categories & Checks

Legend: **SEV** — CRITICAL (blocks release), HIGH, MEDIUM, LOW, INFO. `.evidence artifact` = what to save.

### 01 — Project Integrity
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-01-01 | HIGH | `data/abs_database.json` is the single live datastore, present at the documented path | `Test-Path data\abs_database.json`; `Select-String -Path lib\db\index.ts -Pattern "DB_FILE"` | File exists; code points to `data/abs_database.json` | File missing → restore backup or re-seed; fix stale path | Path output | NOT_STARTED |
| CHK-01-02 | HIGH | No stray duplicate DB files (root `abs_database.json`) | `Get-ChildItem -Recurse -Filter abs_database.json -Exclude node_modules | Where-Object FullName -notmatch 'node_modules'` | Exactly one DB file in `data/` | Remove accidental duplicates; only `data/abs_database.json` may be live | File list | NOT_STARTED |
| CHK-01-03 | MEDIUM | Build artifacts (`tsconfig.tsbuildinfo`) not tracked; `data/` DB excluded from VCS when repo is initialized | Inspect `.gitignore`; `git check-ignore data/abs_database.json tsconfig.tsbuildinfo` (once repo exists) | Both ignored | Add `data/abs_database.json*` and `*.tsbuildinfo` to `.gitignore` | `.gitignore` diff | NOT_STARTED |
| CHK-01-04 | LOW | Package identity matches product | `node -e "console.log(require('./package.json').name)"` | Expected: contains `abs-network` or company name OR documented as intentional | Rename `name` (currently `ai-studio-applet` → CONFIG-003) | Output | NOT_STARTED |

### 02 — Build & Compilation
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-02-01 | CRITICAL | Production build succeeds | `npm run build` (record full log) | Exit 0; "Compiled successfully"; all 17 pages listed (8 static ○, 9 dynamic ƒ) | Non-zero → fix compile blockers; **build is a hard gate** | `build.log` | PASS (2026-08-27, 33.5s) |
| CHK-02-02 | HIGH | Build completes without experimental warnings beyond declared experiment | Inspect build banner | Only `optimizePackageImports` flagged | Remove other experimental flags | `build.log` | NOT_STARTED |
| CHK-02-03 | HIGH | No hydrate/runtime errors on load | Serve prod build; open all 4 public + 4 admin pages in Playwright; collect `console` events (level error) | 0 errors | Investigate each console error; fix; re-run | `console.log` capture | NOT_STARTED |
| CHK-02-04 | MEDIUM | `npm run clean` available and `.next/` regenerable | `npm run clean; npm run build` | Regenerates identical route set | n/a | `build.log` | N.A./NOT_STARTED |

### 03 — TypeScript
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-03-01 | CRITICAL | Strict TS compiles clean | `npx tsc --noEmit` | Exit 0; no output | Fix all type errors; do not weaken `tsconfig.json` `strict` | `tsc.log` | PASS (2026-08-27) |
| CHK-03-02 | MEDIUM | Strictness remains enabled in CI | Inspect `tsconfig.json`: `"strict": true`, `"ignoreBuildErrors": false` in `next.config.ts` | Both true | Re-enable if flipped | file excerpt | PASS (source) |
| CHK-03-03 | LOW | No unchecked any leaking (types.ts only uses `Record<string, any>` for audit details) | `npx eslint .`; grep `: any` in `lib/` excluding `types.ts` | Only documented exceptions | Replace `any` with typed shapes | grep output | NOT_STARTED |

### 04 — ESLint & Code Quality
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-04-01 | HIGH | Full-project ESLint clean | `npx eslint .` | Exit 0; 0 errors/warnings | Fix violations; enforce in CI | `eslint.log` | PASS (2026-08-27) |
| CHK-04-02 | HIGH | Lint is enforced in the release pipeline (counter PERF-001: `eslint.ignoreDuringBuilds: true`) | Add CI step `lint` before `build`; or flip `ignoreDuringBuilds` to `false` | Lint gates the build | **PERF-001 fix:** enable lint gating; CI runs `npx eslint .` | CI config | NOT_STARTED |
| CHK-04-03 | MEDIUM | No `console.log`/`TODO`/`FIXME` in `app/` & `components/` (grep verified clean; exceptions: `console.error` in `public-forms.ts` catch blocks = intentional) | `rg "console\.(log|warn)|TODO|FIXME|HACK" app components` | 0 matches (allow `console.error` in catch) | Remove or convert; add eslint rule `no-console` warnings | grep output | PASS (source) |
| CHK-04-04 | LOW | Single canonical ESLint config | Inspect `eslint.config.mjs` + legacy `.eslintrc.json` | Active = flat config; legacy file inert (CONFIG-002) | **CONFIG-002 fix:** delete `.eslintrc.json` | file list | NOT_STARTED |

### 05 — Dependency Hygiene
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-05-01 | MEDIUM | Unused deps removed (CONFIG-003) | `npx depcheck` OR manual grep for `@google/genai`, `react-hook-form`, `@hookform/resolvers`, `firebase` in all TS/TSX | `@google/genai`, `@hookform/resolvers`, `firebase-tools` unreferenced → remove | **CONFIG-003 fix:** remove the three unused packages; keep `motion`, `lucide-react`, `zod`, `bcryptjs` | package.json diff | NOT_STARTED |
| CHK-05-02 | HIGH | Single lockfile | `Get-ChildItem -Force *.lock*, *lock*.json` | Only `package-lock.json` (or only `bun.lock`), not both | **CONFIG-003 fix:** delete `bun.lock` (npm is canonical) or vice-versa; reinstall | lock file list | NOT_STARTED |
| CHK-05-03 | HIGH | No known-vulnerable direct deps | `npm audit` (production only: `npm audit --omit=dev`) | 0 critical; note high/med with advisories | Remediate or document accepted-risk with advisory IDs | `audit.json` | NOT_STARTED |
| CHK-05-04 | MEDIUM | No duplicate/mismatched React-dom versions | `npm ls react react-dom next` | React & react-dom identical; next single | Dedupe via `npm dedupe` | `npm ls` output | NOT_STARTED |

### 06 — Environment Configuration
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-06-01 | HIGH | Runtime consumes only declared env (grep shows only `NODE_ENV` used; `.env.example` lists `GEMINI_API_KEY`, `APP_URL`, `ADMIN_JWT_SECRET`) | `rg "process\.env" lib app components next.config.ts` | Only `NODE_ENV` used in code | **CONFIG-001 fix:** either implement real env vars or prune `.env.example` to what code consumes | grep output | PASS (source) |
| CHK-06-02 | HIGH | No real secrets committed; `.env*` gitignored except example | `git status` on `.env*`; inspect `.gitignore` line 6-7 | `.env.local` never tracked; `.env.example` tracked | **SEC-005 fix:** rotate anything leaked; keep `.env*` ignored | git status | PASS (source) |
| CHK-06-03 | MEDIUM | Production cookie flips to `secure: true` automatically | Verified in `lib/auth/session.ts:140` | Code uses `process.env.NODE_ENV === 'production'` | n/a | excerpt | PASS (source) |
| CHK-06-04 | MEDIUM | Start ignores missing optional env | `node .next/standalone/server.js` with NO env set | Boots; admin login works (no env required today) | If boot requires env → document required vars | boot log | NOT_STARTED |

### 07 — Database Integrity
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-07-01 | CRITICAL | JSON parses as valid schema | `node -e "require('fs').readFileSync('data/abs_database.json')"` + JSON.parse via script | Parses; has all 10 keys (settings, users, sessions, packages, services, shopProducts, contactSubmissions, shopOrders, auditLogs, securityEvents) | Corrupt file → restore backup | validation script output | PASS (2026-08-27) |
| CHK-07-02 | CRITICAL | Row counts sane & match dashboard (live: 5 users, 6 packages, 6 services, 0 products, 3 submissions, 2 orders) | Script count each array; compare to `/admin/dashboard` after login | Counts equal page counters | Investigate divergence (DATA-001) | counts JSON | PASS (2026-08-27: live counts) |
| CHK-07-03 | HIGH | Every record has non-empty `id`; references resolve (session.userId→user; order.productId→product OR null; submission status valid) | Node validation script checking schema invariants | 0 dangling refs, valid enums | Fix data; add DB-validation test | validator output | NOT_STARTED |
| CHK-07-04 | HIGH | Settings object present with all typed fields (`lib/db/types.ts:204-231`) | Node script comparing settings keys | All 24 fields present & typed | Re-seed/repair settings | schema diff | PASS (2026-08-27) |

### 08 — Data Migration
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-08-01 | HIGH | Solar→Shop migration (`lib/db/index.ts:47-61`) idempotent & non-destructive | Craft temp DB with `solarProducts`+`solarOrders`; boot app; assert merged AND old keys removed on re-load | Migration merges once, no duplicates, no data loss | **Fix:** make migration idempotent with a no-op second pass | temp-DB test log | NOT_STARTED |
| CHK-08-02 | MEDIUM | Migration preserves unknown keys (forward compatibility) | Test DB with an extra key `futureFeature` | Key survives read/write | Do not strip unknown top-level keys | test log | NOT_STARTED |
| CHK-08-03 | MEDIUM | Migration does not run every boot unnecessarily (cache short-circuit) | Add temporary instrumentation or read `saveDatabase` call count | Cache hit → no re-migration | Ensure `getDatabase()` returns cached when fresh | instrumentation log | NOT_STARTED |

### 09 — Seed Data
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-09-01 | HIGH | Fresh-seed parity with seed.ts | Move `data/abs_database.json` aside; boot; assert seed matches `lib/db/seed.ts` output (6 pkgs, 6 services, 5 users incl. SUPER_ADMIN) | Parity | Sync seed.ts vs live (live currently diverges on `statsShopProductCount`: live=8, seed=0 → DATA-003) | seed diff log | FAIL (live vs seed diverged) |
| CHK-09-02 | HIGH | Seed passwords are bcrypt `$2b$` hashes, never plaintext | Node script reading `users[].passwordHash` | All start `$2b$` | Re-hash any non-bcrypt | hash audit log | PASS (2026-08-27) |
| CHK-09-03 | HIGH | Default seed credential rotation policy (SEC-005) | Document + implement: first-login must change `AdminPassword@2026!` | Policy implemented & verified | **SEC-005 fix:** force password change on first login or remove known default pre-prod | policy doc | NOT_STARTED |
| CHK-09-04 | MEDIUM | Seed statsShopProductCount consistent with actual seed products | Compare seed `settings.statsShopProductCount` vs seeded `shopProducts.length` | Equal | **DATA-003 fix (A or B):** add products matching claim, or set stat from live count | comparison output | FAIL (0 products, stat=8 live) |

### 10 — Authentication
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-10-01 | CRITICAL | Valid login succeeds, session created, user returned with `passwordHash: ''` | Playwright: `POST` via UI `/admin/login` with seed admin; assert redirect & cookie | success + `abs_admin_session_token` cookie set | Investigate auth chain (`authenticateAdmin`) | auth-test log | NOT_STARTED |
| CHK-10-02 | CRITICAL | Invalid email & invalid password → generic `"Invalid email or password."` (no enumeration) | Playwright: wrong password; nonexistent email | Same message both cases (session.ts:116,129) | If messages differ → fix (AUTH/enumeration gate) | log + screenshot | NOT_STARTED |
| CHK-10-03 | HIGH | Inactive user cannot log in; message generic | Set `isActive=false` on temp user; attempt login | Generic error; security event `LOGIN_FAILED` | Ensure `isActive` check precedes password verify (session.ts:107) | log | NOT_STARTED |
| CHK-10-04 | HIGH | Empty/min input rejected by Zod before bcrypt work (`LoginSchema`: email + min 6) | Programmatic: `loginAction` with bad inputs | Returns validation message, no DB write | Fix zod schema if server accepts | unit log | NOT_STARTED |
| CHK-10-05 | HIGH | Server action is CSRF-safe | Verify Next server-action Origin/Host double-submit (framework) + cookie `SameSite=Lax` | 307/425 protection present (framework) | Add explicit origin check if deploying behind multiple proxies | curl headers | PASS (framework, unverified runtime) |

### 11 — Session Security (tracks SEC-001)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-11-01 | **CRITICAL** | Session tokens use CSPRNG (SEC-001) | Inspect `lib/db/index.ts:892`: currently `Math.random()`. After fix assert `crypto.randomBytes(32).toString('hex')` or `crypto.randomUUID()` present; observe ≥2 tokens unique & format-length correct | Token length ≥ 64 hex / 36 uuid; no `Math.random` in token code | **SEC-001 fix:** replace with `crypto.randomBytes(32)` / `randomUUID()`; add unit test asserting entropy | token sample + code excerpt | FAIL (Math.random present) |
| CHK-11-02 | CRITICAL | Cookie flags: httpOnly, Secure (prod), SameSite=Lax, Path=/, 7d maxAge | Runtime: read `Set-Cookie` on login (prod), lightspeed checks (session.ts:138-144) | All flags present | Fix cookie.set options | header capture | PASS (source) |
| CHK-11-03 | HIGH | Session expiry enforced client-chain: `getSession` rejects expired (db index.ts:920-923); cookie also expires | Manipulate DB session `expiresAt` to past; request `/admin/dashboard` | 307 → login; session revoked | Fix expiry check | runtime log | NOT_STARTED |
| CHK-11-04 | HIGH | Logout invalidates server-side session (revoke + cookie delete) | Login → `logoutAction` → assert cookie cleared & `db.sessions` no longer contains token | Session removed; `LOGOUT` security event logged | Verify `revokeSession` (db index.ts:934) | log | NOT_STARTED |
| CHK-11-05 | HIGH | Disabled user's sessions invalidated on access | Set user `isActive=false`; use existing token → `getSession` (db index.ts:925-929) | 307 → login; session auto-revoked | Verify both checks | log | NOT_STARTED |
| CHK-11-06 | HIGH | Session fixation: token regenerated at login; old token rejected | Login twice with same creds → two distinct tokens; old token after re-login → rejected | Tokens differ; old token invalidated | **Fix:** revoke previous session on login or rotate | log | NOT_STARTED |
| CHK-11-07 | MEDIUM | Session ID not leaked in URLs/logs | grep `sess_` in rendered HTML + server logs | Never in client output | Strip token from logs | grep output | NOT_STARTED |

### 12 — Password Security
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-12-01 | CRITICAL | bcrypt cost ≥ 10 used for create & reset | Inspect `hashPassword` (session.ts:18-20, cost 10); admin-users action hash on create/reset | cost=10 everywhere | Raise/keep 10 | excerpt | PASS (source) |
| CHK-12-02 | HIGH | Reset path: SUPER_ADMIN cannot reset (users action line 139); min 8 chars | Playwright/unit: create `ADMIN`, reset password; attempt reset SUPER_ADMIN | ADMIN resets ok; SUPER_ADMIN reset blocked | Verify guard logic | log | NOT_STARTED |
| CHK-12-03 | HIGH | Password length & strength rules enforced server-side (Zod `min(8)`) regardless of UI | Programmatic submit `< 8` chars | Rejected by zod | Align UI validation | unit log | NOT_STARTED |
| CHK-12-04 | MEDIUM | Hash never serialized to client (every read strips `passwordHash`: session.ts:163, db index.ts:736 etc.) | Grep getAdminUsers usage in pages/components for raw hash; runtime capture of `/admin/users` JSON | No `$2b$` in responses | Strip at all read paths | response capture | NOT_STARTED |

### 13 — Rate Limiting
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-13-01 | HIGH | 5 failures → 15-min lockout keyed email+IP (session.ts:40-85) | Script 6 sequential bad logins → 6th returns "Too many login attempts… wait…" | Lock message; RATE_LIMITED security event | Verify counter reset after window | test log | NOT_STARTED |
| CHK-13-02 | HIGH | Successful login resets counter (resetRateLimit) | Fail 2× → succeed → fail again → not immediately locked (within 5 total) | Reset works | Fix reset call | log | NOT_STARTED |
| CHK-13-03 | **HIGH** | Rate limit effective in multi-instance deployment (SEC-002: in-memory Map resets per process/restart) | Document + gate: single-replica OR externalize limiter (DB/Redis) before multi-instance | Documented strategy accepted by release board | **SEC-002 fix:** move limiter to shared store when >1 replica; always set `NODE_ENV=production` | design note | NOT_STARTED |
| CHK-13-04 | MEDIUM | Public forms not spammable (SEC-006) | Honeypot/captcha check on `submitContactForm`/`submitShopInquiry` | **Fix (SEC-006):** add honeypot field or turnstile; add per-IP quota on submissions | None today | design note | NOT_STARTED |

### 14 — RBAC (matrix in §7)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-14-01 | CRITICAL | Every permission in matrix enforced server-side (not UI-only) | For each of 9 permissions, execute the matching server action with a role lacking it | Action returns unauthorized/denied, no mutation | **AUTH-001 rework:** add centralized `requirePermission(role, perm)` guard to every action | per-role test log | BLOCKED (no central helper yet) |
| CHK-14-02 | HIGH | `canManageRole` hierarchy: ADMIN cannot create/disable SUPER_ADMIN; SUPER_ADMIN can all | Unit test `canManageRole` combos (rbac.ts:63-68) | Matrix exact | Fix logic if violated | unit log | NOT_STARTED |
| CHK-14-03 | HIGH | SECURITY_AUDITOR = read-only (view_security, view_activity_logs only) | Playwright: audit-logs page OK; packages page → Access Denied; any create action → denied, no DB write | Denied on all mutations | Fix | log | NOT_STARTED |
| CHK-14-04 | MEDIUM | UI visibility matches permissions (sidebar conditional `p(...)`) | Render sidebar per role; assert menu items subset | Menu == permission set | Sync menu & perms | screenshots | NOT_STARTED |

### 15 — Authorization (server-side authoritative)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-15-01 | **CRITICAL** | Every admin page guards with `getCurrentSession()` + `hasPermission` (verified pattern: packages/shop/services/orders/submissions/users/settings/audit-logs pages all lines 11-14) | Grep each admin page; runtime login as role lacking permission → Access Denied panel | Guard present on all 8 data pages | **AUTH-001 fix:** add missing guards; centralize | grep + runtime log | PASS (source: guards present) |
| CHK-15-02 | **HIGH** | Access-denied returns 403 semantics (AUTH-003) instead of 200-denied-panel | `curl -I -b session /admin/packages` as SUPPORT_AGENT | 403 | **AUTH-003 fix:** return 403/404 (`notFound()`) for forbidden | curl output | FAIL (200 today) |
| CHK-15-03 | HIGH | Direct server-action invocation without session cannot mutate | Programmatic: call e.g. `createPackage` without cookie | Denied; no DB change | Guards on actions | action unit log | NOT_STARTED |
| CHK-15-04 | HIGH | IDOR: admin edits/removes only entities it may touch | Attempt edit/delete of another tenant/user, wrong role, forged `id` | Rejected | Add ownership/scope checks | log | NOT_STARTED |

### 16 — Admin Route Protection
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-16-01 | CRITICAL | All 10 admin data routes redirect unauthenticated → `/admin/login` (307) | Runtime curl matrix (this audit observed: dashboard, audit-logs, submissions, settings, solar, users, shop, orders, packages, services all → 307; login → 200) | 307 w/ `Location: /admin/login` | Fix missing guards | probe log | PASS (2026-08-27) |
| CHK-16-02 | HIGH | Direct URL to any admin page as wrong-role user returns denial (not data) | Playwright each admin page × 6 roles | No page renders data for forbidden role | Apply CHK-15-02 fix + guards | matrix log | NOT_STARTED |
| CHK-16-03 | MEDIUM | `/admin` root handles gracefully | `curl -s -o NUL -w "%{http_code} %{redirect_url}" http://localhost:PORT/admin` | Non-500 (307/404/200) intentional | Route/handle | probe | NOT_STARTED |

### 17 — Admin Navigation (tracks NAV-001, NAV-002, NAV-003)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-17-01 | **CRITICAL** | ZERO dead internal links (ZERO-DEAD-LINK gate) | Crawl all `<a href>` from sidebar + dashboard + manager pages; assert each resolves 200/307-canonical | 0 × 404 links | **NAV-001 fix:** sidebar `/admin/logs`→`/admin/audit-logs`; `/admin/contact-submissions`→`/admin/submissions`; `/admin/security`→create page or remove link. Dashboard line 235 `/admin/logs` & line 113/154 `/admin/contact-submissions` also fix. | crawl report | FAIL (5 dead links today) |
| CHK-17-02 | MEDIUM | Sidebar shows actor identity (NAV-002) | Inspect AdminSidebar.tsx:58 (renders `{role}`) | Shows name/email + role | **NAV-002 fix:** pass user name/email to sidebar | excerpt | FAIL (role only) |
| CHK-17-03 | MEDIUM | `/admin/services` reachable & consistent (NAV-003/DATA-002): decide link vs remove | Confirm each permission-linked page has a nav entry | Services linked (if feature stays) else removed | **Fix:** add to sidebar under SERVICES perm | excerpt | NOT_STARTED |

### 18 — Admin Dashboard
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-18-01 | HIGH | Dashboard counts equal DB truth | Login; compare cards (packages/shop/inquiries/orders) to `data/abs_database.json` counts | Match | Investigate divergence | screenshot + counts | NOT_STARTED |
| CHK-18-02 | HIGH | Dashboard links all resolve (see CHK-17-01: `/admin/logs`, `/admin/contact-submissions` are 404 today) | Same crawl | 0 dead | Per CHK-17-01 | crawl | FAIL |
| CHK-18-03 | MEDIUM | Recent lists (max 4) + audit stream (8) render with empty fallback | Check empty arrays render gracefully (no blank) | Empty-state text/placeholder | Add empty states (UX-002) | screenshots | NOT_STARTED |

### 19 — Admin CRUD (per module)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-19-01 | CRITICAL | Create flow: zod-validated & audited | Per module (section 20-27): submit valid form → row created + audit log + revalidate | DB entry + log entry | Verify `logAudit` invocation in each action | test logs | NOT_STARTED |
| CHK-19-02 | CRITICAL | Update flow idempotent, preserves unrelated fields, audit entry | Edit entity → mutate 1 field → assert no field drift | Targeted update | Use `updateX` merge semantics | logs | NOT_STARTED |
| CHK-19-03 | CRITICAL | Delete flow removes only target (slug/id scoped) & logs | Delete → assert gone; sibling intact; audit `DELETE` | Scope ok | Verify id lookup strict | logs | NOT_STARTED |
| CHK-19-04 | HIGH | Validation failure returns `{ success:false, error }` without DB mutation | Submit invalid payload per action | No write; error surfaced | Ensure `safeParse` before write | unit log | NOT_STARTED |
| CHK-19-05 | HIGH | `revalidatePath` refreshes list pages after mutation | After create in admin, re-fetch page shows entry | Updated UI | Add missing revalidate | log | NOT_STARTED |
| CHK-19-06 | MEDIUM | Duplicate slug/id creation rejected | Create same `slug` twice | 2nd rejected or unique-fied | Enforce uniqueness | log | NOT_STARTED |

### 20 — Admin Users
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-20-01 | CRITICAL | createAdminUser: role honored, hash stored, `canManageRole` enforced (index.ts:751; users action:45) | Create CONTENT_MANAGER as ADMIN; create SUPER_ADMIN as ADMIN → rejected | Balanced | Fix | log | NOT_STARTED |
| CHK-20-02 | HIGH | Update: role changes re-evaluated; disabled user locked immediately | Change role → re-login checks; disable → session revoked on next request | Locked | Verify `getSession` isActive | log | NOT_STARTED |
| CHK-20-03 | HIGH | Delete: cannot delete self / last SUPER_ADMIN | Attempt delete own account / sole SUPER_ADMIN | Blocked | Add guard | log | NOT_STARTED |
| CHK-20-04 | MEDIUM | Password reset blocked for SUPER_ADMIN (admin-users.ts:139) | Attempt | Blocked | n/a | log | NOT_STARTED |

### 21 — Admin Packages
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-21-01 | CRITICAL | Full CRUD on the 6 live packages with zod + audit (PackagesManagerClient ↔ admin-packages action) | Create/update/delete/toggle-active on pkg_fiber_* | Persist + revalidate + logs | Fix | log | NOT_STARTED |
| CHK-21-02 | HIGH | Inactive packages hidden from public `/packages` (`getPackages(true)`) | Toggle off → public page excludes | Hidden | Verify activeOnly filter | log | NOT_STARTED |
| CHK-21-03 | MEDIUM | PKR formatting consistent in admin editor | Inspect `pricePkr` display on create/edit | `toLocaleString()` used | Align | screenshot | PASS (source) |

### 22 — Admin Shop
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-22-01 | CRITICAL | Product CRUD incl. category/brand/model/price/stock/warranty/images array/specs | Create product with images; update; toggle active; delete | Persist + audit | Fix | log | NOT_STARTED |
| CHK-22-02 | **HIGH** | Shop catalog populated or claim corrected (DATA-003) | `getShopProducts()` count vs `settings.statsShopProductCount` vs homepage "8+ SHOP PRODUCTS" | All three equal ≥1 or claim removed | **DATA-003 fix (A/B):** add real products (A) or remove false claim (B). Never fabricate | counts + screenshot | FAIL (0 vs 8) |
| CHK-22-03 | HIGH | Stock statuses render accurately incl. `out_of_stock` not purchasable | Create out_of_stock → inquiry modal disabled/warned | Honest UX | Fix checkout gate | screenshots | NOT_STARTED |
| CHK-22-04 | HIGH | Product image handling via `next/image` with remote hosts (picsum/unsplash) | Verify `next.config.ts` remotePatterns; load product image — no unoptimized warnings | Uses IMG_OPT; dimensions ok | **Changing hosts requires config update; recommend hosting product images under app domain (SEC/storage)** | dev console | PASS (source) |

### 23 — Admin Services
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-23-01 | HIGH | Services CRUD functions (admin-services action; ServicesManagerClient) | CRUD 6 services | Works + audit | Fix | log | NOT_STARTED |
| CHK-23-02 | **HIGH** | Feature drift resolved (NAV-003/DATA-002): public services page removed, admin still manages orphaned data | Decide: (a) publish services publicly, or (b) remove admin services module; document | No orphaned admin feature | **Fix:** remove Services manager OR expose; update sidebar accordingly | decision note | NOT_STARTED |
| CHK-23-03 | MEDIUM | Dashboard services count meaningful | Post-decision review of dashboard card | Count consistent with decision | Update dashboard | screenshot | NOT_STARTED |

### 24 — Admin Orders
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-24-01 | CRITICAL | Order status workflow (11 statuses) with audit + assignment | Update order status sequentially; assignment to staff | Persist + logs | Fix | log | NOT_STARTED |
| CHK-24-02 | HIGH | Automatic order number generation unique (`createShopOrder`) | Create 2 orders | Unique `orderNumber` | Fix generator | log | NOT_STARTED |
| CHK-24-03 | HIGH | Order totals = Σ(price×qty) + optional quoted amount; PKR formatting | Create with items; verify `estimatedTotalPkr` | Correct math | Fix math | log | NOT_STARTED |

### 25 — Admin Contact Submissions
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-25-01 | CRITICAL | Submission lifecycle (new→in_review→contacted→resolved/spam/archived) with notes/assignment | Update status + add internal note | Persist + audit | Fix | log | NOT_STARTED |
| CHK-25-02 | HIGH | Public submissions appear here & produce audit trail | Submit contact form → list refresh | New record status `new` | Verify revalidate (public-forms.ts:48) | log | NOT_STARTED |
| CHK-25-03 | MEDIUM | PII (phone/email/IP) displayed only in admin, redacted/tamper-proof | Inspect public HTML for absence of submission data | Not in public payloads | Fix any leak | capture | NOT_STARTED |

### 26 — Admin Settings
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-26-01 | HIGH | Settings CRUD persists & revalidates public pages | Edit phone/heroHeadline; reload `/` | New values render | Fix `updateSiteSettings` merge | screenshot | NOT_STARTED |
| CHK-26-02 | HIGH | No HTML/JS injection from settings into pages | Inject `<script>`/`onerror` into a setting field | Rendered escaped (no execution) | Sanitize/render-safe | capture | NOT_STARTED |
| CHK-26-03 | MEDIUM | `statsShopProductCount` maintained as source of truth or derived (DATA-003/004) | After product changes, stat consistent | Derived count | Remove manual stat; compute from DB | counts | FAIL |

### 27 — Admin Audit Logs
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-27-01 | CRITICAL | Audit trail captures ALL mutations with actor, IP, entity, timestamp (`logAudit` at index.ts:98) | Perform each CRUD; open `/admin/audit-logs` | Entries include userEmail + ipAddress + details | Fix logAudit calls | log | NOT_STARTED |
| CHK-27-02 | HIGH | Page reachable via correct link (currently `/admin/logs` dead → fix to `/admin/audit-logs`) | NAV-001 recheck after fix | Link 200 | Per CHK-17-01 | crawl | FAIL |
| CHK-27-03 | MEDIUM | Logs limited (100) & ordered desc | Inspect `getAuditLogs(100)`; UI | Newest first | Fix ordering | log | NOT_STARTED |

### 28 — Security Events
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-28-01 | HIGH | Key event types fire: LOGIN_SUCCESS, LOGIN_FAILED, RATE_LIMITED, SESSION_REVOKED, LOGOUT (+ USER_CREATED etc. per actions) | Script login attempts incl. lockout, logout, disable-user | Each type present in `securityEvents` with severity | Add missing call sites | log | NOT_STARTED |
| CHK-28-02 | HIGH | Events include IP/payload without secrets | Inspect `logSecurityEvent` args | No tokens/passwords stored | Sanitize metadata | log | NOT_STARTED |
| CHK-28-03 | MEDIUM | Security events surfaced in a UI (audit-logs page shows audit; security dashboard missing) | `/admin/security` currently 404; decide: build security view or drop nav (NAV-001) | Decide + implement | Per CHK-17-01 | decision + output | NOT_STARTED |

### 29 — Public Homepage
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-29-01 | CRITICAL | Homepage renders 200 with hero, stats, packages section, shop CTA (observed 200 in audit) | Playwright load `/`; assert Hero (h1), 4 stat cards, packages grid ≥3, CTAs | Full render | Investigate missing sections | screenshot | PASS (2026-08-27) |
| CHK-29-02 | **HIGH** | Stat claims truthful: `statsShopProductCount`=="8+ Items" must equal live product count (DATA-003) | Compare rendered "SHOP PRODUCTS" stat vs DB | Equal | Per CHK-22-02 | screenshot + counts | FAIL (8 ≠ 0) |
| CHK-29-03 | MEDIUM | Homepage metadata present (title/description/OG/Twitter observed in HTML) | Inspect served `<head>` | All present | n/a | head capture | PASS (2026-08-27) |

### 30 — Public Packages
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-30-01 | CRITICAL | `/packages` renders active packages only with PKR prices | Playwright load; assert 6 names; prices `PKR x,xxx` | Match DB (active) | Fix filter | screenshot | NOT_STARTED |
| CHK-30-02 | HIGH | Category filter works client-side | Click Residential/Gaming/Business | Grid filters w/o reload | Fix PackagesClient state | screenshot | NOT_STARTED |
| CHK-30-03 | HIGH | CTA deep-links contact form pre-filled (`/contact?package=...&type=new_connection`) | Click "Get This Plan" → contact form shows package + type | Prefilled | Fix query wiring | capture | NOT_STARTED |
| CHK-30-04 | MEDIUM | Package card shows installation fee / unlimited data truthfully | Assert each card fields vs DB | Match, no FUP mislabel | Align copy (content gate) | screenshot | NOT_STARTED |

### 31 — Public Shop
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-31-01 | **HIGH** | Shop page renders with live products OR correct empty state (currently 0 products) | Load `/shop`; see grid/empty message | Coherent UX either way | **DATA-003 fix (A/B):** populate products or add professional empty state | screenshot | FAIL (0 products, no curated empty state) |
| CHK-31-02 | HIGH | Category filter + search work with 0+ products | Toggle categories | Filter changes grid | Fix ShopClient | log | NOT_STARTED |
| CHK-31-03 | HIGH | Product detail modal opens from card (ShopDetailModal) | Click card → modal with images/specs/pricing | Opens; images render | Fix | screenshot | NOT_STARTED |
| CHK-31-04 | HIGH | Compare modal supports comparing at least 2 products (ShopCompareModal) | Select 2+ → compare | Table renders | Fix | screenshot | NOT_STARTED |
| CHK-31-05 | MEDIUM | Inquiry modal prefills product & computes estimate (ShopInquiryModal) | Open inquiry → productName prefilled; qty math | Prefilled | Fix | capture | NOT_STARTED |

### 32 — Public Contact
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-32-01 | CRITICAL | `/contact` renders form + FAQ + helpline data | Playwright load | Form fields visible | Fix | screenshot | NOT_STARTED |
| CHK-32-02 | HIGH | Search-param presets (`type`, `subject`, `package`) honored | Load `?type=sales&subject=Enterprise` | Prefilled | Verify Suspense wrapper renders (useSearchParams needs it — present) | capture | NOT_STARTED |
| CHK-32-03 | HIGH | FAQ accordion interactive | Click each FAQ | Expands/collapses | Fix | capture | NOT_STARTED |

### 33 — Forms
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-33-01 | CRITICAL | Contact form client→server→DB→admin list full chain | Fill valid → submit → success panel; check `/admin/submissions` new record + audit | success + record | Fix submit path (ContactForm.tsx:35-56) | log | NOT_STARTED |
| CHK-33-02 | CRITICAL | Shop inquiry full chain with order number returned | Fill valid → submit → success w/ Reference #; check `/admin/orders` | orderNumber + record | Fix | log | NOT_STARTED |
| CHK-33-03 | HIGH | Login form focuses-first-error & shows rate-limit message | Trigger lockout; submit | Message visible | Fix | screenshot | NOT_STARTED |
| CHK-33-04 | HIGH | Contact/inquiry/package/shop/admin forms validated client & server (native `required` + zod) | Submit empty/invalid | No submission; inline messages | Verify both layers | capture | NOT_STARTED |

### 34 — Form Validation
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-34-01 | HIGH | Zod schemas match UI fields exactly (compare ContactSchema/ShopInquirySchema/LoginSchema vs form inputs) | Cross-audit field list incl. types | Identical | Fix drift | matrix | NOT_STARTED |
| CHK-34-02 | MEDIUM | Unicode/normalization (name with diacritics) & large-input limits enforced | Submit 10KB message, emoji name | Rejected or accepted consistently | Add length caps | unit log | NOT_STARTED |
| CHK-34-03 | MEDIUM | Numeric coercion safe (`z.coerce.number`) for quantity/estimates | Submit `quantity=0`/`NaN` | Rejected | Fix default/min | unit log | NOT_STARTED |

### 35 — Error Handling (tracks UX-002)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-35-01 | **HIGH** | `error.tsx` boundary per route group so a throw renders branded error not blank | Throw in a page (temp test) → observe | Branded error page, no white-screen | **UX-002 fix:** add `app/error.tsx` (+ admin) with reset | screenshot | FAIL (absent) |
| CHK-35-02 | MEDIUM | `global-error.tsx` for top-level crashes | Simulate | Present | Add | screenshot | NOT_STARTED |
| CHK-35-03 | MEDIUM | Server-action errors surface as messages (they return `{success,error}`) | Force DB failure via read-only data dir → submit | Message shown, form intact | Preserve input on error | capture | NOT_STARTED |

### 36 — Loading States
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-36-01 | MEDIUM | `loading.tsx` for immediate feedback on navigations (UX-002) | Throttle network, navigate | Skeleton/spinner, no FOUC | Add route-level loading.tsx | screenshots | NOT_STARTED |
| CHK-36-02 | HIGH | Form submit buttons disable + show spinner (present: ContactForm, login, modals) | Submit & inspect button state | Disabled + spinner | Fix any non-disabling submit | capture | PASS (source) |

### 37 — 404 Handling
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-37-01 | MEDIUM | Custom `not-found.tsx` branded (UX-002) | Visit `/nonexistent` | Branded 404 (default Next now; observed default HTML) | **UX-002 fix:** add `app/not-found.tsx` | screenshot | FAIL (default) |
| CHK-37-02 | MEDIUM | Known-removed paths behave intentionally: `/services` → 404 (removed product), `/solar-packages` → 307 | curl `/services`, `/solar-packages` | 404 and 307 respectively | Keep documented | probe | PASS (2026-08-27: 404 & 307) |

### 38 — Legacy Redirects
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-38-01 | HIGH | `/solar-packages` → 307 `/shop` (observed) | curl incl. follow | 307 + final 200 | Fix if drifted | probe | PASS |
| CHK-38-02 | HIGH | Admin legacy `/admin/solar` → `/admin/shop` guard flow (307→login→shop) | unauthenticated + authenticated | Both correct | Fix | probe | PASS (unauth observed) |
| CHK-38-03 | MEDIUM | Redirect standard (301 for permanent SEO value) | Decide permanence | Document 301|307 decision | Update | note | NOT_STARTED |

### 39 — Legacy Solar Compatibility
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-39-01 | MEDIUM | No user-facing "Solar" copy remains; only machine compat (redirects + migration + admin-solar shim) | `rg -i "solar" app components --include "*.tsx"` minus redirects/shim | Only redirect/shim | Remove remaining visible strings | grep | PASS (source) |
| CHK-39-02 | MEDIUM | Old `solarProducts`/`solarOrders` DB keys migrated not dangling (index.ts:47-61) | CHK-08-01 test | None dangling | Fix migration | log | NOT_STARTED |

### 40 — UI/UX
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-40-01 | MEDIUM | Design token consistency (globals.css @theme: abs-blue #2563EB, radii 12px inputs / 16px cards, shadows xs/sm) vs screenshots | Visual regression across pages | Consistent | Align non-conforming usage | screenshots | NOT_STARTED |
| CHK-40-02 | MEDIUM | Typography hierarchy: headings scale, body text-xs/sm, mono accents | Review pages | Hierarchical | Tune | screenshots | NOT_STARTED |
| CHK-40-03 | MEDIUM | Consistent hover/active/focus/disabled states for all interactive elements | Interaction sweep | Uniform | Add missing | capture | NOT_STARTED |
| CHK-40-04 | MEDIUM | No overflow/clipping at 1280px+ and 375px viewports | CHK-44 responsive sweep | No horizontal scroll | Fix overflow | screenshots | NOT_STARTED |
| CHK-40-05 | MEDIUM | Touch targets ≥ 44px for primary controls (login/menu buttons meet; verify others) | DevTools element sizing on touch viewport | ≥ 44px | Increase | capture | NOT_STARTED |

### 41 — Responsive Design
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-41-01 | HIGH | All 4 public + dashboard render on 375/768/1280/1920 without clipping/CSS breakage | Playwright screenshot matrix | No overflow, legible | Fix breakpoints | 4vw×5 page screenshots | NOT_STARTED |
| CHK-41-02 | MEDIUM | Tables (dashboard lists, audit logs) scroll horizontally rather than break on mobile | Audit table at 375 | `overflow-x-auto` preserves layout | Wrap tables | screenshot | NOT_STARTED |

### 42 — Mobile Navigation
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-42-01 | HIGH | Hamburger opens/closes; links navigate & close menu; focus returns to toggle | Playwright 375: toggle, navigate, Esc | Works | Fix Header mobileOpen handlers (Header.tsx:161-196) | capture | NOT_STARTED |
| CHK-42-02 | MEDIUM | Mobile menu has aria-expanded & proper label ("Toggle menu" present) | a11y snapshot | Label + expanded state | Fix | a11y snapshot | PASS (source: aria-label) |
| CHK-42-03 | MEDIUM | Sticky header offset respected on anchor pages (pt-28/pt-32 present) | Scroll to content at 375 | No hidden content | Tune offsets | screenshot | NOT_STARTED |

### 43 — Accessibility (target WCAG 2.2 AA)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-43-01 | HIGH | Automated axe scan 0 critical/serious on all public + admin pages | `npx @axe-core/playwright` or Lighthouse a11y | 0 critical/serious | Fix findings | axe report per page | NOT_STARTED |
| CHK-43-02 | HIGH | All form controls have labels (`htmlFor` present — ContactForm verified) | DevTools/axe labeled | 100% | Add labels | axe | PASS (source) |
| CHK-43-03 | HIGH | All images have meaningful alt (`Image` in modals/cards lacks alt — check/fix) | axe image-alt rule | Pass | Add alt to Shop* images | axe | NOT_STARTED |
| CHK-43-04 | MEDIUM | Heading hierarchy h1→… monotonic per page | Programmatic per page (Playwright evaluate document.querySelectorAll) | Chain ok | Fix skips | capture | NOT_STARTED |
| CHK-43-05 | MEDIUM | Color contrast ≥ 4.5:1 body / ≥ 3:1 large & UI (verify slate-400 on white uses: e.g. muted text) | axe color-contrast rule | Pass | Tune colors | axe | NOT_STARTED |
| CHK-43-06 | MEDIUM | Semantic landmarks (header/nav/main/footer) present | snapshot | Present | Add | snapshot | NOT_STARTED |

### 44 — Keyboard Navigation
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-44-01 | HIGH | Full page usable via tab/enter/space; visible `:focus-visible` (globals.css sets 2px #2563EB) | Playwright tab-through each page, watch focus ring | No stuck focus, all reachable | Fix traps | capture | NOT_STARTED |
| CHK-44-02 | MEDIUM | Dropdowns/menus (mobile menu) dismiss on Esc | Focus menu, press Esc | Closes | Add key handler | capture | NOT_STARTED |

### 45 — Focus Management
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-45-01 | HIGH | Modals trap focus & restore on close (ShopDetailModal handles Esc only; compare/inquiry need traps) | Open each modal, tab-cycle, Esc | Focus trapped in modal; returns to trigger | Implement trap for ShopCompareModal & ShopInquiryModal | capture | NOT_STARTED |
| CHK-45-02 | MEDIUM | `prefers-reduced-motion` honored (globals.css:83-92 present) | Emulate reduced motion | Animations off | Keep | capture | PASS (source) |
| CHK-45-03 | MEDIUM | Programmatic focus moves to error/success messages (ContactForm messages) | Trigger error | focus announced | Add role="status"/focus | capture | NOT_STARTED |

### 46 — Image Handling
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-46-01 | HIGH | All raster images via `next/image` (Hero priority; shop fill+sizes verified) | grep `img` (raw) in components | None raw | Convert | grep | PASS (source) |
| CHK-46-02 | MEDIUM | Remote image hosts configured (picsum.photos, images.unsplash.com in next.config.ts:12-27) | Load pages; dev console | No unoptimized errors | **Production change:** product images should move to app-hosted storage (ok for launch placeholder) | console | PASS (source) |
| CHK-46-03 | MEDIUM | Favicon/icon present | `/favicon.ico` request + app icon grep | Present | **SEO-001 fix:** add favicon (+ app icons) | HTTP probe | FAIL (missing) |

### 47 — Image Optimization
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-47-01 | MEDIUM | `sizes` attributes correct (they exist on shop fill images; hero fixed dims) | Inspect each Image | sizes declared, no huge transfer | Fix | excerpt | PASS (source) |
| CHK-47-02 | MEDIUM | LCP image optimized (Hero priority + width/height) | CWV check | LCP < 2.5s on 4G | Lazy-load below-fold only | CWV report | NOT_STARTED |

### 48 — Lazy Loading
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-48-01 | MEDIUM | Document loading strategy decisions (project removed all `next/dynamic`/`React.lazy` by directive; classification below) | Verify zero lazy APIs (`rg "next/dynamic|React.lazy|lazy\\(" app components`) | 0 lazy | Re-add ONLY where perf evidence demands | grep | PASS (zero lazy) |
| CHK-48-02 | MEDIUM | Modal complexity not duplicated across bundles (static import = 1 bundle copy) | Build analyzer (`@next/bundle-analyzer`) duplicate check | No dup | Dedupe | report | NOT_STARTED |

**Loading-Class Matrix (target state — do not blindly reintroduce lazy):**
| Asset | Class | Rationale |
|-------|-------|-----------|
| Header (brand + live status) | EAGER/CRITICAL | Perceived identity; tiny |
| PackageCard grid + filter (PackagesClient) | EAGER/CRITICAL | Primary content of page |
| Shop grid + filter (ShopClient) | EAGER/CRITICAL | Primary content; products today = 0, keep eager (cheap) |
| ShopDetailModal / ShopCompareModal / ShopInquiryModal | CONDITIONAL | Statically imported today (122 kB FLJS). Acceptable at current size. If page FLJS > 160 kB → split modals via `next/dynamic` with SSR:false + isolated loading; otherwise keep eager |
| ContactForm | EAGER | Core conversion; already inside required Suspense for `useSearchParams` |
| Footer | EAGER | Standard |
| Hero image | EAGER + `priority` | LCP element |
| Third-party/fonts | NONE loaded except system font stack | no external font `next/font` present → zero font network cost |

### 49 — Eager Loading / Critical Assets
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-49-01 | HIGH | LCP-critical assets prefetched/eager (hero image priority; nav prefetch true in Header links) | Verify `priority` prop & `prefetch={true}` | Present | Add priority where LCP | excerpt | PASS (source) |
| CHK-49-02 | MEDIUM | No render-blocking third-party scripts | Performance trace | 0 third-party | Remove | trace | PASS (source: none found) |

### 50 — Performance
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-50-01 | CRITICAL | CWV on 4G for `/`: LCP ≤ 2.5s, INP ≤ 200 ms, CLS ≤ 0.1 | Lighthouse (mobile, throttled) on production build, 3 runs | Medians within | Optimize blocking assets / images | LH report | NOT_STARTED |
| CHK-50-02 | HIGH | TTFB typical ≤ 600 ms (prod) | curl timing or WebPageTest | ≤ 600 ms | CDN/caching | timing | NOT_STARTED |
| CHK-50-03 | MEDIUM | No long tasks (>200 ms) in main thread post-load | Performance trace script | None in trace | Code-split / defer | trace | NOT_STARTED |
| CHK-50-04 | MEDIUM | Static pages use CDN cache headers (revalidate=60 set on packages/shop pages) | Inspect response `Cache-Control` on `/packages` | Present | Add caching strategy | headers | NOT_STARTED |

### 51 — Bundle Size
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-51-01 | HIGH | FLJS per route below budget (current: / 157, /packages 111, /shop 122, /contact 112 kB) | `npm run build` route table | ≤ 200 kB each | Optimize if exceeded | build log | PASS (2026-08-27) |
| CHK-51-02 | HIGH | Shared chunk (102 kB) not duplicated | `next build` + analyzer | Single shared set | Fix duplication | build | PASS |
| CHK-51-03 | MEDIUM | Lucide/motion tree-shaken (`optimizePackageImports`) | Analyze import graph | Only used icons | Verify | report | PASS (source) |

### 52 — Network Requests
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-52-01 | MEDIUM | Homepage request count (sub-resources) ≤ 30 on 4G & no redundant fetches | Playwright request log | ≤ 30; no unused | Trim | network log | NOT_STARTED |
| CHK-52-02 | MEDIUM | No unoptimized image payloads > 500 kB | Network log images tab | Under limit | Configure `images` formats/quality | log | NOT_STARTED |

### 53 — JavaScript Execution
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-53-01 | MEDIUM | Client-side JS minimal for marketing pages (observe `/packages` uses filter only; no analytics libs) | Coverage on /homepage | No unused large JS | Trim | coverage report | NOT_STARTED |
| CHK-53-02 | MEDIUM | Hydration free of errors & no layout shift post-hydration | Lighthouse CLS + console | CLS ≤ 0.1 | Fix | LH | NOT_STARTED |

### 54 — Core Web Vitals
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-54-01 | CRITICAL | 75th-percentile real-user CWV green (as measured, not estimated) | Field/RUM post-deploy + lab (CHK-50) | LCP<2.5 / INP<200 / CLS<0.1 | Optimize | RUM dashboard | BLOCKED (no RUM yet) |
| CHK-54-02 | MEDIUM | Lab CWV replicable in CI | Lighthouse CI step keyed to CHK-50 thresholds | Reproducible | Add CI | CI log | NOT_STARTED |

### 55 — SEO
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-55-01 | HIGH | Unique, ≤60-char titles + ≤160 metas per page (root + packages/shop/contact verified) | Meta-sweep via Playwright | All present | Fix misses | capture | PASS (source) |
| CHK-55-02 | HIGH | Crawlability confirmed by real crawler | Submit to Search Console / run a crawler (screaming frog) | No 403/blocked for public routes | Fix | crawl export | BLOCKED (requires live domain) |
| CHK-55-03 | MEDIUM | Single h1 per page | Per-page evaluate | h1 count = 1 | Fix | capture | NOT_STARTED |

### 56 — Metadata
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-56-01 | HIGH | All 4 public pages expose metadata (title template, description, OG) | Mate-sweep | Present | Fix | capture | PASS (source) |
| CHK-56-02 | MEDIUM | Admin pages excluded from index | `robots` in admin layout or meta noindex | Admin not in index | **Fix:** add `noindex` to admin pages | capture | NOT_STARTED |

### 57 — Canonicals
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-57-01 | **HIGH** | Canonical URL on every public page (missing today) | Meta-sweep for `rel=canonical` | Present | **SEO-001 fix:** add canonical metadata per page | capture | FAIL (absent) |

### 58 — Sitemap
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-58-01 | **HIGH** | `sitemap.ts` with approved public URLs | `GET /sitemap.xml` in prod | 200 valid sitemap, excludes admin | **SEO-001 fix:** add `app/sitemap.ts` | probe | FAIL (absent) |

### 59 — Robots
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-59-01 | **HIGH** | `robots.txt` allows public, disallows admin | `GET /robots.txt` | Correct | **SEO-001 fix:** add `app/robots.ts` | probe | FAIL (absent) |

### 60 — Structured Data / JSON-LD
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-60-01 | HIGH | Organization + LocalBusiness JSON-LD on `/` | `rg -l "application/ld+json" app` | Present & schema-valid (validator) | **SEO-001 fix:** add JSON-LD (only real business facts — do not assert license numbers unless verified) | schema capture | FAIL (absent) |
| CHK-60-02 | MEDIUM | BreadcrumbList on packages/shop/contact | Inspect pages | Present or N/A | Decide | capture | NOT_STARTED |

### 61 — Open Graph
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-61-01 | MEDIUM | og:title/og:description/og:type per public page (root verified; others inline) | Meta-sweep | Present | Fix | capture | PASS (source) |
| CHK-61-02 | MEDIUM | og:image defined (missing today) | Meta-sweep `property="og:image"` | Present | **SEO-001 fix:** add default OG image | capture | FAIL (absent) |

### 62 — Twitter Cards
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-62-01 | MEDIUM | twitter:card/title/description present (root verified) | Meta-sweep | Present | Fix | capture | PASS (source) |

### 63 — Favicon
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-63-01 | LOW | Favicon + app icons exist (absent today) | Icon-conventions glob + `/favicon.ico` | Present | **SEO-001/CHK-46-03 fix:** add favicon/icon | probe | FAIL (absent) |

### 64 — Content Truthfulness (tracks CONTENT-001)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-64-01 | **CRITICAL** | Every external claim verifiable: "Licensed ISP", REG `SMCVP-PVT-LTD-98421`, PTA license, 99.98% SLA, PKIX/BGP badge, 28,500 subscribers, 850 km fiber, sub-10 ms latency | Produce documentary evidence (registration certificate, license, NOC stats) or REMOVE/adjust claim (CONTENT-001) | Directive: VERIFIED / UNVERIFIED / REMOVED | ⛔ NO claim may be CERTIFIED absent evidence; remove unverifiable claims | evidence register (§13) | FAIL (all UNVERIFIED) |
| CHK-64-02 | HIGH | Header live-status text ("CONNECTED // NODE_01A • 99.98% UPTIME") not misleading | Verify it's decorative or reflects real status | Decorative clearly OR remove | Replace with honest text | screenshot | NOT_STARTED |
| CHK-64-03 | MEDIUM | No expired-promo/phantom pricing | Pricing review vs real catalog | Accurate | Fix | review doc | NOT_STARTED |

### 65 — Business Information
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-65-01 | HIGH | Phone/email/address/socials in settings verified against real records (phone +92 51 8899200, G-11/3 address, socials) | Client confirmation | VERIFIED | Unverified → mark + confirm | confirmation email | UNVERIFIED |
| CHK-65-02 | MEDIUM | Login placeholder domain corrected (placeholder uses `admin@absbroadband.pk`, real = `admin@absnetwork.pk` — CONTENT-002) | Inspect app/admin/login/page.tsx:98 | Uses correct domain | **CONTENT-002 fix:** change placeholder | excerpt | FAIL |

### 66 — Placeholder Content
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-66-01 | HIGH | Placeholder images (picsum/unsplash) replaced pre-launch OR documented as launch-planned | Sweep image URLs | Real assets or documented | Replace; keep external hosts whitelisted | sweep | NOT_STARTED |
| CHK-66-02 | MEDIUM | Demo seed data (users with office-worker names, sample submissions/orders) replaced with real staff & real inbox | Review `data/abs_database.json` users/submissions/orders | Real or purged | Export/clear demo rows; add real staff | review | NOT_STARTED |

### 67 — Product Catalog
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-67-01 | **CRITICAL** | Catalog populated with real products OR empty-state + no false counts (DATA-003) | Live count = 0 vs claims | Resolve | **DATA-003 fix (A/B)** | counts | FAIL |
| CHK-67-02 | HIGH | Product schema fields (price, stock, warranty, images, specs) complete for all published items | Validator over published products | No null/missing critical fields | Complete records | validator | NOT_STARTED |
| CHK-67-03 | HIGH | SKU/brand/model consistency for reorder-ability | Review | Unique SKUs | Fix | review | NOT_STARTED |

### 68 — Product Images
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-68-01 | MEDIUM | Product images use stable URLs (no transient picsum), proper aspect ratio, alt | Image audit | Real products | Move to storage (Supabase storage in migration) | audit | NOT_STARTED |
| CHK-68-02 | MEDIUM | Broken-image fallback per product | Force 404 image → UI | Graceful fallback | Add onError fallback | capture | NOT_STARTED |

### 69 — Security Headers
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-69-01 | HIGH | Baseline headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, permissions-policy; CSP evaluated | curl -I each response + `next.config.ts` headers() | Present | Add config-level headers; delegate strict CSP decision (needs inline scripts → use nonces via middleware) | header capture | NOT_STARTED |
| CHK-69-02 | HIGH | No sensitive headers leak (server, x-powered-by) | curl -I | Server header minimized | Configure | capture | NOT_STARTED |

### 70 — CSRF
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-70-01 | HIGH | All mutations are server actions with built-in Origin/SameSite protection (no raw `fetch`/REST endpoints — verified zero API routes) | grep fetch/mutation methods | Server-action only | Re-evaluate if REST added | grep | PASS (source) |
| CHK-70-02 | HIGH | External-origin action POST rejected | Playwright/curl: forge action POST w/o origin | 403/425 | Ensure proxy preserves Host | probe | NOT_STARTED |

### 71 — XSS
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-71-01 | HIGH | No `dangerouslySetInnerHTML` in app/components | grep | None user-controlled; none present | Remove/fix | grep | PASS (source: none) |
| CHK-71-02 | HIGH | User input from settings/submissions rendered escaped (React default) | Inject payload in settings; render | Escaped | Sanitize if raw HTML later used | capture | NOT_STARTED |

### 72 — Injection Safety
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-72-01 | HIGH | JSON injection / schema-validation bypass prevented (all writes through zod + typed create fns) | Audit `create*` for unvalidated fields | No unvalidated path | Fix | code audit | PASS (source) |
| CHK-72-02 | MEDIUM | Reflected query params sanitized (contact presets sanitized via React) | Submit `?type=</script>` | Rendered inert | Encode | capture | NOT_STARTED |

### 73 — Secret Management
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-73-01 | HIGH | Secret scan: no tokens/keys in source, DB, logs | Gitleaks or regex sweep over `app components lib data next.config.ts package.json` | 0 found | Redact; remove | scan report | PASS (2026-08-27 grep) |
| CHK-73-02 | HIGH | Secrets not in client bundle | `rg "AdminPassword|GEMINI|JWT|secret" .next/static` (prod) | 0 | Fix env | scan | NOT_STARTED |
| CHK-73-03 | MEDIUM | `.env.example` documents only real vars (CONFIG-001) | Diff `.env.example` vs `process.env` usage | Only NODE_ENV (today) → prune file | **CONFIG-001 fix** | diff | FAIL |

### 74 — Cookie Security
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-74-01 | CRITICAL | Session cookie flags precise at runtime (httpOnly; secure in prod; SameSite=Lax; Path=/; Max-Age 7d) (session.ts:138-144) | Login in prod mode; inspect Set-Cookie | Exact flags | Fix | header capture | PASS (source) |
| CHK-74-02 | MEDIUM | No other sensitive cookies set | Cookie store capture | Only session cookie | Remove | capture | NOT_STARTED |

### 75 — Authentication Enumeration
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-75-01 | HIGH | Uniform message, timing, status for unknown vs bad-password | Timing & response diff for both | Indistinguishable | Equalize (session.ts:116,129 already identical) | timing log | PASS (source) |

### 76 — Brute Force Protection
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-76-01 | HIGH | Rate limit + lockout verified end-to-end vs UI | CHK-13-01 runtime | Lock observed | Fix | log | NOT_STARTED |
| CHK-76-02 | HIGH | Public forms not brute-forceable (SEC-006) | Script 50 submits | Throttled/blocked | Add IP quota/honeypot | log | NOT_STARTED |

### 77 — Logging
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-77-01 | MEDIUM | Structured logs, no PII overlogging, rotation plan | Inspect console + audit storage | Clean | Sanitize | audit | NOT_STARTED |
| CHK-77-02 | MEDIUM | Production error log destination documented (Cloud Run logs) | docs | Present | Document | doc | NOT_STARTED |

### 78 — Audit Trail
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-78-01 | HIGH | Tamper-evidence: audit entries immutable append-only | Attempt direct DB edit in UI | No UI path writes audit logs | Keep append-only | audit | NOT_STARTED |
| CHK-78-02 | MEDIUM | Audit retention & export | Document | Kept ≥ 90 days / exportable | Add export | doc | NOT_STARTED |

### 79 — Deployment
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-79-01 | HIGH | Deployment runbook (build → standalone → data mount → env → health check) | Produce docs & demo | Works | Write runbook (README is wrong AI-Studio template — CONFIG-003) | runbook | NOT_STARTED |
| CHK-79-02 | HIGH | Health check endpoint for load balancer | Add `/api/health` (new) OR document readiness via HTTP 200 on `/` | Reachable | Add minimal health route | probe | NOT_STARTED |
| CHK-79-03 | MEDIUM | Zero-downtime deploys (standalone + filesystem DB constraint) | Load test during restart | Single replica acceptable or drain | Document | note | NOT_STARTED |

### 80 — Standalone Build
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-80-01 | HIGH | Standalone output usable: `node .next/standalone/server.js` serves app INCLUDING data mount (DEP-001 warning that `next start` conflicts with standalone) | Copy standalone to temp dir with `data/` mounted; run; curl | 200s; DB seeded & writable | Use server.js as canonical start cmd; document | run log | NOT_STARTED |
| CHK-80-02 | HIGH | `.next/standalone` includes static assets (ensure static copy via runbook) | Verify standalone/static exists | Present | Copy static separately | file list | NOT_STARTED |

### 81 — Production Server
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-81-01 | HIGH | `npm start` parity note: logs "next start does not work with output: standalone" (observed). Determine canonical start | Bot h grid above (CHK-80-01) | Canonical path proven | **DEP-001 fix:** document `node .next/standalone/server.js`; adjust scripts if wanted | log | NOT_STARTED |
| CHK-81-02 | MEDIUM | Production env boots with zero env vars | CHK-06-04 | Boots | n/a | log | NOT_STARTED |

### 82 — Multi-instance Safety
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-82-01 | **HIGH** | Single-instance during JSON-DB era (DATA-001) OR migrate before scaling | Capacity doc + deployment topology decision | 1 replica pin OR Supabase first | **DATA-001 fix:** pin `max_instances=1` until migration; audit DB write path (fs.writeFileSync last-write-wins) | topology doc | NOT_STARTED |
| CHK-82-02 | HIGH | Rate-limiter & cache per-instance implications documented (SEC-002) | Design review | Documented | Externalize limiter | doc | NOT_STARTED |

### 83 — Backup / Recovery
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-83-01 | CRITICAL | Encrypted nightly backup of `data/abs_database.json` + tested restore runbook | Implement backup job + restore drill | Restore works in < 30 min | **Fix (DATA-001 related):** add backup; schedule drill | restore log | NOT_STARTED |
| CHK-83-02 | HIGH | Corruption detection on boot | Add schema validation on `getDatabase()` | Errors clearly, no silent overwrite | Add validation | doc | NOT_STARTED |

### 84 — Testing Infrastructure (TEST-001 — major gate)
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-84-01 | **CRITICAL** | Test scripts defined in package.json (unit + e2e) | Add `test:unit`, `test:e2e`, `test` scripts (Vitest + Playwright = minimal, ecosystem-appropriate; node:test acceptable for units) | Scripts exist & green | **TEST-001 fix:** scaffold minimum: `vitest` for `lib/` (pure functions) + `@playwright/test` | package.json diff | NOT_STARTED |
| CHK-84-02 | HIGH | Test golden DB isolation (tests use temp copy of `data/`) | Env var `DB_PATH` override (make `DB_FILE` overridable via env) OR tests operate on copies | Tests never mutate live DB | **Fix:** support `process.env.ABS_DB_PATH` in db/index.ts; point tests to temp | test config | NOT_STARTED |
| CHK-84-03 | HIGH | CI runs: lint → typecheck → unit → build → e2e | Add GitHub Actions (or equivalent) | All green on PR | Add CI | CI log | NOT_STARTED |

### 85 — Unit Testing
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-85-01 | HIGH | Pure lib coverage: RBAC (`hasPermission`, `canManageRole`), validation schemas, PKR formatting, migration, session expiry, rate-limit window | Vitest suite ≥ 80% line on `lib/auth`, `lib/db` pure paths | Green | Write tests | coverage | NOT_STARTED |
| CHK-85-02 | HIGH | SEC-001 regression test: token entropy length & uniqueness across 1000 creations | Unit asserts token pattern & uniqueness | 1000 unique ≥64-char hex/uuid | **Guard for SEC-001 fix** | unit log | NOT_STARTED |

### 86 — Integration Testing
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-86-01 | HIGH | Server action ↔ DB integration (create ~ read ~ update ~ delete) per module | Vitest calling actions with temp DB | Green | Write | log | NOT_STARTED |
| CHK-86-02 | HIGH | Auth end-to-end against seeded users (incl. inactive & rate-limit) | Integration tests over `authenticateAdmin` | Green | Write | log | NOT_STARTED |

### 87 — E2E Testing
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-87-01 | CRITICAL | All §6 journeys automated (18 public + 20 admin) | Playwright specs, chromium, prod build | All green | Write specs | e2e report | NOT_STARTED |
| CHK-87-02 | HIGH | E2E asserts audit/security events created per action | Assert DB file during specs | Events present | Wire asserts | report | NOT_STARTED |

### 88 — Browser Testing
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-88-01 | MEDIUM | Critical journeys pass in Chromium + Firefox + WebKit | `npx playwright test --project=chromium.firefox.webkit` (subset) | Green | Fix browser-specific CSS | report | NOT_STARTED |
| CHK-88-02 | MEDIUM | No Image `next/image` unsupported-dimension errors cross-browser | Console sweep | Clean | Fix | log | NOT_STARTED |

### 89 — Cross-device Testing
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-89-01 | MEDIUM | Real-device pass: Android Chrome, iOS Safari smoke of journeys 1-4 & 10-13 | Manual checklist or device farm | No breakage | Fix | device log | NOT_STARTED |

### 90 — Regression Testing
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-90-01 | HIGH | Full suite re-run before any release | CI triggers on tags; green gate | Release halts on fail | Wire | CI | NOT_STARTED |
| CHK-90-02 | MEDIUM | Snapshot of DB before/after suites identical (golden DB) | Compare hashes | Equal after non-destructive | Restore mechanics | hash log | NOT_STARTED |

### 91 — Final Release Gate
| Check | SEV | Requirement | Verification method | Expected result | Failure / Required fix | Evidence | Status |
|-------|-----|-------------|---------------------|-----------------|------------------------|----------|--------|
| CHK-91-01 | CRITICAL | §21 checklist complete & all blockers closed | Gate ceremony | All boxed | Iterate | sign-off | NOT_STARTED |

---

## 4. Audit Findings Import Matrix (every audit.md finding mapped)

| Finding | Sev (audit) | Traced to check(s) | Current state | Desired state | Exact fix | Verification | Regression test | Certification requirement |
|---------|-------------|--------------------|---------------|---------------|-----------|---------------|-----------------|---------------------------|
| SEC-001 | HIGH | CHK-11-01, 85-02 | `Math.random()` tokens (db/index.ts:892) | CSPRNG tokens | Replace with `crypto.randomBytes(32).toString('hex')` (Node crypto, no new dep) | Unit: 1000 tokens unique/length; review diff | token-entropy unit test | CERTIFIED only w/o `Math.random` |
| NAV-001 | HIGH | CHK-17-01, 18-02, 27-02, 28-03 | /admin/logs, /admin/security, /admin/contact-submissions → 404 (sidebar + dashboard) | 0 dead links | Sidebar → `/admin/audit-logs`, `/admin/submissions`; drop-or-build `/admin/security`; dashboard links aligned | Crawl test (all `<a>` 200/307) | link-crawl e2e | ZERO-DEAD-LINK gate |
| DATA-003 | HIGH | CHK-09-01/09-04, 22-02, 26-03, 29-02, 31-01, 67-01 | Homepage "8+" vs 0 live/seed products; stat plumbed to 8 | Singleton truth | Populate catalog (A) OR remove claim & derive stat from DB (B) | Count check on pages | data-integrity unit | truthful catalog |
| TEST-001 | HIGH | CHK-84-87, 90 | No tests | Gate suite | Vitest (lib) + Playwright (E2E); add DB path override | Run suite green | CI gate | release gate green |
| CONTENT-001 | HIGH | CHK-64-01, 65-01 | Unverified license/stats/uptime claims | Verified or removed | Evidence register + copy change | Evidence review | static-content scan | no unverified claims CERTIFIED |
| AUTH-001 | MEDIUM | CHK-14-01, 15-01, 15-03 | Guards inline, no central helper | Centralized `requireAuth/requirePermission` | Add helper in `lib/auth/`; refactor actions | Grep all actions use helper | RBAC unit | every action guarded |
| SEC-002 | MEDIUM | CHK-13-03, 76, 82-02 | In-memory limiter | Shared/external or documented 1-instance | Pin to 1 replica & document; externalize pre-multi-instance | Load-run | rate-limit e2e | documented phase |
| UX-002 | MEDIUM | CHK-35-01/02, 36-01, 37-01, 18-03 | No error/loading/404 | Full boundary kit | Add error.tsx, global-error, not-found, loading.tsx; empty states | Visual + fault-injection | e2e fault test | no default-framework UX |
| SEO-001 | MEDIUM | CHK-46-03, 57, 58, 59, 60, 61-02, 63 | No canonical/sitemap/robots/JSON-LD/OG-img/favicon | Full SEO kit | Add `sitemap.ts`, `robots.ts`, canonical metadata, JSON-LD, OG image, favicon | HTTP probes + schema validator | meta-sweep test | SEO gate |
| SEC-004 | MEDIUM | CHK-01-03 | `data/` DB not gitignored | Ignored + backup | Add ignore; add CHK-83 backup | git check-ignore + restore drill | backup cron verify | data protected |
| DATA-001 | MEDIUM | CHK-82-01, 83 | JSON writes not concurrency-safe | Single-replica or Supabase | Pin replicas; schema validation on boot; backups | Multi-process race proof or topology doc | concurrency probe | documented topology |
| AUTH-003 | LOW | CHK-15-02 | 200 denied panels | 403 semantics | Use `notFound()`/403 for forbidden roles | curl role probe | rbac e2e | proper status |
| NAV-002 | LOW | CHK-17-02 | Sidebar shows role only | Show identity | Pass user name/email to AdminSidebar | Visual | snapshot | identity shown |
| NAV-003 | LOW | CHK-17-03, 23-02 | /admin/services unlinked; orphan | Linked or removed | Decision + implement (recommend link it) | Crawl | nav test | no orphan features |
| DATA-002 | LOW | CHK-23-02/03 | services admin-only | Decision executed | As above | Review | snapshot | decision recorded |
| DATA-004 | LOW | CHK-26-03 | Hardcoded stats | Derived | Compute stats from data in settings action | Count assertion | unit | derived stats |
| SEC-005 | LOW | CHK-09-03, 73 | Known default seed pw, no rotation | Rotate/force-change | First-login password change; remove default when persist | Login flow | e2e auth | no known default |
| SEC-006 | LOW | CHK-13-04, 76-02 | No public-form spam guard | Honeypot/captcha + per-IP quota | Add honeypot + quota in public-forms action | Spam-run | e2e spam test | rate-limited forms |
| CONTENT-002 | LOW | CHK-65-02 | Login placeholder wrong domain | Correct domain | Change placeholder to `admin@absnetwork.pk` or neutral | Visual | snapshot | fixed |
| PERF-001 | LOW | CHK-04-02 | Lint skipped in build | Lint gated | CI lint step or flip config | CI run | CI gate | lint enforced |
| DEP-001 | LOW | CHK-79-01, 80, 81 | `npm start` warns vs standalone; README generic | Verified start cmd + runbook | Use standalone server.js; write runbook; fix README | Boot drill | deploy e2e | documented deploy |
| CONFIG-001 | LOW | CHK-06-01, 73-03 | Env mismatch (.env.example vs code) | Aligned | Prune/implement | Diff | unit | env.schema match |
| CONFIG-002 | LOW | CHK-04-04 | Legacy .eslintrc + flat config | Single | Delete legacy | Start app clean | lint CI | single config |
| CONFIG-003 | LOW | CHK-01-04, 05-01/02, 79-01 | AI-Studio leftovers (name, README, metadata.json, unused deps, bun.lock) | Cleaned | Rename package, rewrite README, prune deps/lockfile | npm ls + docs | CI intact | hygiene |

---

## 5. Performance & Loading Certification (explicit, tracks §01-§54)

**Baseline build (2026-08-27):** FLJS / 157 kB, /packages 111, /shop 122, /contact 112; shared 102 kB; 8 static + 9 dynamic pages; zero lazy APIs (removed per prior directive).

**Strategic verdict (evidence-driven, not assumption):** removal of `next/dynamic`/`React.lazy` is **correct today** because controller complexity is modest and bundles are within budget; modals share the route bundle (one copy, no duplication). Lazy-loading is only **justified if** any route FLJS exceeds 160 kB or `@next/bundle-analyzer` shows cross-route duplication. The Loading-Class Matrix (§48) defines eager vs conditional per asset.

Performance load-state requirements:
| Requirement | Method | Threshold | Evidence |
|-------------|--------|-----------|----------|
| LCP `/` on 4G throttled Chromium prod | Lighthouse ×3 | ≤ 2.5 s | LH report |
| INP | Lighthouse/performance trace | ≤ 200 ms | trace |
| CLS | Lighthouse | ≤ 0.10 | LH |
| TTFB (prod) | curl timing | ≤ 600 ms | timing |
| FLJS/route | `npm run build` | ≤ 200 kB | build log |
| Sub-resource count `/` | network log | ≤ 30 | log |
| Raw `<img>` tags | grep | 0 (all next/image) | grep |
| Long tasks post-load | trace | 0 > 200 ms | trace |
| Fonts | audit | 0 external font fetches (system stack) | network log |
| CSR bytes | coverage | minimal on static pages | coverage |

Critical/eager classification enforced by CHK-49; conditional-lazy policy enforced by CHK-48 + this §threshold.

---

## 6. E2E User Journeys (binding specs)

Journey definition header: *Preconditions → Steps → Expected → Failure → Evidence → Status*.

### A. PUBLIC USER (18 journeys)

**J1 Homepage load** — Pre: seeded prod build. Steps: GET `/`; assert HTTP 200; hero h1; 4 stat cards; package grid ≥ 3; CTA(s). Expected: full render, "8+ Items" claim matches DB (after DATA-003 fix). Failure: claim mismatch, blank, console error. Evidence: screenshot + status.

**J2 Header navigation** — Steps: click Home/Packages/Shop/Contact from header (desktop). Expected: correct route 200 & active state. Failure: 404/blank. Evidence: captures.

**J3 Packages grid** — Steps: `/packages`, assert 6 cards, PKR prices, features. Expected: matches DB active set. Failure: stale/inactive shown. Evidence: screenshot + DB dump.

**J4 Filter packages** — Steps: click each category tab. Expected: grid subsets without reload. Failure: no-op/blank. Evidence: capture.

**J5 Shop open** — Steps: `/shop`, assert banner/grid/empty state. Expected: honest state (after DATA-003 fix). Failure: misleading count. Evidence: screenshot.

**J6 Browse products** — Steps: scroll grid, filters. Expected: products/empty well-done. Evidence: capture.

**J7 Product detail** — Steps: click card → ShopDetailModal; images/specs/price/warranty; Esc closes & focus returns. Expected: all data + a11y. Failure: missing trap/alt. Evidence: capture.

**J8 Compare products** — Steps: select ≥2 → ShopCompareModal table; close. Expected: compare renders; Esc. Failure: freeze. Evidence: capture.

**J9 Product inquiry open** — Steps: "Order Inquiry" → ShopInquiryModal prefilled product. Expected: prefilled & math. Failure: empty. Evidence: capture.

**J10 Submit inquiry** — Steps: valid fields → submit. Expected: success w/ Reference #; record in `/admin/orders`; audit. Failure: no order. Evidence: log + UI.

**J11 Navigate to contact** — Steps: header/footer → `/contact`. Expected: form + FAQ + helpline. Evidence: screenshot.

**J12 Contact form fill** — Steps: valid + type=preset via URL. Expected: presets honored. Evidence: capture.

**J13 Submit contact** — Steps: valid → success panel "Message Dispatched!". Expected: panel + record `new`. Failure: silent. Evidence: UI + DB.

**J14 Success state verified** — Steps: assert success block & reset available. Expected: can "Send Another Inquiry". Evidence: capture.

**J15 Error state verified** — Steps: submit invalid (short message) and network-failed. Expected: validation msg + failure msg, form intact. Evidence: capture.

**J16 Mobile navigation** — Steps: 375px; hamburger; navigate; close menu; Esc. Expected: menu works, focus returns. Evidence: capture.

**J17 Footer links** — Steps: click all footer links (Home/Packages/Shop/Contact/NOC Portal/tel/mailto/social). Expected: no 404 (tel/mailto/socials valid). Failure: dead → NAV gate. Evidence: crawl.

**J18 Legacy URLs** — Steps: GET `/solar-packages`, `/services`, `/admin/solar`. Expected: 307/404 intentional. Evidence: probe.

### B. ADMIN USER (20 journeys)

**J19 Admin login open** — `/admin/login` 200; form labels. **J20 Invalid login** (bad email, bad password) → generic msg + LOGIN_FAILED event. **J21 Valid login** → session cookie + redirect dashboard. **J22 Session creation** → cookie flags (§74) + token entropy (§11). **J23 Dashboard** → counts truthful (§18) + no dead links. **J24 Packages CRUD** → create/update/delete/toggle + audit + revalidate (golden DB restore). **J25 Shop CRUD** → full product lifecycle + images + audit. **J26 Services CRUD** → decision-dependent (§23). **J27 Orders** → status workflow + totals + assignment. **J28 Contact submissions** → status/notes/assignment. **J29 Users** → create/reset/disable/delete with canManageRole constraints. **J30 Settings** → edit persists to public pages; injection-escaped. **J31 Audit logs** → reach via fixed link; entries contain actor/IP. **J32 Permission denied** → low-role user → Access Denied + POST-403 fixed + no data leak. **J33 Logout** → cookie cleared, session revoked. **J34 Session expiry** → tamper expiresAt → 307 login. **J35 Disabled user** → no login; sessions revoked. **J36 Unauthorized direct URL** → all admin pages 307 login (observed) + direct action denied. **J37 Role-specific access** → SECURITY_AUDITOR read-only etc (see §7 matrix). **J38 Audit event generation** → J24-30 each create ≥1 event; assert in `/admin/audit-logs` + securityEvents.

Each journey records: precondition, steps, expected, failure, evidence (screenshot/log), status. Batch in Playwright specs `public/*.spec.ts`, `admin/*.spec.ts`.

---

## 7. Master RBAC Matrix (authoritative from `lib/auth/rbac.ts`)

Permissions (9): manage_packages, manage_services, manage_shop_products, manage_orders, manage_contact_submissions, manage_users, manage_settings, view_security, view_activity_logs.

| Role | pkgs | svcs | shop | orders | subs | users | settings | security | logs |
|------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| SUPER_ADMIN | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| ADMIN | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | – | ✔ |
| CONTENT_MANAGER | ✔ | ✔ | ✔ | – | – | – | ✔ | – | ✔ |
| SALES_MANAGER | – | – | – | ✔ | ✔ | – | – | – | ✔ |
| SUPPORT_AGENT | – | – | – | – | ✔ | – | – | – | ✔ |
| SECURITY_AUDITOR | – | – | – | – | – | – | – | ✔ | ✔ |

Verification per cell: (1) UI item visibility test, (2) page GET granted/denied, (3) server action invocation granted/denied + no mutation. **Server-side is authoritative.** `canManageRole`: SUPER_ADMIN+ADMIN only; ADMIN cannot touch SUPER_ADMIN.

---

## 8. Master Route Matrix (observed 2026-08-27)

| Route | Type | Auth | Permission | Runtime (unauth) | Status |
|-------|------|------|-----------|------------------|--------|
| `/` | ○ static | public | – | 200 | PASS |
| `/packages` | ○ static | public | – | 200 | PASS |
| `/shop` | ○ static | public | – | 200 | PASS |
| `/contact` | ○ static | public | – | 200 | PASS |
| `/solar-packages` | ○ static | public (redirect) | – | 307→/shop | PASS |
| `/services` | removed | – | – | 404 | intentional |
| `/admin/login` | ƒ | public | – | 200 | PASS |
| `/admin/dashboard` | ƒ | session | (none) | 307→login | PASS |
| `/admin/packages` | ƒ | session | manage_packages | 307→login | PASS |
| `/admin/shop` | ƒ | session | manage_shop_products | 307→login | PASS |
| `/admin/services` | ƒ | session | manage_services | 307→login | PASS |
| `/admin/orders` | ƒ | session | manage_orders | 307→login | PASS |
| `/admin/submissions` | ƒ | session | manage_contact_submissions | 307→login | PASS |
| `/admin/users` | ƒ | session | manage_users | 307→login | PASS |
| `/admin/settings` | ƒ | session | manage_settings | 307→login | PASS |
| `/admin/audit-logs` | ƒ | session | view_activity_logs | 307→login | PASS |
| `/admin/solar` | ƒ | session | redirect→/admin/shop | 307→login | PASS |
| `/admin/logs` | – | – | – | **404 (dead)** | FAIL (fix→audit-logs) |
| `/admin/security` | – | – | – | **404 (dead)** | FAIL (build or remove) |
| `/admin/contact-submissions` | – | – | – | **404 (dead)** | FAIL (fix→submissions) |

---

## 9. Master Data Integrity Matrix

| Entity | Live count | Integrity rule | Check | Status |
|--------|-----------|----------------|-------|--------|
| settings | 1 | all 24 typed fields; stats consistent w/ data (DATA-003/004) | CHK-07-04, 26-03 | FAIL on statsShopProductCount (8 vs 0 products) |
| users | 5 | bcrypt `$2b$`; unique email; isActive; no SUPER_ADMIN self-lock | CHK-09-02, 20 | PASS hashing; seed-reset open (SEC-005) |
| sessions | 0 | token entropy (SEC-001); expiry; revoke on disable | CHK-11 | token FAIL |
| packages | 6 | unique slug; pricePkr ≥ 0; active flag honored publicly | CHK-21 | NOT_STARTED |
| services | 6 | decision on orphan status (NAV-003/DATA-002) | CHK-23 | decision pending |
| shopProducts | **0** | catalog populated OR claim removed (DATA-003) | CHK-22-02 | **FAIL** |
| contactSubmissions | 3 | status enum; PII admin-only | CHK-25 | NOT_STARTED |
| shopOrders | 2 | orderNumber unique; totals math exact | CHK-24 | NOT_STARTED |
| auditLogs | 1 | append-only; actor+IP present | CHK-27/78 | NOT_STARTED |
| securityEvents | 1 | type map; no secrets in metadata | CHK-28 | NOT_STARTED |

---

## 10. Master Security Matrix

| Control | Evidence | Status |
|---------|----------|--------|
| bcrypt cost 10 | session.ts:18-20 | PASS (source) |
| Cookie httpOnly/Secure/SameSite/7d | session.ts:138-144 | PASS (source) |
| Generic auth failure message | session.ts:116/129 | PASS |
| 5/15min rate limit | session.ts:40-85 | PASS (source); multi-instance caveat SEC-002 |
| CSPRNG tokens | db/index.ts:892 | **FAIL (Math.random)** |
| No plaintext secrets in source/DB/logs | greps + secret scan | PASS (2026-08-27) |
| No API surface beyond server actions | glob app/api → none | PASS |
| Origin CSRF via framework + SameSite | framework default | PASS (integration-reverify in prod behind proxy) |
| No dangerouslySetInnerHTML | grep | PASS |
| Escaped React rendering incl. settings | React default | integration TBD |
| Admin page guards (auth+perm) | 8 pages pattern | PASS (source) |
| 403 semantics | audit-logs:14-21 etc. | **FAIL (200)** |
| Security events on key actions | logSecurityEvent sites | TBD run |
| Server security headers | none configured | **FAIL (CHK-69)** |
| DB file exposure (git/mount) | .gitignore | **FAIL (SEC-004)** |
| Public form spam guard | none | **FAIL (SEC-006)** |

---

## 11. Master SEO Matrix

| Item | Present | Check | Status |
|------|:--:|-------|--------|
| Title (root + per-page template) | ✔ | CHK-55/56 | PASS |
| Description | ✔ | CHK-55 | PASS |
| Keywords (non-essential) | ✔ root | CHK-55 | PASS |
| Canonical | ✘ | CHK-57 | FAIL → add |
| Sitemap | ✘ | CHK-58 | FAIL → add |
| robots.txt | ✘ | CHK-59 | FAIL → add |
| OpenGraph tags | ✔ | CHK-61 | PASS |
| og:image | ✘ | CHK-61-02 | FAIL → add |
| Twitter card | ✔ | CHK-62 | PASS |
| Favicon/app icons | ✘ | CHK-63/46-03 | FAIL → add |
| JSON-LD Organization/LocalBusiness | ✘ | CHK-60 | FAIL → add (only verified facts) |
| Breadcrumbs | ✘/N/A | CHK-60-02 | decide |
| h1 single per page | TBD | CHK-55-03 | run |
| Admin noindex | ✘ | CHK-56-02 | FAIL → add |
| Crawl/Index verified | ✘ (no domain) | CHK-55-02 | BLOCKED → post-launch |

---

## 12. Master Accessibility Matrix (WCAG 2.2 AA targets)

| Area | Expectation | Check | Status |
|------|-------------|-------|--------|
| Labels | all fields labelled | CHK-43-02 | PASS (source) |
| Images alt | all `<Image>` alt | CHK-43-03 | RUN |
| Keyboard full flow | tab/enter/esc | CHK-44 | RUN |
| Focus visible | :focus-visible 2px blue | CHK-44-01 | PASS (source) |
| Modal trap + restore | all 3 modals | CHK-45-01 | detail passes Esc; compare/inquiry need work |
| Reduced motion | media query | CHK-45-02 | PASS (source) |
| Contrast | ≥4.5:1 text | CHK-43-05 | RUN |
| Heading hierarchy | h1→h2→h3 | CHK-43-04 | RUN |
| Touch targets | ≥44px | CHK-40-05 | RUN |
| Announcements | role=status on form msgs | CHK-45-03 | RUN |
| axe sweep | 0 critical/serious | CHK-43-01 | RUN |

---

## 13. Supabase Migration Readiness (document only — no migration in this task)

Baseline survey for the future migration (post-current-certification):

| Concern | Current JSON | Supabase mapping |
|---------|--------------|------------------|
| settings | singleton object | `settings` table (id=1) |
| users / sessions / auth | bcrypt hash in `users`; token in `sessions` | Supabase Auth (password auth) OR keep table + managed sessions; **session tokens must migrate to Auth JWT/refresh** (resolves SEC-001) |
| roles/permissions | `users.role` enum; `rbac.ts` matrix | `app_metadata.role` + RLS policies mirroring the 9 permissions |
| packages/services/shopProducts | arrays w/ slug PKs | tables w/ serial PKs + unique slugs; enable RLS; timestamps |
| submissions/orders | arrays w/ id/status/notes | tables w/ constraints on status enums + FKs to staff |
| auditLogs/securityEvents | append-only arrays | tables w/ RLS admin-read; triggers for auto-logging |
| indexes needed | none (in-memory) | `users(email)`, `sessions(token)`, `products(category,active)`, `orders(status)`, `db triggers updated_at` |
| product images | external URLs | Supabase Storage buckets + public URLs; keep `next/image` optimization |
| migrations | JSON key migration only | SQL migrations tool (e.g., `supabase/migrations`) versioned |
| seed | seed.ts | reproducible seed script/CLI |
| backup | manual JSON copy (to be automated) | Supabase PITR + daily backups |
| multi-instance | unsafe with JSON writes (DATA-001) | safe via Supabase (resolves DATA-001 + SEC-002) |

**Gate:** migration starts only after every check in this certification that is applicable to current behavior reaches CERTIFIED/PASS.

---

## 14. Weighted Certification Score

| Category | Weight | Basis |
|----------|-------:|-------|
| Build & Tooling | 5 | CHK-02/03/04 |
| Architecture | 5 | §2/Phase 10 audit |
| Database/Data | 10 | §09 matrix |
| Authentication | 10 | §10-12 |
| RBAC/Authorization | 10 | §7/§15 |
| Admin Panel | 10 | §18-28 |
| Public Frontend | 10 | §29-34 |
| UI/UX | 10 | §40-42 |
| Performance | 10 | §47-54 |
| Security | 10 | §10 matrix |
| SEO/A11y | 5 | §11/§12 |
| Testing | 5 | §84-90 |
| **Total** | **100** | |

Score bands: **95-100 = PRODUCTION CERTIFIED · 90-94 = RELEASE CANDIDATE · 80-89 = NOT CERTIFIED · <80 = NOT READY**.

**Override rule (mandatory):** regardless of numeric score, certification is **withheld** while any of these remain open:
- SEC-001 predictable session tokens (present) ⛔
- NAV-001 dead admin navigation (present) ⛔
- DATA-003 false business data claims (present) ⛔
- Critical authorization failure (denial via direct action under wrong role)
- Exposed secrets in source/DB/logs
- Broken production build / core user journey (J1, J13, J21)

*Estimated current score: ~55-62 (not ready) — dominated by Testing (0), Data (catalog/stat contradiction), Security (tokens/headers/403), and unverified content.*

---

## 15. Final Certification Gate (checklist — all must be verified before PRODUCTION CERTIFIED statement)

- [ ] Build passes (`npm run build` exit 0, CHK-02-01)
- [ ] TypeScript passes (`npx tsc --noEmit` exit 0)
- [ ] ESLint passes (`npx eslint .` exit 0)
- [ ] No critical dependency problems (`npm audit --omit=dev` no critical)
- [ ] Database integrity passes (§09 matrix)
- [ ] Authentication passes (J19-21, §10)
- [ ] Session security passes (CHK-11-01 CSPRNG, CHK-74)
- [ ] RBAC passes (full §7 matrix incl. server-side deny)
- [ ] Authorization passes (CHK-15, direct-action denial)
- [ ] Admin navigation has zero dead links (CHK-17-01 crawl)
- [ ] All CRUD operations pass (J24-30)
- [ ] Public flows pass (J1-18)
- [ ] Forms pass (J10, J13, §33)
- [ ] Error handling passes (CHK-35-37)
- [ ] Loading states pass (CHK-36)
- [ ] Responsive tests pass (CHK-41/42)
- [ ] Accessibility passes (axe + §12)
- [ ] SEO passes (§11)
- [ ] Performance passes (§5 thresholds)
- [ ] Image optimization passes (CHK-46/47)
- [ ] Lazy/eager loading strategy verified (§48 Matrix)
- [ ] No false business claims (CHK-64 register)
- [ ] No placeholder content (CHK-66)
- [ ] Security checks pass (§10 matrix)
- [ ] Automated tests pass (CHK-84-87)
- [ ] Production deployment check passes (CHK-79-81)
- [ ] Supabase migration readiness documented (§13)
- [ ] No HIGH blockers (SEC-001, NAV-001, DATA-003, TEST-001, CONTENT-001 closed)
- [ ] No unresolved release blockers

**Final status: NOT CERTIFIED** until every item above is verified with the evidence artifacts listed per check.

---

## 16. Master Blocker List
| Blocker | Owner finding | Fix-verification ref | Severity |
|---------|---------------|----------------------|----------|
| Predictable session tokens | SEC-001 | CHK-11-01/85-02 | CRITICAL |
| False "8+ shop products" claim vs empty catalog | DATA-003 | CHK-22-02/29-02/67-01 | CRITICAL |
| Zero automated tests / no CI | TEST-001 | CHK-84-03/87-01 | CRITICAL |
| Dead admin navigation (5 links) | NAV-001 | CHK-17-01 | CRITICAL |
| Unverifiable business/regulatory claims | CONTENT-001 | CHK-64-01 | HIGH |
| No error/loading/404 boundaries | UX-002 | CHK-35/36/37 | HIGH |
| No security headers | – | CHK-69 | HIGH |
| Missing SEO kit + favicon | SEO-001 | CHK-57/58/59/60/63 | HIGH |
| No backups/restore, DB exposed in git | DATA-001/SEC-004 | CHK-01-03/83 | HIGH |
| Rate limiter per-instance | SEC-002 | CHK-13-03/82-02 | MEDIUM |

*End of certification specification.*