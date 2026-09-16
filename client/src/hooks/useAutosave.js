import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * Autosave hook.
 *   const { status, lastSavedAt, saveNow, scheduleSave } = useAutosave(noteId, () => ({ title, content, contentHtml }));
 *
 * status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
 * Note: create page par noteId null hota hai -> local draft (localStorage) me save karte hain.
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
      // naya note - backend par nahi, local draft
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

  /** content change hone par call karo - debounce ke saath save */
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

  // browser band karne se pehle warning (agar save pending ho)
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
