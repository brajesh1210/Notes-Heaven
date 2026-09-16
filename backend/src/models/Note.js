import mongoose from 'mongoose';
import { env } from '../config/env.js';

/**
 * Note content is stored as TipTap JSON (rich text + code blocks + images),
 * plus `contentHtml` (rendering / PDF export) and `contentText` (search snippets).
 */
const versionSchema = new mongoose.Schema(
  {
    title: String,
    content: mongoose.Schema.Types.Mixed, // TipTap json
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title must be under 200 characters'],
      default: 'Untitled note',
    },

    // TipTap JSON document
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    // Last rendered HTML (Note View page + PDF export)
    contentHtml: { type: String, default: '' },
    // Plain text - used for search results and snippets
    contentText: { type: String, default: '' },

    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],

    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },

    color: { type: String, default: null },
    coverImage: { type: String, default: null },

    // ---- trash ----
    trashedAt: { type: Date, default: null, index: true },
    // MongoDB TTL index: the note is removed from the DB automatically at scheduledFor
    scheduledFor: { type: Date, default: null },

    lastEditedAt: { type: Date, default: Date.now },
    versions: { type: [versionSchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ---- Indexes ----
noteSchema.index({ user: 1, trashedAt: 1, updatedAt: -1 });
noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ user: 1, folder: 1, trashedAt: 1 });
noteSchema.index({ title: 'text', contentText: 'text' });
// automatically purged after 5 days (MongoDB deletes it itself)
noteSchema.index({ scheduledFor: 1 }, { expireAfterSeconds: 0, sparse: true });

// ---- Helpers ----
const plainFromTiptap = (node, out = []) => {
  if (!node) return out;
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => plainFromTiptap(n, out));
    return out;
  }
  if (node.type === 'text' && node.text) out.push(node.text);
  if (node.type === 'codeBlock' && node.content) out.push('\n');
  if (Array.isArray(node.content)) node.content.forEach((n) => plainFromTiptap(n, out));
  return out;
};

/** TipTap JSON -> plain text (search + snippet) */
noteSchema.methods.syncPlainText = function syncPlainText() {
  if (this.content) {
    const text = plainFromTiptap(this.content).join(' ').replace(/\s+/g, ' ').trim();
    this.contentText = text.slice(0, 5000);
  }
};

noteSchema.virtual('snippet').get(function snippet() {
  const text = (this.contentText || '').trim();
  return text.length > 160 ? `${text.slice(0, 160)}...` : text;
});

/** Move to trash and set the auto-delete date */
noteSchema.methods.moveToTrash = function moveToTrash() {
  this.trashedAt = new Date();
  this.isPinned = false;
  this.scheduledFor = new Date(Date.now() + env.trashRetentionDays * 24 * 60 * 60 * 1000);
  return this;
};

noteSchema.methods.restoreFromTrash = function restoreFromTrash() {
  this.trashedAt = null;
  this.scheduledFor = null;
  return this;
};

noteSchema.pre('save', function preSave(next) {
  if (this.isModified('content') || this.isModified('title') || this.isNew) {
    this.syncPlainText();
    if (this.isNew && !this.lastEditedAt) this.lastEditedAt = new Date();
  }
  next();
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
