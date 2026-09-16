import Note from '../models/Note.js';
import Tag from '../models/Tag.js';
import Folder from '../models/Folder.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeNote } from './noteController.js';

const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ------------------------------------------------------------------
// GET /api/search?q=&folder=&tags=physics,jee&from=&to=&favorite=
//                &pinned=&trashed=&sort=recent|oldest|title|created&page=&limit=
// ------------------------------------------------------------------
export const searchNotes = asyncHandler(async (req, res) => {
  const {
    q = '',
    folder,
    tags,
    from,
    to,
    favorite,
    pinned,
    trashed = 'false',
    sort = 'recent',
    page = 1,
    limit = 20,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = { user: req.userId };
  filter.trashedAt = trashed === 'true' ? { $ne: null } : null;

  const term = String(q).trim();
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ title: rx }, { contentText: rx }];
  }

  if (folder) filter.folder = folder === 'null' || folder === 'none' ? null : folder;
  if (favorite === 'true') filter.isFavorite = true;
  if (pinned === 'true') filter.isPinned = true;

  if (tags) {
    const names = String(tags)
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const tagDocs = await Tag.find({ user: req.userId, name: { $in: names } }).select('_id');
    if (tagDocs.length) filter.tags = { $in: tagDocs.map((t) => t._id) };
  }

  if (from || to) {
    filter.lastEditedAt = {};
    if (from) filter.lastEditedAt.$gte = new Date(from);
    if (to) filter.lastEditedAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
  }

  const sortMap = {
    recent: { isPinned: -1, lastEditedAt: -1 },
    oldest: { lastEditedAt: 1 },
    title: { title: 1 },
    created: { createdAt: -1 },
  };
  const sortSpec = sortMap[sort] || sortMap.recent;

  const [notes, total] = await Promise.all([
    Note.find(filter).populate('tags', 'name color').sort(sortSpec).skip((pageNum - 1) * perPage).limit(perPage),
    Note.countDocuments(filter),
  ]);

  // title me match karne wale upar
  let results = notes;
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    results = [...notes].sort((a, b) => Number(rx.test(b.title)) - Number(rx.test(a.title)));
  }

  const folders = await Folder.find({ user: req.userId }).select('name');
  const folderMap = new Map(folders.map((f) => [String(f._id), f]));

  return ok(
    res,
    {
      query: term,
      notes: results.map((n) => serializeNote(n, folderMap)),
      total,
      page: pageNum,
      limit: perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      hasMore: pageNum * perPage < total,
    },
    `Search results for "${term}"`
  );
});

// GET /api/search/suggestions?q=busi  -> instant search dropdown
export const suggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return ok(res, { suggestions: [] }, 'Empty query');

  const rx = new RegExp(escapeRegex(q), 'i');

  const [notes, folders, tags] = await Promise.all([
    Note.find({ user: req.userId, trashedAt: null, title: rx }).select('title updatedAt').sort({ updatedAt: -1 }).limit(6),
    Folder.find({ user: req.userId, name: rx }).select('name').limit(4),
    Tag.find({ user: req.userId, name: rx }).select('name color').limit(4),
  ]);

  return ok(
    res,
    {
      suggestions: [
        ...notes.map((n) => ({ type: 'note', id: n._id, label: n.title, updatedAt: n.updatedAt })),
        ...folders.map((f) => ({ type: 'folder', id: f._id, label: f.name })),
        ...tags.map((t) => ({ type: 'tag', id: t._id, label: t.name, color: t.color })),
      ],
    },
    'Suggestions'
  );
});
