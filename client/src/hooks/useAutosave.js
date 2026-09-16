import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * Autosave hook.
 *   const { status, lastSavedAt, saveNow, scheduleSave } = useAutosave(noteId, () => ({ title, content, contentHtml }));
 *
 * status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
 * Note: on the create page noteId is null -> we save a local draft (localStorage).
 */
export const useAutosave = (noteId, getPayload, { delay = 1500, enabled = true } = {}) => {
  const [status, setStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [error, setError] = useState(null);

  const timer = useRef(null);
  const latest = useRef(getPayload);
  latest.current = getPayload;

  const localKey = noteId ? `nh_draft_${noteId}` : 'nh_draft_new';

  const save = useCallback(async () => {
    if (!enabled) return;
    const payload = latest.current?.();
    if (!payload) return;

    if (!noteId) {
      // new note - local draft only, nothing is sent to the backend
      try {
        localStorage.setItem(localKey, JSON.stringify({ ...payload, savedAt: Date.now() }));
        setLastSavedAt(new Date());
        setStatus('saved');
      } catch {
        setStatus('error');
      }
      return;
    }

    try {
      setStatus('saving');
      const { data } = await api.patch(`/notes/${noteId}/autosave`, payload);
      setLastSavedAt(new Date(data.savedAt || Date.now()));
      setStatus('saved');
      setError(null);
    } catch (e) {
      setStatus('error');
      setError(e.message);
    }
  }, [noteId, enabled, localKey]);

  /** call when content changes - saves with debounce */
  const scheduleSave = useCallback(() => {
    if (!enabled) return;
    setStatus('pending');
    clearTimeout(timer.current);
    timer.current = setTimeout(save, delay);
  }, [enabled, delay, save]);

  /** turant save (Ctrl+S / blur) */
  const saveNow = useCallback(async () => {
    clearTimeout(timer.current);
    await save();
  }, [save]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // warn before closing the browser if a save is pending
  useEffect(() => {
    const handler = (e) => {
      if (status === 'pending' || status === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [status]);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveNow();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveNow]);

  const clearDraft = () => localStorage.removeItem(localKey);
  const readDraft = () => {
    try {
      return JSON.parse(localStorage.getItem(localKey) || 'null');
    } catch {
      return null;
    }
  };

  return { status, lastSavedAt, error, scheduleSave, saveNow, clearDraft, readDraft };
};

export default useAutosave;
