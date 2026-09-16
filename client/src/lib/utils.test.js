import { describe, it, expect } from 'vitest';
import { initials, cn, timeAgo, friendlyDate } from './utils.js';
import { TEMPLATES, EMPTY_DOC } from './templates.js';

describe('initials', () => {
  it('uses first letters of first two words', () => {
    expect(initials('Brajesh Upadhyay')).toBe('BU');
  });
  it('handles single names and empty input', () => {
    expect(initials('Brajesh')).toBe('B');
    expect(initials('')).toBe('U'); // fallback for missing names
  });
});

describe('cn class merge', () => {
  it('joins truthy classes and drops falsy', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});

describe('date helpers', () => {
  it('timeAgo labels recent dates', () => {
    expect(timeAgo(new Date().toISOString())).toMatch(/now|sec|min/i);
  });
  it('friendlyDate returns a readable date', () => {
    expect(friendlyDate('2026-01-15T10:00:00.000Z')).toMatch(/2026/);
  });
});

describe('templates', () => {
  it('every template is a valid TipTap doc', () => {
    for (const t of TEMPLATES) {
      if (!t.content) continue;
      expect(t.content.type).toBe('doc');
      expect(Array.isArray(t.content.content)).toBe(true);
    }
    expect(EMPTY_DOC.type).toBe('doc');
  });
});
