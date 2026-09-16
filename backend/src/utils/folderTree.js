/**
 * Folder tree helpers.
 * Serialized folders expose `id` while mongoose docs expose `_id`,
 * so these helpers handle both shapes.
 */
const nodeId = (f) => f._id ?? f.id;
const key = (id) => (id ? String(id) : 'root');

/** Flat folder list -> nested tree (with children arrays) */
export const buildTree = (folders = [], parentId = null) => {
  const grouped = new Map();
  folders.forEach((f) => {
    const k = key(f.parent);
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k).push(f);
  });

  const walk = (id, depth = 0) => {
    if (depth > 20) return []; // safety: stop if a cycle ever causes infinite recursion
    const kids = grouped.get(key(id)) || [];
    return kids
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .map((f) => ({ ...f, children: walk(nodeId(f), depth + 1) }));
  };

  return walk(parentId);
};

/** Ids of all descendants of a folder (works for mongoose docs and serialized folders) */
export const descendantIds = (folders = [], rootId) => {
  const ids = [];
  const collect = (id) => {
    folders.forEach((f) => {
      if (String(f.parent) === String(id)) {
        ids.push(nodeId(f));
        collect(nodeId(f));
      }
    });
  };
  collect(rootId);
  return ids;
};

/** Breadcrumb path from folder + folderMap (id -> doc): "Class 12/Physics" */
export const breadcrumbOf = (folder, folderMap) => {
  if (!folder) return '';
  const parts = [];
  let cur = folder;
  let guard = 0;
  while (cur && guard++ < 20) {
    parts.unshift(cur.name);
    cur = cur.parent ? folderMap.get(String(cur.parent)) : null;
  }
  return parts.join('/');
};
