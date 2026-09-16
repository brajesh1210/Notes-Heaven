import Folder from '../models/Folder.js';
import Note from '../models/Note.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';
import { buildTree, descendantIds, breadcrumbOf } from '../utils/folderTree.js';

const noteCounts = async (userId) => {
  const rows = await Note.aggregate([
    { $match: { user: userId, trashedAt: null } },
    { $group: { _id: '$folder', count: { $sum: 1 } } },
  ]);
  const map = new Map();
  rows.forEach((r) => map.set(String(r._id), r.count));
  map.set('null', map.get('null') || 0);
  return map;
};

const serialize = (folder, counts = new Map()) => ({
  id: folder._id,
  name: folder.name,
  parent: folder.parent,
  path: folder.path,
  depth: folder.depth,
  color: folder.color,
  isFavorite: folder.isFavorite,
  noteCount: counts.get(String(folder._id)) || 0,
  createdAt: folder.createdAt,
  updatedAt: folder.updatedAt,
});

// GET /api/folders?tree=false
export const listFolders = asyncHandler(async (req, res) => {
  const [folders, counts] = await Promise.all([
    Folder.find({ user: req.userId }).sort({ name: 1 }),
    noteCounts(req.userId),
  ]);

  const flat = folders.map((f) => serialize(f, counts));
  const folderMap = new Map(folders.map((f) => [String(f._id), f]));
  const withCrumb = flat.map((f) => ({
    ...f,
    breadcrumb: breadcrumbOf(folderMap.get(String(f.id)), folderMap),
  }));

  if (req.query.tree === 'false') return ok(res, { folders: withCrumb }, 'Folders loaded');

  return ok(
    res,
    {
      folders: withCrumb,
      tree: buildTree(withCrumb),
      uncategorized: counts.get('null') || 0,
    },
    'Folders loaded'
  );
});

// GET /api/folders/:id
export const getFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, user: req.userId });
  if (!folder) throw notFound('Folder not found');

  const counts = await noteCounts(req.userId);
  return ok(res, { folder: serialize(folder, counts) }, 'Folder loaded');
});

// POST /api/folders
export const createFolder = asyncHandler(async (req, res) => {
  const { name, parent = null, color = '#1D4ED8' } = req.body;
  if (!name || !String(name).trim()) throw badRequest('Folder name is required');

  let parentDoc = null;
  if (parent) {
    parentDoc = await Folder.findOne({ _id: parent, user: req.userId });
    if (!parentDoc) throw badRequest('Parent folder not found');
    if (parentDoc.depth >= 9) throw badRequest('Nesting this deep is not supported (max 10 levels)');
  }

  const exists = await Folder.findOne({ user: req.userId, parent: parentDoc?._id || null, name: String(name).trim() });
  if (exists) throw badRequest('A folder with this name already exists here');

  const folder = await Folder.create({
    user: req.userId,
    name: String(name).trim(),
    parent: parentDoc?._id || null,
    ancestors: parentDoc ? [...parentDoc.ancestors, parentDoc._id] : [],
    path: parentDoc ? `${parentDoc.path}/${String(name).trim()}` : String(name).trim(),
    depth: parentDoc ? parentDoc.depth + 1 : 0,
    color,
  });

  return created(res, { folder: serialize(folder, new Map()) }, 'Folder created');
});

// PUT /api/folders/:id  (rename / color / move)
export const updateFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, user: req.userId });
  if (!folder) throw notFound('Folder not found');

  const { name, color, isFavorite, parent } = req.body;

  // parent change (move) - path/ancestors of the subtree must be rebuilt
  if (parent !== undefined && String(parent || '') !== String(folder.parent || '')) {
    let parentDoc = null;
    if (parent) {
      parentDoc = await Folder.findOne({ _id: parent, user: req.userId });
      if (!parentDoc) throw badRequest('Target parent folder not found');
      if (String(parentDoc._id) === String(folder._id)) throw badRequest('A folder cannot be moved into itself');
      if (parentDoc.ancestors.map(String).includes(String(folder._id))) {
        throw badRequest('A folder cannot be moved into one of its own subfolders');
      }
    }

    const oldPath = folder.path;
    folder.parent = parentDoc?._id || null;
    folder.ancestors = parentDoc ? [...parentDoc.ancestors, parentDoc._id] : [];
    folder.depth = parentDoc ? parentDoc.depth + 1 : 0;
    folder.path = parentDoc ? `${parentDoc.path}/${folder.name}` : folder.name;

    // update path/depth for all descendants
    const all = await Folder.find({ user: req.userId });
    const kids = descendantIds(all, folder._id);
    for (const kidId of kids) {
      const kid = all.find((f) => String(f._id) === String(kidId));
      if (!kid) continue;
      kid.path = kid.path.replace(new RegExp(`^${oldPath}/`), `${folder.path}/`);
      kid.depth = kid.path.split('/').length - 1;
      await kid.save();
    }
  }

  if (name !== undefined && String(name).trim()) folder.name = String(name).trim();
  if (color !== undefined) folder.color = color;
  if (isFavorite !== undefined) folder.isFavorite = Boolean(isFavorite);

  await folder.save();
  const counts = await noteCounts(req.userId);
  return ok(res, { folder: serialize(folder, counts) }, 'Folder updated successfully');
});

// DELETE /api/folders/:id?mode=move|trash&target=<folderId>
export const deleteFolder = asyncHandler(async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, user: req.userId });
  if (!folder) throw notFound('Folder not found');

  const all = await Folder.find({ user: req.userId });
  const childIds = descendantIds(all, folder._id);
  const mode = req.query.mode || 'trash'; // 'trash' (default) or 'move'

  let moved = 0;
  let trashed = 0;

  if (mode === 'move') {
    const target = req.query.target ? await Folder.findOne({ _id: req.query.target, user: req.userId }) : null;
    const result = await Note.updateMany({ user: req.userId, folder: folder._id }, { folder: target?._id || null });
    moved = result.modifiedCount;
  } else {
    const result = await Note.updateMany(
      { user: req.userId, folder: { $in: [folder._id, ...childIds] }, trashedAt: null },
      [
        {
          $set: {
            trashedAt: '$$NOW',
            scheduledFor: { $add: ['$$NOW', 5 * 24 * 60 * 60 * 1000] },
            isPinned: false,
          },
        },
      ]
    );
    trashed = result.modifiedCount;
  }

  await Folder.deleteMany({ _id: { $in: [folder._id, ...childIds] } });

  return ok(
    res,
    { deletedFolders: childIds.length + 1, movedNotes: moved, trashedNotes: trashed },
    mode === 'move' ? 'Folder deleted, notes moved' : 'Folder deleted, notes moved to trash'
  );
});

// PATCH /api/folders/:id/favorite
export const toggleFolderFavorite = asyncHandler(async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, user: req.userId });
  if (!folder) throw notFound('Folder not found');
  folder.isFavorite = req.body?.value === undefined ? !folder.isFavorite : Boolean(req.body.value);
  await folder.save();
  return ok(res, { id: folder._id, isFavorite: folder.isFavorite }, 'Updated');
});
