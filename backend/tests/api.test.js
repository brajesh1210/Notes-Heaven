/**
 * Backend API integration tests (node:test + in-memory MongoDB).
 * Run with: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// newer Linux distros / CI images only ship mongod >= 7.0.3
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';
const { MongoMemoryServer } = await import('mongodb-memory-server');

const dbPath = new URL(`../.tmp-mongo-${process.pid}`, import.meta.url).pathname;
fs.mkdirSync(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({ instance: { dbPath } });
process.env.MONGO_URI = mongod.getUri('nh-tests');
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/app.js');
const mongoose = (await import('mongoose')).default;
await mongoose.connect(process.env.MONGO_URI);

const server = app.listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/api`;

let cookie = '';
const call = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const sc = res.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  return { status: res.status, body: json };
};

const doc = (text) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

let noteId;
let note2Id;
let folderId;
let childFolderId;

test('health endpoint is public', async () => {
  const res = await fetch(`${BASE}/health`);
  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.success, true);
});

test('register creates user + starter folders', async () => {
  const r = await call('POST', '/auth/register', { name: 'Test User', email: 'test@nh.dev', password: 'secret123' });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.user.email, 'test@nh.dev');
  const folders = await call('GET', '/folders');
  assert.ok(folders.body.data.folders.length >= 4);
});

test('duplicate email is rejected', async () => {
  const r = await call('POST', '/auth/register', { name: 'X', email: 'test@nh.dev', password: 'secret123' });
  assert.equal(r.status, 409);
});

test('login rejects wrong password and accepts right one', async () => {
  const bad = await call('POST', '/auth/login', { email: 'test@nh.dev', password: 'nope' });
  assert.equal(bad.status, 401);
  const good = await call('POST', '/auth/login', { email: 'test@nh.dev', password: 'secret123' });
  assert.equal(good.status, 200);
});

test('me requires auth', async () => {
  const saved = cookie;
  cookie = '';
  const r = await call('GET', '/auth/me');
  assert.equal(r.status, 401);
  cookie = saved;
});

test('folders nest and expose paths', async () => {
  const a = await call('POST', '/folders', { name: 'Sem 5' });
  assert.equal(a.status, 201);
  folderId = a.body.data.folder.id;
  const b = await call('POST', '/folders', { name: 'Physics', parent: folderId });
  assert.equal(b.status, 201);
  assert.equal(b.body.data.folder.path, 'Sem 5/Physics');
  childFolderId = b.body.data.folder.id;
});

test('duplicate folder name in same parent is rejected', async () => {
  const r = await call('POST', '/folders', { name: 'Physics', parent: folderId });
  assert.equal(r.status, 400);
});

test('note create validates folder ids', async () => {
  const r = await call('POST', '/notes', { title: 'x', folder: 'not-an-id' });
  assert.equal(r.status, 400);
});

test('note CRUD + autosave', async () => {
  const c = await call('POST', '/notes', { title: 'Business Environment', content: doc('summary text'), folder: folderId, tags: ['biz'] });
  assert.equal(c.status, 201);
  noteId = c.body.data.note.id;
  assert.equal(c.body.data.note.folder.name, 'Sem 5');
  assert.equal(c.body.data.note.tags[0].name, 'biz');

  const g = await call('GET', `/notes/${noteId}`);
  assert.equal(g.body.data.note.content.type, 'doc');
  assert.ok(g.body.data.note.wordCount > 0);

  const u = await call('PUT', `/notes/${noteId}`, { title: 'Business Environment v2', content: doc('summary text') });
  assert.equal(u.body.data.note.title, 'Business Environment v2');

  const a = await call('PATCH', `/notes/${noteId}/autosave`, { title: 'Autosaved title', content: doc('summary text') });
  assert.equal(a.status, 200);
});

test('pin, favorite, duplicate', async () => {
  const p = await call('PATCH', `/notes/${noteId}/pin`, { value: true });
  assert.equal(p.body.data.isPinned, true);
  const f = await call('PATCH', `/notes/${noteId}/favorite`, { value: true });
  assert.equal(f.body.data.isFavorite, true);
  const d = await call('POST', `/notes/${noteId}/duplicate`);
  assert.equal(d.status, 201);
  note2Id = d.body.data.note.id;
});

test('list filters: folder, favorite, pinned', async () => {
  const byFolder = await call('GET', `/notes?folder=${folderId}`);
  assert.ok(byFolder.body.data.notes.length >= 2);
  const fav = await call('GET', '/notes?favorite=true');
  assert.equal(fav.body.data.notes.length, 1);
  const pin = await call('GET', '/notes?pinned=true');
  assert.equal(pin.body.data.notes.length, 1);
});

test('search + suggestions', async () => {
  const s = await call('GET', '/search?q=autosaved');
  assert.ok(s.body.data.total >= 1);
  const sg = await call('GET', '/search/suggestions?q=phys');
  assert.ok(sg.body.data.suggestions.length >= 1);
});

test('tags list has counts', async () => {
  const t = await call('GET', '/tags');
  assert.ok(t.body.data.tags.find((x) => x.name === 'biz'));
});

test('bulk actions', async () => {
  const b = await call('PATCH', '/notes/bulk', { ids: [noteId, note2Id], action: 'tag', value: 'bulk' });
  assert.equal(b.body.data.updated, 2);
  const bad = await call('PATCH', '/notes/bulk', { ids: [], action: 'pin' });
  assert.equal(bad.status, 400);
});

test('versions: save, list, restore', async () => {
  await call('PUT', `/notes/${noteId}`, { title: 'v2', content: doc('summary text'), createVersion: true });
  const list = await call('GET', `/notes/${noteId}/versions`);
  assert.ok(list.body.data.versions.length >= 1);
  const idx = list.body.data.versions[0].index;
  const r = await call('POST', `/notes/${noteId}/versions/${idx}/restore`);
  assert.equal(r.status, 200);
  assert.equal(r.body.data.note.title, 'Autosaved title');
});

test('trash -> restore -> permanent', async () => {
  const t = await call('DELETE', `/notes/${note2Id}`);
  assert.equal(t.body.data.note.daysLeft, 5);
  const list = await call('GET', '/notes/trash');
  assert.equal(list.body.data.notes.length, 1);
  const r = await call('PATCH', `/notes/${note2Id}/restore`);
  assert.equal(r.body.data.note.isTrashed, false);
  await call('DELETE', `/notes/${note2Id}`);
  const p = await call('DELETE', `/notes/${note2Id}/permanent`);
  assert.equal(p.status, 200);
  const gone = await call('GET', `/notes/${note2Id}`);
  assert.equal(gone.status, 404);
});

test('folder delete moves notes', async () => {
  const n = await call('POST', '/notes', { title: 'child note', content: doc('x'), folder: childFolderId });
  const del = await call('DELETE', `/folders/${childFolderId}?mode=move&target=${folderId}`);
  assert.equal(del.status, 200);
  assert.equal(del.body.data.movedNotes, 1);
  const moved = await call('GET', `/notes/${n.body.data.note.id}`);
  assert.equal(moved.body.data.note.folder.id, folderId);
});

test('stats dashboard', async () => {
  const s = await call('GET', '/notes/stats/dashboard');
  assert.ok(s.body.data.totalNotes >= 1);
  assert.ok(s.body.data.folders >= 1);
});

test('profile update + email uniqueness', async () => {
  const u = await call('PUT', '/auth/profile', { name: 'Renamed', email: 'new@nh.dev' });
  assert.equal(u.body.data.user.name, 'Renamed');
  const dup = await call('PUT', '/auth/profile', { email: 'new@nh.dev' });
  assert.equal(dup.status, 200); // same email as own is a no-op
});

test('change password flow', async () => {
  const c = await call('PUT', '/auth/change-password', { currentPassword: 'secret123', newPassword: 'secret456' });
  assert.equal(c.status, 200);
  const login = await call('POST', '/auth/login', { email: 'new@nh.dev', password: 'secret456' });
  assert.equal(login.status, 200);
});

test('account deletion cascades', async () => {
  const d = await call('DELETE', '/auth/account');
  assert.equal(d.status, 200);
  const me = await call('GET', '/auth/me');
  assert.equal(me.status, 401);
});

test('teardown', async () => {
  server.close();
  await mongoose.connection.close();
  await mongod.stop();
  fs.rmSync(dbPath, { recursive: true, force: true });
});
