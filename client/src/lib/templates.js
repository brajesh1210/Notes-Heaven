/**
 * Note templates - pre-filled TipTap documents for common note types.
 * Applied from the Create Note page ("Start from a template").
 */

const doc = (...content) => ({ type: 'doc', content });
const h = (text, level = 2) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const p = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const bullet = (items) => ({ type: 'bulletList', content: items.map((t) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] })) });
const ordered = (items) => ({ type: 'orderedList', content: items.map((t) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] })) });
const tasks = (items) => ({
  type: 'taskList',
  content: items.map((t) => ({ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] })),
});

export const EMPTY_DOC = doc({ type: 'paragraph' });

export const TEMPLATES = [
  { id: 'blank', name: 'Blank note' },
  {
    id: 'lecture',
    name: 'Lecture notes',
    content: doc(
      h('Topic'),
      p('Write the main topic of today’s lecture here.'),
      h('Key points'),
      bullet(['First important concept', 'Second important concept', 'Anything the professor repeated']),
      h('Summary'),
      p('Two-line summary in your own words - future revision becomes fast.')
    ),
  },
  {
    id: 'meeting',
    name: 'Meeting notes',
    content: doc(
      h('Attendees'),
      bullet(['Name 1', 'Name 2']),
      h('Agenda'),
      ordered(['Point 1', 'Point 2']),
      h('Action items'),
      tasks(['Who does what - task 1', 'Who does what - task 2'])
    ),
  },
  {
    id: 'revision',
    name: 'Revision sheet',
    content: doc(
      h('Key formulas'),
      { type: 'codeBlock', attrs: { language: 'plaintext' }, content: [{ type: 'text', text: 'v = u + at\ns = ut + 1/2 at²' }] },
      h('Common mistakes'),
      bullet(['Mistake to avoid 1', 'Mistake to avoid 2']),
      h('Practice questions'),
      ordered(['Question 1', 'Question 2'])
    ),
  },
];
