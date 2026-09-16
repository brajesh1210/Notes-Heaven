/**
 * DEMO MODE - in-memory mini-backend.
 *
 * Only for UI demos and testing. Runs via `npm run dev:demo`.
 * Not used in the real app - there the Express backend handles requests.
 * The logic here is a simplified version of the backend controllers.
 */

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

const p = (text) => ({ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] });
const h = (text, level = 2) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const ul = (items) => ({ type: 'bulletList', content: items.map((t) => ({ type: 'listItem', content: [p(t)] })) });
const ol = (items) => ({ type: 'orderedList', content: items.map((t) => ({ type: 'listItem', content: [p(t)] })) });
const pre = (text) => ({ type: 'codeBlock', attrs: { language: 'javascript' }, content: [{ type: 'text', text }] });
const doc = (...nodes) => ({ type: 'doc', content: nodes });

const html = (d) => {
  const r = (n) => {
    if (!n) return '';
    if (Array.isArray(n)) return n.map(r).join('');
    if (n.type === 'text') return n.text || '';
    const inner = r(n.content || []);
    if (n.type === 'doc') return inner;
    if (n.type === 'heading') return `<h${n.attrs?.level || 2}>${inner}</h${n.attrs?.level || 2}>`;
    if (n.type === 'paragraph') return `<p>${inner}</p>`;
    if (n.type === 'bulletList') return `<ul>${inner}</ul>`;
    if (n.type === 'orderedList') return `<ol>${inner}</ol>`;
    if (n.type === 'listItem') return `<li>${inner}</li>`;
    if (n.type === 'codeBlock') return `<pre><code>${inner}</code></pre>`;
    return inner;
  };
  return r(d);
};

const textOf = (d) => {
  const out = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.type === 'text' && n.text) out.push(n.text);
    if (n.content) n.content.forEach(walk);
  };
  walk(d);
  return out.join(' ').replace(/\s+/g, ' ').trim();
};

// ------------------------------------------------------------ seed data
const folder = (id, name, parent = null, path = null, depth = 0, color = '#1D4ED8') => ({
  id,
  name,
  parent,
  path: path || name,
  depth,
  color,
  isFavorite: false,
});

const db = {
  user: { id: 'u1', name: 'Brajesh Upadhyay', email: 'demo@notesheaven.app', avatar: '', provider: 'local', prefs: { theme: 'light' }, createdAt: hoursAgo(500) },
  folders: [
    folder('f1', 'Class 12', null, null, 0, '#1D4ED8'),
    folder('f2', 'Business Studies', 'f1', 'Class 12/Business Studies', 1, '#2563EB'),
    folder('f3', 'Accountancy', 'f1', 'Class 12/Accountancy', 1, '#0EA5E9'),
    folder('f4', 'JEE Preparation', null, null, 0, '#7C3AED'),
    folder('f5', 'Physics', 'f4', 'JEE Preparation/Physics', 1, '#8B5CF6'),
    folder('f6', 'Personal', null, null, 0, '#059669'),
    folder('f7', 'Work', null, null, 0, '#EA580C'),
  ],
  tags: [
    { id: 't1', name: 'business', color: '#1D4ED8' },
    { id: 't2', name: 'economics', color: '#0EA5E9' },
    { id: 't3', name: 'physics', color: '#7C3AED' },
    { id: 't4', name: 'important', color: '#DC2626' },
    { id: 't5', name: 'revision', color: '#059669' },
  ],
  notes: [],
  trashDays: 5,
};

const mkNote = (id, title, folderId, tagIds, nodes, { hours = 2, pinned = false, fav = false, trashed = false } = {}) => {
  const content = doc(...nodes);
  return {
    id,
    title,
    content,
    contentHtml: html(content),
    contentText: textOf(content),
    folderId,
    tagIds,
    isPinned: pinned,
    isFavorite: fav,
    color: null,
    coverImage: null,
    trashedAt: trashed ? hoursAgo(hours) : null,
    scheduledFor: trashed ? new Date(Date.now() + (db.trashDays * 24 - hours) * 3600 * 1000).toISOString() : null,
    createdAt: hoursAgo(hours + 24),
    updatedAt: hoursAgo(hours),
    lastEditedAt: hoursAgo(hours),
    versions: [],
  };
};

db.notes = [
  mkNote('n1', 'Business Environment - Chapter 1', 'f1', ['t1'], [h('1. Introduction'), ul(['Business environment refers to the sum total of all internal and external factors that influence a business.', 'It includes economic, social, political, legal, technological and natural factors.', 'It helps in identifying opportunities and threats.']), h('2. Components'), ol(['Internal Environment', 'External Environment'])], { hours: 2, pinned: true, fav: true }),
  mkNote('n2', 'Microeconomics - Introduction', 'f3', ['t2', 't4'], [h('What is Microeconomics?'), ul(['Individual unit level study', 'Demand & supply, elasticity, market structures']), pre('const revenue = (price, qty) => price * qty;')], { hours: 4 }),
  mkNote('n3', 'JEE Physics - Motion in a Straight Line', 'f5', ['t3', 't4'], [h('Key Formulas'), ol(['v = u + at', 's = ut + ½at²', 'v² = u² + 2as']), p('Slope of the v-t graph = acceleration, area = displacement.'), pre('// relative velocity\nv_ab = v_a - v_b;')], { hours: 6, fav: true }),
  mkNote('n4', 'Chemistry - Periodic Table', 'f4', [], [h('Groups & Periods'), ul(['Elements in a group share similar properties', 'Metallic character decreases from left to right across a period'])], { hours: 24 }),
  mkNote('n5', 'Personal Goals', 'f6', ['t5'], [h('2026 Goals'), ol(['Daily 2 hours DSA', 'Notes Heaven launch', 'Gym 5 days/week'])], { hours: 24 }),
  mkNote('n6', 'Business Studies Notes', 'f2', ['t1', 't5'], [p('Notes on management principles: planning, organising, staffing, directing and controlling.')], { hours: 24 }),
  mkNote('n7', 'Business Environment - Important Questions', 'f2', ['t1', 't4'], [p('Q1. Features of the business environment? Q2. Difference between micro and macro environment?')], { hours: 24 }),
  mkNote('n8', 'Principles of Management', 'f3', ['t1'], [ul(['Division of work', 'Authority & responsibility', 'Unity of command', 'Scalar chain'])], { hours: 72 }),
  mkNote('n9', 'Business Environment - Summary', 'f1', ['t1'], [p('Quick revision summary of Chapter 1.')], { hours: 96 }),
  mkNote('n10', 'Old meeting notes', 'f7', [], [p('This note is in the trash - it will be auto-deleted after 5 days.')], { hours: 120, trashed: true }),
];

// ------------------------------------------------------------ helpers
const tagObjs = (ids = []) => ids.map((id) => db.tags.find((t) => t.id === id)).filter(Boolean);

const ser = (n, withContent = false) => {
  const f = db.folders.find((x) => x.id === n.folderId);
  const words = (n.contentText || '').split(/\s+/).filter(Boolean).length;
  const out = {
    id: n.id,
    title: n.title,
    snippet: n.contentText?.slice(0, 160) || '',
    folder: f ? { id: f.id, name: f.name } : null,
    tags: tagObjs(n.tagIds).map((t) => ({ id: t.id, name: t.name, color: t.color })),
    isPinned: n.isPinned,
    isFavorite: n.isFavorite,
    color: n.color,
    coverImage: n.coverImage,
    wordCount: words,
    readingTime: Math.max(1, Math.ceil(words / 200)),
    isTrashed: Boolean(n.trashedAt),
    trashedAt: n.trashedAt,
    scheduledFor: n.scheduledFor,
    daysLeft: n.scheduledFor ? Math.max(0, Math.ceil((new Date(n.scheduledFor) - Date.now()) / 86400000)) : null,
    lastEditedAt: n.lastEditedAt,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
  if (withContent) {
    out.content = n.content;
    out.contentHtml = n.contentHtml;
    out.contentText = n.contentText;
    out.versionCount = n.versions.length;
  }
  return out;
};

const sorted = (list, sort = '-updatedAt') => {
  const arr = [...list];
  const byPinned = (a, b) => Number(b.isPinned) - Number(a.isPinned);
  if (sort === 'title') return arr.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'createdAt') return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sort === '-createdAt') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === 'updatedAt') return arr.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
  return arr.sort((a, b) => byPinned(a, b) || new Date(b.updatedAt) - new Date(a.updatedAt));
};

const okRes = (data, message = 'OK') => ({ data, message });
const err = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return Promise.reject(e);
};

const delay = (ms = 140) => new Promise((r) => setTimeout(r, ms));

const resolveTagIds = (names = []) =>
  names.map((raw) => {
    const name = String(raw).toLowerCase();
    const found = db.tags.find((t) => t.name === name);
    if (found) return found.id;
    const tag = { id: uid(), name, color: '#64748B' };
    db.tags.push(tag);
    return tag.id;
  });

// ------------------------------------------------------------ routes
export const demoApi = async (method, url, { params = {}, data = {} } = {}) => {
  await delay();
  const path = String(url).replace(/^\/+/, '').split('?')[0];
  const seg = path.split('/');
  const m = method.toLowerCase();

  // ---------------- auth ----------------
  if (path === 'auth/me') return okRes({ user: db.user }, 'Profile loaded');

  if (path === 'auth/login' && m === 'post') {
    db.user = { ...db.user, email: data.email || db.user.email };
    return okRes({ user: db.user, token: 'demo-token' }, `Welcome back, ${db.user.name.split(' ')[0]}!`);
  }

  if (path === 'auth/register' && m === 'post') {
    db.user = { ...db.user, name: data.name || db.user.name, email: data.email || db.user.email };
    return okRes({ user: db.user, token: 'demo-token' }, 'Account created! Welcome to Notes Heaven');
  }

  if (path === 'auth/logout') return okRes({}, 'Logged out successfully');
  if (path === 'auth/profile' && m === 'put') {
    db.user = { ...db.user, ...data };
    return okRes({ user: db.user }, 'Profile updated successfully');
  }
  if (path === 'auth/change-password' && m === 'put') {
    if (!data.newPassword || String(data.newPassword).length < 6) return err(400, 'New password must be at least 6 characters');
    return okRes({}, 'Password updated successfully');
  }
  if (path === 'auth/account' && m === 'delete') {
    return okRes({}, 'Account and all associated data deleted');
  }
  if (path === 'auth/forgot-password') {
    return okRes({ mailConfigured: false, devResetUrl: '/reset-password/demo-token' }, 'If this email is registered, a reset link has been sent.');
  }
  if (path === 'auth/providers') return okRes({ enabled: true, mailerEnabled: false, uploadsEnabled: false }, 'providers');

  // ---------------- folders ----------------
  if (seg[0] === 'folders') {
    if (!seg[1]) {
      if (m === 'get') {
        const withCounts = db.folders.map((f) => ({
          ...f,
          noteCount: db.notes.filter((n) => n.folderId === f.id && !n.trashedAt).length,
          breadcrumb: f.path,
        }));
        const tree = (parent = null) =>
          withCounts
            .filter((f) => f.parent === parent)
            .map((f) => ({ ...f, children: tree(f.id) }))
            .sort((a, b) => a.name.localeCompare(b.name));
        return okRes(
          { folders: withCounts, tree: tree(null), uncategorized: db.notes.filter((n) => !n.folderId && !n.trashedAt).length },
          'Folders loaded'
        );
      }
      if (m === 'post') {
        const parentDoc = data.parent ? db.folders.find((f) => f.id === data.parent) : null;
        const f = {
          id: uid(),
          name: data.name,
          parent: parentDoc?.id || null,
          path: parentDoc ? `${parentDoc.path}/${data.name}` : data.name,
          depth: parentDoc ? parentDoc.depth + 1 : 0,
          color: data.color || '#1D4ED8',
          isFavorite: false,
        };
        db.folders.push(f);
        return okRes({ folder: { ...f, noteCount: 0 } }, 'Folder created');
      }
    }
    const f = db.folders.find((x) => x.id === seg[1]);
    if (!f) return err(404, 'Folder not found');
    if (m === 'get') return okRes({ folder: { ...f, noteCount: db.notes.filter((n) => n.folderId === f.id && !n.trashedAt).length } }, 'Folder loaded');
    if (m === 'put') {
      if (data.name) f.name = data.name;
      if (data.color) f.color = data.color;
      if (data.isFavorite !== undefined) f.isFavorite = data.isFavorite;
      return okRes({ folder: f }, 'Folder updated');
    }
    if (m === 'patch' && seg[2] === 'favorite') {
      f.isFavorite = data.value === undefined ? !f.isFavorite : data.value;
      return okRes({ id: f.id, isFavorite: f.isFavorite }, 'Updated');
    }
    if (m === 'delete') {
      const kids = db.folders.filter((x) => x.path.startsWith(`${f.path}/`)).map((x) => x.id);
      const ids = [f.id, ...kids];
      const trashed = db.notes.filter((n) => ids.includes(n.folderId) && !n.trashedAt);
      trashed.forEach((n) => {
        n.trashedAt = now();
        n.scheduledFor = new Date(Date.now() + db.trashDays * 86400000).toISOString();
        n.isPinned = false;
      });
      db.folders = db.folders.filter((x) => !ids.includes(x.id));
      return okRes({ deletedFolders: ids.length, trashedNotes: trashed.length }, 'Folder deleted, notes moved to trash');
    }
  }

  // ---------------- tags ----------------
  if (path === 'tags' && m === 'get') {
    return okRes(
      { tags: db.tags.map((t) => ({ ...t, noteCount: db.notes.filter((n) => n.tagIds.includes(t.id) && !n.trashedAt).length })) },
      'Tags loaded'
    );
  }
  if (path === 'tags' && m === 'post') {
    const name = String(data.name || '').trim().toLowerCase();
    const existing = db.tags.find((t) => t.name === name);
    if (existing) return okRes({ tag: existing }, 'This tag already exists');
    const tag = { id: uid(), name, color: data.color || '#64748B' };
    db.tags.push(tag);
    return okRes({ tag }, 'Tag created');
  }
  if (seg[0] === 'tags' && seg[1] && m === 'delete') {
    db.tags = db.tags.filter((t) => t.id !== seg[1]);
    db.notes.forEach((n) => {
      n.tagIds = n.tagIds.filter((t) => t !== seg[1]);
    });
    return okRes({ id: seg[1] }, 'Tag deleted');
  }

  // ---------------- search ----------------
  if (seg[0] === 'search') {
    const q = String(params.q || '').trim().toLowerCase();
    if (seg[1] === 'suggestions') {
      const match = (s) => s.toLowerCase().includes(q);
      return okRes(
        {
          suggestions: [
            ...db.notes.filter((n) => !n.trashedAt && match(n.title)).slice(0, 6).map((n) => ({ type: 'note', id: n.id, label: n.title, updatedAt: n.updatedAt })),
            ...db.folders.filter((f) => match(f.name)).slice(0, 4).map((f) => ({ type: 'folder', id: f.id, label: f.name })),
            ...db.tags.filter((t) => match(t.name)).slice(0, 4).map((t) => ({ type: 'tag', id: t.id, label: t.name, color: t.color })),
          ],
        },
        'Suggestions'
      );
    }
    const rx = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
    let list = db.notes.filter((n) => (params.trashed === 'true' ? n.trashedAt : !n.trashedAt));
    if (rx) list = list.filter((n) => rx.test(n.title) || rx.test(n.contentText));
    if (params.folder) list = list.filter((n) => n.folderId === params.folder);
    if (params.tags) {
      const names = String(params.tags).split(',');
      const ids = db.tags.filter((t) => names.includes(t.name)).map((t) => t.id);
      list = list.filter((n) => n.tagIds.some((t) => ids.includes(t)));
    }
    if (params.favorite === 'true') list = list.filter((n) => n.isFavorite);
    if (params.pinned === 'true') list = list.filter((n) => n.isPinned);
    list = sorted(list, params.sort === 'title' ? 'title' : 'recent');
    return okRes({ query: q, notes: list.map((n) => ser(n)), total: list.length, page: 1, totalPages: 1, hasMore: false }, `Search results for "${q}"`);
  }

  // ---------------- notes ----------------
  if (seg[0] === 'notes') {
    const sub = seg[1];

    if (sub === 'stats' && seg[2] === 'dashboard') {
      const live = db.notes.filter((n) => !n.trashedAt);
      const today = new Date().setHours(0, 0, 0, 0);
      return okRes(
        {
          totalNotes: live.length,
          folders: db.folders.length,
          trashCount: db.notes.filter((n) => n.trashedAt).length,
          pinned: live.filter((n) => n.isPinned).length,
          favorite: live.filter((n) => n.isFavorite).length,
          tags: db.tags.length,
          createdToday: live.filter((n) => new Date(n.createdAt).getTime() >= today).length,
          lastUpdated: [...live].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.lastEditedAt || null,
        },
        'Dashboard stats'
      );
    }

    if (sub === 'trash' && !seg[2]) {
      if (m === 'get') return okRes({ notes: db.notes.filter((n) => n.trashedAt).map((n) => ser(n)) }, 'Trash loaded');
      if (m === 'delete') {
        const count = db.notes.filter((n) => n.trashedAt).length;
        db.notes = db.notes.filter((n) => !n.trashedAt);
        return okRes({ deletedCount: count }, `${count} notes permanently deleted`);
      }
    }

    if (sub === 'export') {
      return okRes({ markdown: db.notes.filter((n) => !n.trashedAt).map((n) => `# ${n.title}\n\n${n.contentText}\n`).join('\n---\n') }, 'export');
    }

    if (!sub) {
      if (m === 'get') {
        let list = db.notes.filter((n) => (params.trashed === 'true' ? n.trashedAt : !n.trashedAt));
        if (params.folder) list = list.filter((n) => n.folderId === params.folder);
        if (params.tag) list = list.filter((n) => n.tagIds.includes(params.tag));
        if (params.pinned === 'true') list = list.filter((n) => n.isPinned);
        if (params.favorite === 'true') list = list.filter((n) => n.isFavorite);
        list = sorted(list, params.sort);
        return okRes({ notes: list.map((n) => ser(n)), page: 1, limit: 20, total: list.length, totalPages: 1, hasMore: false }, 'Notes loaded');
      }
      if (m === 'post') {
        const content = data.content || doc(p(''));
        const n = {
          id: uid(),
          title: data.title?.trim() || 'Untitled note',
          content,
          contentHtml: data.contentHtml || html(content),
          contentText: textOf(content),
          folderId: data.folder || null,
          tagIds: resolveTagIds(data.tags || []),
          isPinned: !!data.isPinned,
          isFavorite: !!data.isFavorite,
          color: null,
          coverImage: null,
          trashedAt: null,
          scheduledFor: null,
          createdAt: now(),
          updatedAt: now(),
          lastEditedAt: now(),
          versions: [],
        };
        db.notes.unshift(n);
        return okRes({ note: ser(n, true) }, 'Note created');
      }
    }

    const n = db.notes.find((x) => x.id === sub);
    if (!n) return err(404, 'Note not found');

    if (!seg[2]) {
      if (m === 'get') return okRes({ note: ser(n, true) }, 'Note loaded');
      if (m === 'put') {
        if (data.title !== undefined) n.title = data.title.trim() || 'Untitled note';
        if (data.content !== undefined) {
          n.content = data.content;
          n.contentHtml = data.contentHtml || html(data.content);
          n.contentText = textOf(data.content);
        }
        if (data.folder !== undefined) n.folderId = data.folder;
        if (data.tags !== undefined) n.tagIds = resolveTagIds(data.tags);
        if (data.isPinned !== undefined) n.isPinned = data.isPinned;
        if (data.isFavorite !== undefined) n.isFavorite = data.isFavorite;
        n.updatedAt = now();
        n.lastEditedAt = now();
        return okRes({ note: ser(n, true) }, 'Note updated');
      }
      if (m === 'delete') {
        n.trashedAt = now();
        n.scheduledFor = new Date(Date.now() + db.trashDays * 86400000).toISOString();
        n.isPinned = false;
        return okRes({ note: ser(n) }, 'Note moved to trash - permanently deleted after 5 days');
      }
    }

    if (seg[2] === 'autosave' && m === 'patch') {
      if (data.title !== undefined) n.title = data.title.trim() || 'Untitled note';
      if (data.content !== undefined) {
        n.content = data.content;
        n.contentHtml = data.contentHtml || html(data.content);
        n.contentText = textOf(data.content);
      }
      n.updatedAt = now();
      n.lastEditedAt = now();
      return okRes({ savedAt: n.lastEditedAt, title: n.title }, 'Autosaved');
    }
    if (seg[2] === 'restore' && m === 'patch') {
      n.trashedAt = null;
      n.scheduledFor = null;
      return okRes({ note: ser(n) }, 'Note restored');
    }
    if (seg[2] === 'permanent' && m === 'delete') {
      db.notes = db.notes.filter((x) => x.id !== n.id);
      return okRes({ id: n.id }, 'Note permanently deleted');
    }
    if (seg[2] === 'duplicate' && m === 'post') {
      const copy = { ...n, id: uid(), title: `${n.title} (copy)`, createdAt: now(), updatedAt: now(), lastEditedAt: now() };
      db.notes.unshift(copy);
      return okRes({ note: ser(copy, true) }, 'Note duplicated');
    }
    if (seg[2] === 'pin' && m === 'patch') {
      n.isPinned = data.value === undefined ? !n.isPinned : data.value;
      return okRes({ id: n.id, isPinned: n.isPinned }, n.isPinned ? 'Note pinned' : 'Note unpinned');
    }
    if (seg[2] === 'favorite' && m === 'patch') {
      n.isFavorite = data.value === undefined ? !n.isFavorite : data.value;
      return okRes({ id: n.id, isFavorite: n.isFavorite }, n.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    }
    if (seg[2] === 'versions' && m === 'get') return okRes({ versions: n.versions.map((v, i) => ({ ...v, index: i })) }, 'Versions loaded');
  }

  return err(404, `Demo API: no route for ${method} ${url}`);
};

export default demoApi;
