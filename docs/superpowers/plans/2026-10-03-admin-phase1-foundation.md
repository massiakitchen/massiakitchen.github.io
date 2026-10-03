# Admin Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A staff-only `/admin/` area on massiakitchen.github.io: email/password login, staff allow-list check, navigation shell with empty sections, and Firestore security rules proven by emulator tests.

**Architecture:** Static ES-module pages under `admin/` load the Firebase JS SDK from gstatic (no build step, like the rest of the site). Pure logic lives in `admin/lib/*.js` and is unit-tested with `node --test`. Firestore rules allow access only to emails listed in `staff/{email}` with `active == true`, and are tested against the Firestore emulator with `@firebase/rules-unit-testing`. A browser end-to-end test drives the real login page against the Auth + Firestore emulators with `puppeteer-core` and the system Chromium.

**Tech Stack:** Firebase JS SDK 12.19.0 (gstatic ESM in the browser, npm `firebase@12.19.0` in tests), `firebase-tools@15.32.1` (emulators), `@firebase/rules-unit-testing@5.0.2`, `puppeteer-core@25.12.0` + `/usr/bin/chromium`, Node 24 `node --test`, Java 25 (emulator runtime, already installed).

**Spec:** `docs/superpowers/specs/2026-10-03-admin-dashboard-maintenance-design.md` (sections 2, 3, 6, 7).

## Global Constraints

- The public site is served from the repository root by GitHub Pages with **no build step**. Nothing in `admin/` may require Vite or any bundler; production must not depend on `dist/`.
- Firebase SDK in the browser: `https://www.gstatic.com/firebasejs/12.19.0/<module>.js` — exactly this version everywhere.
- UI language Arabic, `dir="rtl"`, `lang="ar"`; brand colors from `css/vars.css` (`--gold` etc.) may be reused by importing `../css/vars.css`.
- `admin/` must not be indexed: `<meta name="robots" content="noindex, nofollow">` on every admin page and `Disallow: /admin/` in `robots.txt`.
- Staff document id = email trimmed and lower-cased. Only `staff/{email}` with `active == true` grants access. The dashboard never writes to `staff`.
- Collections the dashboard may use (Phases 1–3): `customers`, `maintenances`, `site`, `publishes`. Every other path is denied.
- npm packages are **devDependencies only** (tools/tests). Exact versions as listed in Tech Stack.
- Storage (images) is **not** part of Phase 1 (Firebase Storage needs the Blaze plan since Feb 2026 — decision deferred to Phase 2).
- Emulator project id for tests and local runs: `demo-massia`. Ports: auth 9099, firestore 8080, emulator UI disabled.

## Review Focus

- Email typed with capitals or spaces at login (`" Ahmed@Gmail.com "`) must match the staff doc `ahmed@gmail.com` → Task 2 test `normalizeEmail`, Task 1 rules test "uppercase token email".
- A signed-in user whose staff doc is missing must see a clear Arabic "not authorized" screen (not a blank page or console error) → Task 3 e2e "non-staff user".
- A staff member set to `active: false` loses data access immediately → Task 1 rules test "inactive staff denied".
- A staff member must not be able to add/modify staff records (privilege escalation) → Task 1 rules test "staff cannot write staff".
- Unknown hash routes (`#/foo`, `#/customers/%E2%9C%93`) must not crash the shell → Task 2 `parseRoute` tests.

---

### Task 0: Create the real Firebase project (Claude + owner, not an agent)

**Files:** none in this task (config is written in Task 4).

- [ ] **Step 1:** Claude runs the Firebase MCP `firebase_login` and the owner completes the Google sign-in in the browser.
- [ ] **Step 2:** Claude creates project `massia-admin` (or the first free variant of that id) with `firebase_create_project`, then a Web app `massia-admin-web` with `firebase_create_app`, and reads the web config with `firebase_get_sdk_config`.
- [ ] **Step 3:** Owner, in Firebase Console: Build → Firestore Database → Create database (production mode, location `eur3` (europe-west) or `nam5`), and Build → Authentication → Get started → Sign-in method → **Email/Password → Enable**.
- [ ] **Step 4:** Owner sends the list of staff emails. Claude records them for Task 4.

Tasks 1–3 do **not** depend on Task 0 (they use the emulator project `demo-massia`), so they can run in parallel with it.

---

### Task 1: Firestore rules + emulator tests

**Files:**
- Modify: `package.json`
- Create: `firebase.json`, `firestore.rules`, `test/rules/firestore.rules.test.js`
- Modify: `.gitignore` (append emulator logs)

**Interfaces:**
- Produces: `firestore.rules` (deployed in Task 4); npm scripts `test`, `test:rules`, `emulators` used by Tasks 2–4.

- [ ] **Step 1: Add tooling to `package.json`**

Replace the whole file with:

```json
{
  "name": "massia-kitchen",
  "version": "1.0.0",
  "description": "Massia Kitchen Website",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test test/admin/",
    "test:rules": "firebase emulators:exec --only firestore --project demo-massia \"node --test test/rules/\"",
    "test:e2e": "firebase emulators:exec --only auth,firestore --project demo-massia \"node --test test/e2e/\"",
    "emulators": "firebase emulators:start --only auth,firestore --project demo-massia"
  },
  "devDependencies": {
    "@firebase/rules-unit-testing": "5.0.2",
    "firebase": "12.19.0",
    "firebase-tools": "15.32.1",
    "puppeteer-core": "25.12.0",
    "vite": "^5.0.0"
  }
}
```

Run: `npm install`
Expected: exits 0, `node_modules/.bin/firebase` exists.

- [ ] **Step 2: Create `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "emulators": {
    "auth": { "host": "127.0.0.1", "port": 9099 },
    "firestore": { "host": "127.0.0.1", "port": 8080 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
```

Append to `.gitignore`:

```
firebase-debug.log
firestore-debug.log
```

- [ ] **Step 3: Write the failing rules tests** — `test/rules/firestore.rules.test.js`

```js
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-massia',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'staff/ahmed@example.com'), { name: 'Ahmed', active: true });
    await setDoc(doc(db, 'staff/old@example.com'), { name: 'Old', active: false });
    await setDoc(doc(db, 'customers/c1'), { name: 'عميل' });
  });
});

const as = (email) => env.authenticatedContext(`uid-${email}`, { email }).firestore();

describe('firestore rules', () => {
  test('anonymous visitor cannot read customers', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'customers/c1')));
  });

  test('signed-in non-staff cannot read customers', async () => {
    await assertFails(getDoc(doc(as('stranger@example.com'), 'customers/c1')));
  });

  test('active staff can read and write customers', async () => {
    const db = as('ahmed@example.com');
    await assertSucceeds(getDoc(doc(db, 'customers/c1')));
    await assertSucceeds(setDoc(doc(db, 'customers/c2'), { name: 'جديد' }));
  });

  test('uppercase token email still matches lower-case staff doc', async () => {
    await assertSucceeds(getDoc(doc(as('Ahmed@Example.com'), 'customers/c1')));
  });

  test('inactive staff denied', async () => {
    await assertFails(getDoc(doc(as('old@example.com'), 'customers/c1')));
  });

  test('staff can read only their own staff doc', async () => {
    const db = as('ahmed@example.com');
    await assertSucceeds(getDoc(doc(db, 'staff/ahmed@example.com')));
    await assertFails(getDoc(doc(db, 'staff/old@example.com')));
  });

  test('signed-in non-staff can read own (missing) staff doc to learn they are not staff', async () => {
    await assertSucceeds(getDoc(doc(as('stranger@example.com'), 'staff/stranger@example.com')));
  });

  test('staff cannot write staff (no privilege escalation)', async () => {
    const db = as('ahmed@example.com');
    await assertFails(setDoc(doc(db, 'staff/new@example.com'), { active: true }));
    await assertFails(setDoc(doc(db, 'staff/old@example.com'), { active: true }));
  });

  test('staff can use maintenances, site, publishes', async () => {
    const db = as('ahmed@example.com');
    await assertSucceeds(setDoc(doc(db, 'maintenances/m1'), { status: 'new' }));
    await assertSucceeds(setDoc(doc(db, 'site/draft'), { sections: [] }));
    await assertSucceeds(setDoc(doc(db, 'publishes/p1'), { status: 'pending' }));
  });

  test('staff cannot write unknown collections', async () => {
    await assertFails(setDoc(doc(as('ahmed@example.com'), 'foo/bar'), { x: 1 }));
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Create an empty `firestore.rules` containing only:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  }
}
```

Run: `npm run test:rules`
Expected: FAIL — the four `assertSucceeds` tests fail with `PERMISSION_DENIED`.

- [ ] **Step 5: Write the rules** — replace `firestore.rules` with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedInEmail() {
      return request.auth != null && request.auth.token.email is string
        ? request.auth.token.email.lower()
        : null;
    }

    function staffPath() {
      return /databases/$(database)/documents/staff/$(signedInEmail());
    }

    function isStaff() {
      return signedInEmail() != null
        && exists(staffPath())
        && get(staffPath()).data.active == true;
    }

    // Each signed-in user may read only their own staff record (used by the
    // dashboard to show "not authorized"). Nobody writes staff from the client.
    match /staff/{email} {
      allow read: if signedInEmail() != null && signedInEmail() == email;
      allow write: if false;
    }

    match /{collection}/{docId} {
      allow read, write: if collection in ['customers', 'maintenances', 'site', 'publishes']
        && isStaff();
    }
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test:rules`
Expected: PASS — 10 tests, 0 failures.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json firebase.json firestore.rules test/rules/firestore.rules.test.js .gitignore
git commit -m "feat(admin): firestore staff allow-list rules with emulator tests"
```

---

### Task 2: Pure admin helpers (routing, email, auth error messages)

**Files:**
- Create: `admin/lib/router.js`, `admin/lib/staff.js`, `admin/lib/auth-errors.js`
- Test: `test/admin/router.test.js`, `test/admin/staff.test.js`, `test/admin/auth-errors.test.js`

**Interfaces:**
- Produces (used by Task 3):
  - `ROUTES: string[]` = `['home','customers','maintenances','content','publish']`
  - `parseRoute(hash: string) → { name: string, params: string[] }` — `name` is a member of `ROUTES` or `'not-found'`
  - `normalizeEmail(email: unknown) → string` (trimmed, lower-case, `''` for non-strings)
  - `staffStatus(data: object|undefined) → 'active'|'inactive'|'missing'`
  - `authErrorMessage(code: string) → string` (Arabic)

If `package.json` does not yet have the `test` script (Task 1 not merged), add `"test": "node --test test/admin/"` to `scripts`.

- [ ] **Step 1: Write the failing tests**

`test/admin/router.test.js`
```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRoute, ROUTES } from '../../admin/lib/router.js';

test('empty hash is home', () => {
  assert.deepEqual(parseRoute(''), { name: 'home', params: [] });
  assert.deepEqual(parseRoute('#'), { name: 'home', params: [] });
  assert.deepEqual(parseRoute('#/'), { name: 'home', params: [] });
  assert.deepEqual(parseRoute(undefined), { name: 'home', params: [] });
});

test('known routes with params', () => {
  assert.deepEqual(parseRoute('#/customers'), { name: 'customers', params: [] });
  assert.deepEqual(parseRoute('#/customers/abc123'), { name: 'customers', params: ['abc123'] });
  assert.deepEqual(parseRoute('#/maintenances/m1/edit'), { name: 'maintenances', params: ['m1', 'edit'] });
});

test('params are URI-decoded and malformed encodings do not throw', () => {
  assert.deepEqual(parseRoute('#/customers/%E2%9C%93'), { name: 'customers', params: ['✓'] });
  assert.deepEqual(parseRoute('#/customers/%E2%9C'), { name: 'customers', params: ['%E2%9C'] });
});

test('unknown route is not-found', () => {
  assert.deepEqual(parseRoute('#/foo'), { name: 'not-found', params: [] });
  assert.deepEqual(parseRoute('#/__proto__'), { name: 'not-found', params: [] });
});

test('ROUTES lists the shell sections', () => {
  assert.deepEqual(ROUTES, ['home', 'customers', 'maintenances', 'content', 'publish']);
});
```

`test/admin/staff.test.js`
```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeEmail, staffStatus } from '../../admin/lib/staff.js';

test('normalizeEmail trims and lower-cases', () => {
  assert.equal(normalizeEmail('  Ahmed@Gmail.COM '), 'ahmed@gmail.com');
  assert.equal(normalizeEmail(null), '');
  assert.equal(normalizeEmail(42), '');
});

test('staffStatus', () => {
  assert.equal(staffStatus(undefined), 'missing');
  assert.equal(staffStatus({ active: true }), 'active');
  assert.equal(staffStatus({ active: false }), 'inactive');
  assert.equal(staffStatus({}), 'inactive');
  assert.equal(staffStatus({ active: 'true' }), 'inactive');
});
```

`test/admin/auth-errors.test.js`
```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authErrorMessage } from '../../admin/lib/auth-errors.js';

test('known Firebase auth codes map to Arabic messages', () => {
  assert.equal(authErrorMessage('auth/invalid-credential'), 'الإيميل أو كلمة السر غير صحيحة');
  assert.equal(authErrorMessage('auth/wrong-password'), 'الإيميل أو كلمة السر غير صحيحة');
  assert.equal(authErrorMessage('auth/user-not-found'), 'الإيميل أو كلمة السر غير صحيحة');
  assert.equal(authErrorMessage('auth/invalid-email'), 'صيغة الإيميل غير صحيحة');
  assert.equal(authErrorMessage('auth/too-many-requests'), 'محاولات كثيرة، حاول مرة أخرى بعد قليل');
  assert.equal(authErrorMessage('auth/network-request-failed'), 'لا يوجد اتصال بالإنترنت');
  assert.equal(authErrorMessage('auth/user-disabled'), 'هذا الحساب موقوف');
});

test('unknown codes get a generic message', () => {
  assert.equal(authErrorMessage('auth/something-new'), 'حدث خطأ غير متوقع، حاول مرة أخرى');
  assert.equal(authErrorMessage(undefined), 'حدث خطأ غير متوقع، حاول مرة أخرى');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for the three `admin/lib` modules.

- [ ] **Step 3: Implement**

`admin/lib/router.js`
```js
// Hash router for the admin shell: "#/customers/abc" -> { name: 'customers', params: ['abc'] }
export const ROUTES = ['home', 'customers', 'maintenances', 'content', 'publish'];

function safeDecode(part) {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

export function parseRoute(hash) {
  const raw = String(hash ?? '').replace(/^#\/?/, '');
  const [name, ...rest] = raw.split('/').filter(Boolean);
  if (!name) return { name: 'home', params: [] };
  if (!ROUTES.includes(name)) return { name: 'not-found', params: [] };
  return { name, params: rest.map(safeDecode) };
}
```

`admin/lib/staff.js`
```js
// Staff documents are keyed by the lower-cased, trimmed email.
export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function staffStatus(data) {
  if (!data) return 'missing';
  return data.active === true ? 'active' : 'inactive';
}
```

`admin/lib/auth-errors.js`
```js
const WRONG_CREDENTIALS = 'الإيميل أو كلمة السر غير صحيحة';

const MESSAGES = {
  'auth/invalid-credential': WRONG_CREDENTIALS,
  'auth/wrong-password': WRONG_CREDENTIALS,
  'auth/user-not-found': WRONG_CREDENTIALS,
  'auth/invalid-email': 'صيغة الإيميل غير صحيحة',
  'auth/too-many-requests': 'محاولات كثيرة، حاول مرة أخرى بعد قليل',
  'auth/network-request-failed': 'لا يوجد اتصال بالإنترنت',
  'auth/user-disabled': 'هذا الحساب موقوف',
};

export function authErrorMessage(code) {
  return MESSAGES[code] ?? 'حدث خطأ غير متوقع، حاول مرة أخرى';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests in `test/admin/`.

- [ ] **Step 5: Commit**

```bash
git add admin/lib test/admin
git commit -m "feat(admin): routing, staff and auth-error helpers"
```

---

### Task 3: Admin shell (login, staff gate, navigation) + browser e2e

Depends on Task 1 (scripts, emulator config) and Task 2 (helpers).

**Files:**
- Create: `admin/index.html`, `admin/admin.css`, `admin/firebase-config.js`, `admin/firebase.js`, `admin/app.js`, `admin/views.js`
- Create: `scripts/seed-emulator.mjs`, `test/e2e/admin-login.test.js`
- Modify: `robots.txt`

**Interfaces:**
- Consumes: `parseRoute`, `ROUTES`, `normalizeEmail`, `staffStatus`, `authErrorMessage` (Task 2).
- Produces: `admin/firebase.js` exports `app`, `auth`, `db` (used by Phases 2–3); `admin/views.js` exports `renderRoute(route, container)` that Phase 2 extends; DOM ids `#login-view`, `#denied-view`, `#shell`, `#main`, `#login-form`, `#login-error`, `#user-email`, `#logout-btn` (used by the e2e test).

- [ ] **Step 1: `admin/firebase-config.js`** (emulator/demo values; Task 4 replaces them with the real project config)

```js
// Firebase web config. These values are public by design; access is enforced
// by firestore.rules. Replaced with the real project config in Phase 1 Task 4.
export const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo-massia.firebaseapp.com',
  projectId: 'demo-massia',
  appId: 'demo-app',
};
```

- [ ] **Step 2: `admin/firebase.js`**

```js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { connectAuthEmulator, getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Local testing: open /admin/?emulator on localhost to use the Firebase emulators.
const useEmulator =
  ['localhost', '127.0.0.1'].includes(location.hostname) &&
  new URLSearchParams(location.search).has('emulator');

export const app = initializeApp(useEmulator ? { ...firebaseConfig, projectId: 'demo-massia' } : firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  // Offline cache so technicians with weak signal can keep working.
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
```

- [ ] **Step 3: `admin/index.html`**

```html
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>لوحة إدارة الماسية</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="../css/vars.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <section id="login-view" class="center-card" hidden>
    <img src="../images/logo-light.webp" alt="الماسية للمطابخ" class="logo" width="180" height="54">
    <h1>لوحة الإدارة</h1>
    <form id="login-form" novalidate>
      <label>الإيميل <input id="login-email" type="email" autocomplete="username" required></label>
      <label>كلمة السر <input id="login-password" type="password" autocomplete="current-password" required></label>
      <p id="login-error" class="error" role="alert" hidden></p>
      <button type="submit" class="btn primary">دخول</button>
      <button type="button" id="reset-btn" class="btn link">نسيت كلمة السر؟</button>
    </form>
  </section>

  <section id="denied-view" class="center-card" hidden>
    <h1>غير مصرح لك بالدخول</h1>
    <p>الحساب <b id="denied-email"></b> غير مسجل في قائمة موظفي المصنع أو موقوف. تواصل مع المدير.</p>
    <button type="button" id="denied-logout" class="btn">تسجيل خروج</button>
  </section>

  <div id="shell" hidden>
    <header class="topbar">
      <strong>الماسية — لوحة الإدارة</strong>
      <nav id="nav" aria-label="أقسام اللوحة"></nav>
      <span id="user-email" class="muted"></span>
      <button type="button" id="logout-btn" class="btn">خروج</button>
    </header>
    <main id="main" tabindex="-1"></main>
  </div>

  <p id="boot" class="center-card muted">جارٍ التحميل…</p>
  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 4: `admin/views.js`**

```js
import { ROUTES } from './lib/router.js';

export const ROUTE_LABELS = {
  home: 'الرئيسية',
  customers: 'العملاء',
  maintenances: 'الصيانات',
  content: 'محتوى الموقع',
  publish: 'النشر',
};

export function renderNav(nav, current) {
  nav.replaceChildren(
    ...ROUTES.map((name) => {
      const a = document.createElement('a');
      a.href = `#/${name}`;
      a.textContent = ROUTE_LABELS[name];
      if (name === current) a.setAttribute('aria-current', 'page');
      return a;
    }),
  );
}

// Phase 2 and 3 replace the placeholder bodies of these sections.
export function renderRoute(route, container) {
  const h1 = document.createElement('h1');
  const p = document.createElement('p');
  p.className = 'muted';
  if (route.name === 'not-found') {
    h1.textContent = 'الصفحة غير موجودة';
    const back = document.createElement('a');
    back.href = '#/home';
    back.textContent = 'رجوع للرئيسية';
    p.append(back);
  } else {
    h1.textContent = ROUTE_LABELS[route.name];
    p.textContent = 'هذا القسم قيد الإنشاء.';
  }
  container.replaceChildren(h1, p);
  container.focus();
}
```

- [ ] **Step 5: `admin/app.js`**

```js
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { auth, db } from './firebase.js';
import { authErrorMessage } from './lib/auth-errors.js';
import { parseRoute } from './lib/router.js';
import { normalizeEmail, staffStatus } from './lib/staff.js';
import { renderNav, renderRoute } from './views.js';

const $ = (id) => document.getElementById(id);
const views = ['boot', 'login-view', 'denied-view', 'shell'];

function show(id) {
  for (const v of views) $(v).hidden = v !== id;
}

function showLoginError(message) {
  const el = $('login-error');
  el.textContent = message;
  el.hidden = !message;
}

function route() {
  const current = parseRoute(location.hash);
  renderNav($('nav'), current.name);
  renderRoute(current, $('main'));
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoginError('');
  const email = normalizeEmail($('login-email').value);
  const password = $('login-password').value;
  if (!email || !password) {
    showLoginError('أدخل الإيميل وكلمة السر');
    return;
  }
  const button = e.submitter;
  if (button) button.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    showLoginError(authErrorMessage(err.code));
  } finally {
    if (button) button.disabled = false;
  }
});

$('reset-btn').addEventListener('click', async () => {
  const email = normalizeEmail($('login-email').value);
  if (!email) {
    showLoginError('اكتب الإيميل أولاً ثم اضغط "نسيت كلمة السر"');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showLoginError('تم إرسال رابط تغيير كلمة السر إلى إيميلك');
  } catch (err) {
    showLoginError(authErrorMessage(err.code));
  }
});

for (const id of ['logout-btn', 'denied-logout']) {
  $(id).addEventListener('click', () => signOut(auth));
}

window.addEventListener('hashchange', () => {
  if (!$('shell').hidden) route();
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    show('login-view');
    return;
  }
  const email = normalizeEmail(user.email);
  let status = 'missing';
  try {
    const snap = await getDoc(doc(db, 'staff', email));
    status = staffStatus(snap.exists() ? snap.data() : undefined);
  } catch {
    status = 'missing';
  }
  if (status !== 'active') {
    $('denied-email').textContent = email;
    show('denied-view');
    return;
  }
  $('user-email').textContent = email;
  show('shell');
  route();
});
```

- [ ] **Step 6: `admin/admin.css`**

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Cairo', system-ui, sans-serif;
  background: #f6f4ef;
  color: #1f1f1f;
}
[hidden] { display: none !important; }
.muted { color: #6b6b6b; }
.error { color: #b42318; margin: 0; }
.center-card {
  max-width: 420px;
  margin: 10vh auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .08);
  text-align: center;
}
.logo { display: block; margin: 0 auto 8px; height: auto; max-width: 180px; }
form { display: grid; gap: 14px; text-align: start; }
label { display: grid; gap: 6px; font-weight: 600; }
input {
  font: inherit;
  padding: 10px 12px;
  border: 1px solid #d6d2c8;
  border-radius: 10px;
}
input:focus-visible, .btn:focus-visible, nav a:focus-visible {
  outline: 3px solid var(--gold, #c9a227);
  outline-offset: 2px;
}
.btn {
  font: inherit;
  padding: 10px 16px;
  border: 1px solid #d6d2c8;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}
.btn.primary { background: var(--gold, #c9a227); border-color: transparent; color: #1f1f1f; font-weight: 700; }
.btn.link { border: 0; background: none; color: #6b5a1e; text-decoration: underline; }
.btn:disabled { opacity: .6; cursor: progress; }
.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e7e3d9;
}
nav { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
nav a {
  padding: 6px 12px;
  border-radius: 999px;
  color: inherit;
  text-decoration: none;
}
nav a[aria-current='page'] { background: #f1e7c4; font-weight: 700; }
main { padding: 24px 20px; max-width: 1100px; margin: 0 auto; outline: none; }
@media (max-width: 600px) {
  .topbar { padding: 10px 14px; }
  main { padding: 16px 14px; }
}
```

- [ ] **Step 7: Block indexing** — replace `robots.txt` with:

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://massiakitchen.github.io/sitemap.xml
```

- [ ] **Step 8: Emulator seed script** — `scripts/seed-emulator.mjs`

```js
// Seeds the local emulators (project demo-massia) with one active staff user,
// one signed-up user who is not staff, and one inactive staff user.
// Requires FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST (set by `firebase emulators:exec`).
const PROJECT = 'demo-massia';
const AUTH = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
const FS = `http://${process.env.FIRESTORE_EMULATOR_HOST}`;

export const USERS = {
  staff: { email: 'staff@massia.test', password: 'staff-pass-123' },
  stranger: { email: 'stranger@massia.test', password: 'stranger-pass-123' },
  inactive: { email: 'old@massia.test', password: 'old-pass-123' },
};

async function signUp({ email, password }) {
  const res = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) throw new Error(`signUp ${email}: ${res.status} ${await res.text()}`);
}

async function putStaff(email, active) {
  const url = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/staff/${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', authorization: 'Bearer owner' },
    body: JSON.stringify({ fields: { name: { stringValue: email }, active: { booleanValue: active } } }),
  });
  if (!res.ok) throw new Error(`staff ${email}: ${res.status} ${await res.text()}`);
}

export async function seed() {
  for (const u of Object.values(USERS)) await signUp(u);
  await putStaff(USERS.staff.email, true);
  await putStaff(USERS.inactive.email, false);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await seed();
  console.log('seeded', Object.values(USERS).map((u) => u.email).join(', '));
}
```

- [ ] **Step 9: Write the failing e2e test** — `test/e2e/admin-login.test.js`

```js
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { seed, USERS } from '../../scripts/seed-emulator.mjs';

const ROOT = process.cwd();
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };
let server;
let browser;
let base;

before(async () => {
  await seed();
  server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = join(ROOT, path.endsWith('/') ? `${path}index.html` : path);
    try {
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
});

after(async () => {
  await browser?.close();
  server?.close();
});

describe('admin login', () => {
  test('active staff reaches the shell and can navigate', async () => {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${base}/admin/?emulator`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#login-view:not([hidden])');
    await page.type('#login-email', `  ${USERS.staff.email.toUpperCase()} `);
    await page.type('#login-password', USERS.staff.password);
    await page.click('#login-form button[type=submit]');
    await page.waitForSelector('#shell:not([hidden])', { timeout: 15000 });
    assert.equal(await page.$eval('#user-email', (el) => el.textContent), USERS.staff.email);
    await page.evaluate(() => { location.hash = '#/customers'; });
    await page.waitForFunction(() => document.querySelector('#main h1')?.textContent === 'العملاء');
    await page.evaluate(() => { location.hash = '#/nope'; });
    await page.waitForFunction(() => document.querySelector('#main h1')?.textContent === 'الصفحة غير موجودة');
    assert.deepEqual(errors, []);
    await ctx.close();
  });

  test('non-staff user sees the not-authorized screen', async () => {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.goto(`${base}/admin/?emulator`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#login-view:not([hidden])');
    await page.type('#login-email', USERS.stranger.email);
    await page.type('#login-password', USERS.stranger.password);
    await page.click('#login-form button[type=submit]');
    await page.waitForSelector('#denied-view:not([hidden])', { timeout: 15000 });
    assert.equal(await page.$eval('#denied-email', (el) => el.textContent), USERS.stranger.email);
    await ctx.close();
  });

  test('inactive staff sees the not-authorized screen', async () => {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.goto(`${base}/admin/?emulator`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#login-view:not([hidden])');
    await page.type('#login-email', USERS.inactive.email);
    await page.type('#login-password', USERS.inactive.password);
    await page.click('#login-form button[type=submit]');
    await page.waitForSelector('#denied-view:not([hidden])', { timeout: 15000 });
    await ctx.close();
  });

  test('wrong password shows an Arabic error and stays on login', async () => {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.goto(`${base}/admin/?emulator`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#login-view:not([hidden])');
    await page.type('#login-email', USERS.staff.email);
    await page.type('#login-password', 'wrong-password');
    await page.click('#login-form button[type=submit]');
    await page.waitForSelector('#login-error:not([hidden])', { timeout: 15000 });
    assert.equal(await page.$eval('#login-error', (el) => el.textContent), 'الإيميل أو كلمة السر غير صحيحة');
    await ctx.close();
  });
});
```

Each test uses its own browser context so auth state never leaks between tests.

- [ ] **Step 10: Run e2e before the shell exists to verify it fails**

Temporarily rename `admin/app.js` to `admin/app.js.off`, run `npm run test:e2e`.
Expected: FAIL — timeout waiting for `#login-view:not([hidden])` (only "جارٍ التحميل…" is shown). Rename it back.

- [ ] **Step 11: Run all tests**

Run: `npm test && npm run test:rules && npm run test:e2e`
Expected: all PASS; the e2e run prints 4 passing tests.

- [ ] **Step 12: Check the public site is unaffected**

Run: `python3 -m http.server 4190 --bind 127.0.0.1` (background), then
`chromium --headless=new --no-sandbox --disable-gpu --enable-logging=stderr --v=0 --virtual-time-budget=8000 --dump-dom http://127.0.0.1:4190/ 2>/tmp/site.log >/dev/null; grep -E 'Uncaught|TypeError|ReferenceError' /tmp/site.log`
Expected: no output (no JS errors on the public homepage). Stop the server.

- [ ] **Step 13: Commit**

```bash
git add admin scripts/seed-emulator.mjs test/e2e robots.txt
git commit -m "feat(admin): login, staff gate and navigation shell with e2e tests"
```

---

### Task 4: Connect the real project, deploy rules, create staff (Claude + owner)

Depends on Task 0 and Tasks 1–3 merged.

**Files:**
- Modify: `admin/firebase-config.js` (real web config from Task 0)
- Create: `.firebaserc`

- [ ] **Step 1:** Write `.firebaserc`:

```json
{ "projects": { "default": "<project id created in Task 0>" } }
```

and replace the object in `admin/firebase-config.js` with the exact config returned by `firebase_get_sdk_config` in Task 0.

- [ ] **Step 2:** Deploy rules: `npx firebase deploy --only firestore:rules`
Expected: `Deploy complete!`

- [ ] **Step 3:** Owner creates each staff user in Console → Authentication → Add user (email + temporary password). Claude creates `staff/{lower-cased email}` documents `{ name, active: true, addedAt: <now> }` with the Firebase MCP / Console.

- [ ] **Step 4:** Verify against the real project: open `http://127.0.0.1:4190/admin/` (no `?emulator`), log in as one staff user → shell shows; log in as an email not in `staff` → "غير مصرح". Screenshot both.

- [ ] **Step 5:** Commit and, **after owner approval**, push to `main`:

```bash
git add .firebaserc admin/firebase-config.js
git commit -m "chore(admin): connect production Firebase project"
```

## Execution

- Agents: muse `#xhigh` via `tools/muse-run.sh`, each task in its own worktree branched from `origin/main` (with this plan + spec committed).
- Parallel: Task 1 ∥ Task 2 ∥ Task 0. Task 3 after Tasks 1 and 2 are merged. Task 4 last.
- Claude reviews every task branch (diff, all test commands above, public-site check) before merging.
