import { useEffect, useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { api } from '../../lib/api.js';
import { cn } from '../../lib/utils.js';

/** Tags add/remove - used in the note editor and the create page */
const TagInput = ({ value = [], onChange, allTags = [], onTagsLoaded, max = 12 }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (allTags.length) return;
    api
      .get('/tags')
      .then(({ data }) => onTagsLoaded?.(data.tags || []))
      .catch(() => {});
  }, [allTags.length, onTagsLoaded]);

  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (!q) return setSuggestions([]);
    setSuggestions(allTags.filter((t) => t.name.includes(q) && !value.includes(t.name)).slice(0, 5));
  }, [input, allTags, value]);

  const add = (raw) => {
    const name = String(raw).trim().toLowerCase();
    if (!name || value.includes(name) || value.length >= max) return;
    onChange([...value, name]);
    setInput('');
    setSuggestions([]);
  };

  const remove = (name) => onChange(value.filter((t) => t !== name));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-[10px] border border-line bg-white p-2 focus-within:border-brand-500 focus-within:shadow-focus">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            #{t}
            <button type="button" onClick={() => remove(t)} className="transition hover:text-brand-900" aria-label={`Remove ${t}`}>
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(input);
            }
            if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]);
          }}
          placeholder={value.length ? '' : 'Type a tag and press Enter...'}
          className="min-w-[140px] flex-1 border-none bg-transparent px-1.5 py-1 text-[13px] text-ink placeholder:text-ink-soft focus:outline-none"
        />

        {input.trim() && (
          <button type="button" onClick={() => add(input)} className="inline-flex items-center gap-1 rounded-lg bg-brand-700 px-2 py-1 text-[11px] font-semibold text-white">
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s.id || s.name}
              type="button"
              onClick={() => add(s.name)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              <Plus size={11} /> #{s.name}
            </button>
          ))}
        </div>
      )}

      {allTags.length > 0 && !input && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">Popular:</span>
          {allTags
            .filter((t) => !value.includes(t.name))
            .slice(0, 6)
            .map((t) => (
              <button
                key={t.id || t.name}
                type="button"
                onClick={() => add(t.name)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-ink-muted transition hover:bg-brand-50 hover:text-brand-700"
              >
                <Check size={11} /> #{t.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
