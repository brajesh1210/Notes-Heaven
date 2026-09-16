import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

/**
 * Central place that manages folders - the sidebar, folders page and note
 * editor all read from here. Call refresh() after any change.
 */
const FoldersContext = createContext(null);

export const useFolders = () => {
  const ctx = useContext(FoldersContext);
  if (!ctx) throw new Error('useFolders must be used within <FoldersProvider>');
  return ctx;
};

export const FoldersProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [tree, setTree] = useState([]);
  const [uncategorized, setUncategorized] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/folders');
      setFolders(data.folders || []);
      setTree(data.tree || []);
      setUncategorized(data.uncategorized ?? 0);
      return data;
    } catch (e) {
      // silent - the sidebar stays empty, the page shows the error
      console.warn('Failed to load folders:', e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createFolder = useCallback(
    async (payload) => {
      const { data, message } = await api.post('/folders', payload);
      await refresh();
      toast.success(message || 'Folder created');
      return data.folder;
    },
    [refresh, toast]
  );

  const updateFolder = useCallback(
    async (id, payload) => {
      const { data, message } = await api.put(`/folders/${id}`, payload);
      await refresh();
      toast.success(message || 'Folder updated');
      return data.folder;
    },
    [refresh, toast]
  );

  const deleteFolder = useCallback(
    async (id, mode = 'trash', target = null) => {
      const { data, message } = await api.delete(`/folders/${id}`, { mode, target });
      await refresh();
      toast.success(message || 'Folder deleted');
      return data;
    },
    [refresh, toast]
  );

  const byId = useMemo(() => new Map(folders.map((f) => [f.id, f])), [folders]);

  /** flat option list (indented) for select dropdowns */
  const flatOptions = useMemo(() => {
    const out = [];
    const walk = (nodes, level = 0) => {
      nodes.forEach((n) => {
        out.push({ ...n, level });
        if (n.children?.length) walk(n.children, level + 1);
      });
    };
    walk(tree);
    return out;
  }, [tree]);

  const value = useMemo(
    () => ({ folders, tree, uncategorized, loading, refresh, createFolder, updateFolder, deleteFolder, byId, flatOptions }),
    [folders, tree, uncategorized, loading, refresh, createFolder, updateFolder, deleteFolder, byId, flatOptions]
  );

  return <FoldersContext.Provider value={value}>{children}</FoldersContext.Provider>;
};

export default FoldersContext;
