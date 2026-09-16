/**
 * Demo data seeder.
 *
 *   cd backend
 *   npm run seed
 *
 * Ye script:
 *   - demo user banata hai  (email: demo@notesheaven.app / password: demo1234)
 *   - UI design wale folders banata hai (Class 12, JEE Preparation, Personal, Work + nested)
 *   - 10 sample notes daalta hai (Business Environment, Microeconomics, JEE Physics...)
 *   - 1 note trash me daalta hai (Trash page test karne ke liye)
 *
 * Same email ke saath dubara chalane par pehle purana demo data delete hota hai.
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';
import Folder from '../models/Folder.js';
import Note from '../models/Note.js';
import Tag from '../models/Tag.js';
import logger from './logger.js';

const DEMO_EMAIL = 'demo@notesheaven.app';
const DEMO_PASSWORD = 'demo1234';

// TipTap JSON banane ke chhote helper
const para = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const heading = (text, level = 2) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const bullet = (items) => ({
  type: 'bulletList',
  content: items.map((t) => ({ type: 'listItem', content: [para(t)] })),
});
const ordered = (items) => ({
  type: 'orderedList',
  content: items.map((t) => ({ type: 'listItem', content: [para(t)] })),
});
const code = (text, language = 'javascript') => ({
  type: 'codeBlock',
  attrs: { language },
  content: [{ type: 'text', text }],
});
const doc = (nodes) => ({ type: 'doc', content: nodes });

const htmlFromDoc = (d) => {
  const render = (node) => {
    if (!node) return '';
    if (Array.isArray(node)) return node.map(render).join('');
    if (node.type === 'text') return node.text || '';
    const inner = render(node.content || []);
    switch (node.type) {
      case 'doc':
        return inner;
      case 'heading':
        return `<h${node.attrs?.level || 2}>${inner}</h${node.attrs?.level || 2}>`;
      case 'paragraph':
        return `<p>${inner}</p>`;
      case 'bulletList':
        return `<ul>${inner}</ul>`;
      case 'orderedList':
        return `<ol>${inner}</ol>`;
      case 'listItem':
        return `<li>${inner}</li>`;
      case 'codeBlock':
        return `<pre><code>${inner}</code></pre>`;
      default:
        return inner;
    }
  };
  return render(d);
};

const plainFromDoc = (d) => {
  const out = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.type === 'text' && n.text) out.push(n.text);
    if (n.content) n.content.forEach(walk);
  };
  walk(d);
  return out.join(' ').replace(/\s+/g, ' ').trim();
};

const buildNote = (userId, folderId, tagIds, { title, nodes, pinned = false, favorite = false, hoursAgo = 2, trashed = false }) => {
  const content = doc(nodes);
  const note = new Note({
    user: userId,
    title,
    content,
    contentHtml: htmlFromDoc(content),
    contentText: plainFromDoc(content),
    folder: folderId,
    tags: tagIds,
    isPinned: pinned,
    isFavorite: favorite,
    lastEditedAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - (hoursAgo + 24) * 60 * 60 * 1000),
  });
  if (trashed) note.moveToTrash();
  return note;
};

const run = async () => {
  if (!env.mongoUri) {
    logger.error('MONGO_URI missing - backend/.env bharo');
    process.exit(1);
  }
  await mongoose.connect(env.mongoUri);
  logger.success('MongoDB connected (seed)');

  // purana demo data saaf karo
  const old = await User.findOne({ email: DEMO_EMAIL });
  if (old) {
    await Promise.all([
      Note.deleteMany({ user: old._id }),
      Folder.deleteMany({ user: old._id }),
      Tag.deleteMany({ user: old._id }),
      User.deleteOne({ _id: old._id }),
    ]);
    logger.info('Purana demo data delete kiya');
  }

  const user = await User.create({ name: 'Brajesh Upadhyay', email: DEMO_EMAIL, password: DEMO_PASSWORD, provider: 'local' });
  logger.success(`Demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  const folderDefs = [
    { name: 'Class 12', color: '#1D4ED8' },
    { name: 'Class 12/Business Studies', parent: 'Class 12', color: '#2563EB' },
    { name: 'Class 12/Accountancy', parent: 'Class 12', color: '#0EA5E9' },
    { name: 'JEE Preparation', color: '#7C3AED' },
    { name: 'JEE Preparation/Physics', parent: 'JEE Preparation', color: '#8B5CF6' },
    { name: 'Personal', color: '#059669' },
    { name: 'Work', color: '#EA580C' },
  ];

  const folderMap = {};
  for (const def of folderDefs) {
    const parent = def.parent ? folderMap[def.parent] : null;
    const folder = await Folder.create({
      user: user._id,
      name: def.name.includes('/') ? def.name.split('/')[1] : def.name,
      parent: parent?._id || null,
      ancestors: parent ? [...parent.ancestors, parent._id] : [],
      path: def.name,
      depth: def.name.split('/').length - 1,
      color: def.color,
    });
    folderMap[def.name] = folder;
  }
  logger.success(`${folderDefs.length} folders banaye (nested included)`);

  const tagDefs = [
    { name: 'business', color: '#1D4ED8' },
    { name: 'economics', color: '#0EA5E9' },
    { name: 'physics', color: '#7C3AED' },
    { name: 'important', color: '#DC2626' },
    { name: 'revision', color: '#059669' },
  ];
  const tagMap = {};
  for (const t of tagDefs) tagMap[t.name] = await Tag.create({ user: user._id, ...t });

  const notes = [
    buildNote(user._id, folderMap['Class 12']._id, [tagMap.business._id], {
      title: 'Business Environment - Chapter 1',
      pinned: true,
      favorite: true,
      hoursAgo: 2,
      nodes: [
        heading('1. Introduction'),
        bullet([
          'Business environment refers to the sum total of all internal and external factors that influence a business.',
          'It includes economic, social, political, legal, technological and natural factors.',
          'It helps in identifying opportunities and threats.',
        ]),
        heading('2. Components'),
        ordered(['Internal Environment', 'External Environment']),
        para('External environment me micro aur macro dono aate hain - suppliers, customers, competitors, government policy, tech change etc.'),
      ],
    }),
    buildNote(user._id, folderMap['Class 12/Accountancy']._id, [tagMap.important._id], {
      title: 'Microeconomics - Introduction',
      hoursAgo: 4,
      nodes: [
        heading('Microeconomics kya hai?'),
        bullet(['Individual unit level study', 'Demand & supply, elasticity, market structures']),
        code('const demand = (price, qty) => price * qty; // total revenue', 'javascript'),
      ],
    }),
    buildNote(user._id, folderMap['JEE Preparation/Physics']._id, [tagMap.physics._id, tagMap.important._id], {
      title: 'JEE Physics - Motion in a Straight Line',
      hoursAgo: 6,
      favorite: true,
      nodes: [
        heading('Key Formulas'),
        ordered(['v = u + at', 's = ut + ½at²', 'v² = u² + 2as']),
        para('Graphs yaad rakho: v-t graph ka slope = acceleration, area = displacement.'),
        code('// relative velocity\nv_ab = v_a - v_b', 'javascript'),
      ],
    }),
    buildNote(user._id, folderMap['JEE Preparation']._id, [], {
      title: 'Chemistry - Periodic Table',
      hoursAgo: 24,
      nodes: [heading('Groups & Periods'), bullet(['Group me properties similar hoti hain', 'Period me left->right metallic character ghatta hai'])],
    }),
    buildNote(user._id, folderMap['Personal']._id, [tagMap.revision._id], {
      title: 'Personal Goals',
      hoursAgo: 24,
      nodes: [heading('2026 Goals'), ordered(['Daily 2 hours DSA', 'Notes Heaven launch karna', 'Gym 5 days/week'])],
    }),
    buildNote(user._id, folderMap['Class 12/Business Studies']._id, [tagMap.business._id, tagMap.revision._id], {
      title: 'Business Studies Notes',
      hoursAgo: 24,
      nodes: [para('Management principles, planning, organising, staffing, directing aur controlling ke notes.')],
    }),
    buildNote(user._id, folderMap['Class 12/Business Studies']._id, [tagMap.business._id, tagMap.important._id], {
      title: 'Business Environment - Important Questions',
      hoursAgo: 24,
      nodes: [para('Q1. Business environment ke features batao? Q2. Micro vs macro environment difference?')],
    }),
    buildNote(user._id, folderMap['Class 12/Accountancy']._id, [tagMap.business._id], {
      title: 'Principles of Management',
      hoursAgo: 72,
      nodes: [bullet(['Division of work', 'Authority & responsibility', 'Unity of command', 'Scalar chain'])],
    }),
    buildNote(user._id, folderMap['Class 12']._id, [tagMap.business._id], {
      title: 'Business Environment - Summary',
      hoursAgo: 96,
      nodes: [para('Chapter 1 ka quick revision summary: environment ke dimensions aur unka business par impact.')],
    }),
    buildNote(user._id, folderMap['Work']._id, [], {
      title: 'Old meeting notes (trash demo)',
      hoursAgo: 120,
      trashed: true,
      nodes: [para('Ye note trash me hai - 5 din baad auto delete ho jayega. Recover ya permanently delete kar sakte ho.')],
    }),
  ];

  await Note.insertMany(notes);
  logger.success(`${notes.length} demo notes insert kiye`);
  logger.info('Ab chalao: npm run dev  ->  http://localhost:5000/api/health');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
