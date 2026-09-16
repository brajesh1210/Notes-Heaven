import mongoose from 'mongoose';
import Note from '../models/Note.js';
import Folder from '../models/Folder.js';
import Tag from '../models/Tag.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';
import { retentionDaysLeft } from '../tasks/trashCleanup.js';

/**
 * Note -> frontend-friendly JSON.
 * folderMap: Map(folderId -> folderDoc) avoids one extra query per note.
 */
export const serializeNote = (note, folderMap = new Map(), { withContent = false } = {}) => {
  const folderId = note.folder ? String(note.folder._id ?? note.folder) : null;
  const folderDoc = folderId ? folderMap.get(folderId) : null;

  const out = {
    id: note._id,
    title: note.title,
    snippet: (note.contentText || '').slice(0, 160),
    folder: folderDoc ? { id: folderDoc._id ?? folderDoc.id, name: folderDoc.name } : null,
    tags: (note.tags || [])
      .map((t) => (t && t.name ? { id: t._id, name: t.name, color: t.color } : null))
      .filter(Boolean),
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
    color: note.color,
    coverImage: note.coverImage,
    wordCount: (note.contentText || '').split(/\s+/).filter(Boolean).length,
    readingTime: Math.max(1, Math.ceil(((note.contentText || '').split(/\s+/).filter(Boolean).length) / 200)),
    isTrashed: Boolean(note.trashedAt),
    trashedAt: note.trashedAt,
    scheduledFor: note.scheduledFor,
    daysLeft: retentionDaysLeft(note.scheduledFor),
    lastEditedAt: note.lastEditedAt,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };

  if (withContent) {
    out.content = note.content;
    out.contentHtml = note.contentHtml;
    out.contentText = note.contentText;
    out.versionCount = (note.versions || []).length;
  }
  return out;
};

const folderMapFor = async (userId) => {
  const folders = await Folder.find({ user: userId }).select('name');
  return new Map(folders.map((f) => [String(f._id), f]));
};

/** Strip script tags / inline handlers / javascript: URLs from stored HTML (defense in depth) */
const sanitizeHtml = (html) =>
  String(html || '')
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

/** tags: array of names -> Tag docs (missing tags are created on the fly) */
const resolveTags = async (userId, names = []) => {
  const clean = [...new Set(names.map((n) => String(n).trim().toLowerCase()).filter(Boolean))].slice(0, 12);
  if (!clean.length) return [];
  const existing = await Tag.find({ user: userId, name: { $in: clean } });
  const missing = clean.filter((n) => !existing.some((t) => t.name === n));
  const made = missing.length ? await Tag.insertMany(missing.map((name) => ({ user: userId, name }))) : [];
  return [...existing, ...made].map((t) => t._id);
};

const SORTS = {
  '-updatedAt': { isPinned: -1, lastEditedAt: -1 },
  updatedAt: { lastEditedAt: 1 },
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  title: { title: 1 },
  recent: { isPinned: -1, lastEditedAt: -1 },
  oldest: { lastEditedAt: 1 },
};

// ------------------------------------------------------------------
// GET /api/notes?folder=&tag=&pinned=&favorite=&trashed=&sort=&page=&limit=
// ------------------------------------------------------------------
export const listNotes = asyncHandler(async (req, res) => {
  const { folder, tag, pinned, favorite, trashed = 'false', sort = '-updatedAt', page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = { user: req.userId, trashedAt: trashed === 'true' ? { $ne: null } : null };
  if (folder) filter.folder = folder === 'null' || folder === 'none' ? null : folder;
  if (tag) filter.tags = tag;
  if (pinned === 'true') filter.isPinned = true;
  if (favorite === 'true') filter.isFavorite = true;

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .populate('tags', 'name color')
      .sort(SORTS[sort] || SORTS['-updatedAt'])
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Note.countDocuments(filter),
  ]);

  const folderMap = await folderMapFor(req.userId);

  return ok(
    res,
    {
      notes: notes.map((n) => serializeNote(n, folderMap)),
      total,
      page: pageNum,
      limit: perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      hasMore: pageNum * perPage < total,
    },
    'Notes loaded'
  );
});

// ------------------------------------------------------------------
// POST /api/notes   { title, content, contentHtml, folder, tags:[names] }
// ------------------------------------------------------------------
export const createNote = asyncHandler(async (req, res) => {
  const { title, content, contentHtml, folder, tags, isPinned, isFavorite } = req.body;

  if (folder) {
    const f = await Folder.findOne({ _id: folder, user: req.userId });
    if (!f) throw badRequest('Selected folder not found');
  }

  const tagIds = await resolveTags(req.userId, tags || []);

  const note = await Note.create({
    user: req.userId,
    title: String(title || '').trim() || 'Untitled note',
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    contentHtml: sanitizeHtml(contentHtml),
    folder: folder || null,
    tags: tagIds,
    isPinned: Boolean(isPinned),
    isFavorite: Boolean(isFavorite),
    lastEditedAt: new Date(),
  });

  await note.populate('tags', 'name color');
  const folderMap = await folderMapFor(req.userId);

  return created(res, { note: serializeNote(note, folderMap, { withContent: true }) }, 'Note created successfully');
});

// ------------------------------------------------------------------
// GET /api/notes/:id
// ------------------------------------------------------------------
export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId }).populate('tags', 'name color');
  if (!note) throw notFound('Note not found');

  const folderMap = await folderMapFor(req.userId);
  return ok(res, { note: serializeNote(note, folderMap, { withContent: true }) }, 'Note loaded');
});

// ------------------------------------------------------------------
// PUT /api/notes/:id  (full update + optional version snapshot)
// ------------------------------------------------------------------
export const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');

  const { title, content, contentHtml, folder, tags, isPinned, isFavorite, createVersion } = req.body;

  const contentChanged = content !== undefined && JSON.stringify(content) !== JSON.stringify(note.content);
  const titleChanged = title !== undefined && title !== note.title;

  if (createVersion || (contentChanged && note.content)) {
    note.versions = [...(note.versions || []), { title: note.title, content: note.content, savedAt: new Date() }].slice(-10);
  }

  if (title !== undefined) note.title = String(title).trim() || 'Untitled note';
  if (content !== undefined) note.content = content;
  if (contentHtml !== undefined) note.contentHtml = sanitizeHtml(contentHtml);
  if (folder !== undefined) {
    if (folder) {
      const f = await Folder.findOne({ _id: folder, user: req.userId });
      if (!f) throw badRequest('Selected folder not found');
    }
    note.folder = folder || null;
  }
  if (tags !== undefined) note.tags = await resolveTags(req.userId, tags);
  if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
  if (isFavorite !== undefined) note.isFavorite = Boolean(isFavorite);

  if (contentChanged || titleChanged) note.lastEditedAt = new Date();

  await note.save();
  await note.populate('tags', 'name color');

  const folderMap = await folderMapFor(req.userId);
  return ok(res, { note: serializeNote(note, folderMap, { withContent: true }) }, 'Note updated successfully');
});

// ------------------------------------------------------------------
// PATCH /api/notes/:id/autosave  (silent save - no version is created)
// ------------------------------------------------------------------
export const autosaveNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');
  if (note.trashedAt) throw badRequest('Trashed notes cannot autosave - restore the note first');

  const { title, content, contentHtml } = req.body;
  if (title !== undefined) note.title = String(title).trim() || 'Untitled note';
  if (content !== undefined) note.content = content;
  if (contentHtml !== undefined) note.contentHtml = sanitizeHtml(contentHtml);
  note.lastEditedAt = new Date();

  await note.save();
  return ok(res, { savedAt: note.lastEditedAt, title: note.title }, 'Autosaved');
});

// ------------------------------------------------------------------
// DELETE /api/notes/:id  -> soft delete (trash)
// ------------------------------------------------------------------
export const trashNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');
  if (note.trashedAt) throw badRequest('This note is already in trash');

  note.moveToTrash();
  await note.save();

  const folderMap = await folderMapFor(req.userId);
  return ok(res, { note: serializeNote(note, folderMap) }, 'Note moved to trash - it will be permanently deleted after 5 days');
});

// ------------------------------------------------------------------
// PATCH /api/notes/:id/restore
// ------------------------------------------------------------------
export const restoreNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');

  note.restoreFromTrash();
  await note.save();

  const folderMap = await folderMapFor(req.userId);
  return ok(res, { note: serializeNote(note, folderMap) }, 'Note restored successfully');
});

// ------------------------------------------------------------------
// DELETE /api/notes/:id/permanent
// ------------------------------------------------------------------
export const deleteNotePermanently = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');
  return ok(res, { id: note._id }, 'Note permanently deleted');
});

// ------------------------------------------------------------------
// GET /api/notes/trash
// ------------------------------------------------------------------
export const listTrash = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.userId, trashedAt: { $ne: null } })
    .populate('tags', 'name color')
    .sort({ trashedAt: -1 });

  const folderMap = await folderMapFor(req.userId);
  return ok(res, { notes: notes.map((n) => serializeNote(n, folderMap)) }, 'Trash loaded');
});

// ------------------------------------------------------------------
// DELETE /api/notes/trash/empty
// ------------------------------------------------------------------
export const emptyTrash = asyncHandler(async (req, res) => {
  const result = await Note.deleteMany({ user: req.userId, trashedAt: { $ne: null } });
  return ok(res, { deletedCount: result.deletedCount }, `${result.deletedCount} notes permanently deleted`);
});

// ------------------------------------------------------------------
// POST /api/notes/:id/duplicate
// ------------------------------------------------------------------
export const duplicateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');

  const copy = new Note({
    user: note.user,
    title: `${note.title} (copy)`.slice(0, 200),
    content: note.content,
    contentHtml: note.contentHtml,
    contentText: note.contentText,
    folder: note.folder,
    tags: note.tags,
    lastEditedAt: new Date(),
  });
  await copy.save();
  await copy.populate('tags', 'name color');

  const folderMap = await folderMapFor(req.userId);
  return created(res, { note: serializeNote(copy, folderMap, { withContent: true }) }, 'Note duplicated');
});

// ------------------------------------------------------------------
// PATCH /api/notes/:id/pin  &  /favorite
// ------------------------------------------------------------------
export const togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');
  note.isPinned = req.body?.value === undefined ? !note.isPinned : Boolean(req.body.value);
  await note.save();
  return ok(res, { id: note._id, isPinned: note.isPinned }, note.isPinned ? 'Note pinned' : 'Note unpinned');
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');
  note.isFavorite = req.body?.value === undefined ? !note.isFavorite : Boolean(req.body.value);
  await note.save();
  return ok(res, { id: note._id, isFavorite: note.isFavorite }, note.isFavorite ? 'Added to favorites' : 'Removed from favorites');
});

// ------------------------------------------------------------------
// PATCH /api/notes/bulk  - bulk pin / favorite / trash / restore / move / tag
// body: { ids: [noteId], action, value }
// ------------------------------------------------------------------
export const bulkAction = asyncHandler(async (req, res) => {
  const { ids, action, value } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) throw badRequest('No notes selected');
  const clean = ids.map((id) => String(id)).filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
  if (!clean.length) throw badRequest('No valid notes selected');

  const notes = await Note.find({ _id: { $in: clean }, user: req.userId });
  if (!notes.length) throw notFound('Note not found');

  let tagDoc = null;
  if (action === 'tag') {
    const name = String(value || '').trim().toLowerCase();
    if (!name) throw badRequest('Tag name is required');
    tagDoc = await Tag.findOne({ user: req.userId, name });
    if (!tagDoc) tagDoc = await Tag.create({ user: req.userId, name });
  }

  let updated = 0;
  for (const note of notes) {
    switch (action) {
      case 'pin':
        note.isPinned = Boolean(value);
        break;
      case 'favorite':
        note.isFavorite = Boolean(value);
        break;
      case 'trash':
        if (note.trashedAt) continue;
        note.moveToTrash();
        break;
      case 'restore':
        if (!note.trashedAt) continue;
        note.trashedAt = null;
        note.scheduledFor = null;
        break;
      case 'move':
        note.folder = value || null;
        break;
      case 'tag':
        if (note.tags.some((t) => String(t._id || t) === String(tagDoc._id))) continue;
        note.tags.push(tagDoc._id);
        break;
      default:
        throw badRequest('Unknown bulk action');
    }
    note.lastEditedAt = new Date();
    await note.save();
    updated += 1;
  }

  const labels = {
    pin: value ? 'pinned' : 'unpinned',
    favorite: value ? 'added to favorites' : 'removed from favorites',
    trash: 'moved to trash',
    restore: 'restored',
    move: 'moved',
    tag: `tagged with "${tagDoc?.name}"`,
  };
  return ok(res, { updated }, `${updated} note${updated === 1 ? '' : 's'} ${labels[action]}`);
});

// ------------------------------------------------------------------
// Versions
// ------------------------------------------------------------------
export const getVersions = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId }).select('versions');
  if (!note) throw notFound('Note not found');
  const versions = (note.versions || []).map((v, index) => ({ index, title: v.title, savedAt: v.savedAt }));
  return ok(res, { versions }, 'Versions loaded');
});

export const restoreVersion = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) throw notFound('Note not found');

  const index = Number(req.params.index);
  const version = (note.versions || [])[index];
  if (!version) throw notFound('Version not found');

  // save the current state to version history first (keeps undo possible)
  note.versions = [...(note.versions || []), { title: note.title, content: note.content, savedAt: new Date() }].slice(-10);
  note.title = version.title;
  note.content = version.content;
  note.lastEditedAt = new Date();
  await note.save();
  await note.populate('tags', 'name color');

  const folderMap = await folderMapFor(req.userId);
  return ok(res, { note: serializeNote(note, folderMap, { withContent: true }) }, 'Previous version restored');
});

// ------------------------------------------------------------------
// GET /api/notes/stats/dashboard
// ------------------------------------------------------------------
export const dashboardStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(String(req.userId));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [live, trashCount, pinned, favorite, folders, tags, createdToday, latest] = await Promise.all([
    Note.countDocuments({ user: userId, trashedAt: null }),
    Note.countDocuments({ user: userId, trashedAt: { $ne: null } }),
    Note.countDocuments({ user: userId, trashedAt: null, isPinned: true }),
    Note.countDocuments({ user: userId, trashedAt: null, isFavorite: true }),
    Folder.countDocuments({ user: userId }),
    Tag.countDocuments({ user: userId }),
    Note.countDocuments({ user: userId, trashedAt: null, createdAt: { $gte: today } }),
    Note.findOne({ user: userId, trashedAt: null }).sort({ lastEditedAt: -1 }).select('lastEditedAt'),
  ]);

  return ok(
    res,
    {
      totalNotes: live,
      folders,
      trashCount,
      pinned,
      favorite,
      tags,
      createdToday,
      lastUpdated: latest?.lastEditedAt || null,
    },
    'Dashboard stats'
  );
});

// ------------------------------------------------------------------
// GET /api/notes/export/markdown
// ------------------------------------------------------------------
export const exportAllMarkdown = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.userId, trashedAt: null }).sort({ updatedAt: -1 }).select('title contentText updatedAt');

  const md = [
    '# Notes Heaven Export',
    '',
    `_Exported: ${new Date().toLocaleString('en-IN')}_`,
    '',
    ...notes.map((n) => `## ${n.title}\n\n_Updated: ${new Date(n.updatedAt).toLocaleString('en-IN')}_\n\n${n.contentText || '_empty_'}\n`),
  ].join('\n---\n\n');

  res.type('text/markdown; charset=utf-8').send(md);
});
