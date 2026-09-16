import mongoose from 'mongoose';
import Tag from '../models/Tag.js';
import Note from '../models/Note.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, notFound } from '../utils/ApiError.js';

// GET /api/tags  -> all tags + how many notes use each
export const listTags = asyncHandler(async (req, res) => {
  const rows = await Tag.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(req.userId)) } },
    {
      $lookup: {
        from: 'notes',
        let: { tagId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $in: ['$$tagId', '$tags'] }, { $eq: ['$trashedAt', null] }] } } },
          { $count: 'count' },
        ],
        as: 'usage',
      },
    },
    { $addFields: { noteCount: { $ifNull: [{ $first: '$usage.count' }, 0] } } },
    { $project: { usage: 0 } },
    { $sort: { noteCount: -1, name: 1 } },
  ]);

  return ok(
    res,
    { tags: rows.map((t) => ({ id: t._id, name: t.name, color: t.color, noteCount: t.noteCount })) },
    'Tags loaded'
  );
});

// POST /api/tags
export const createTag = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim().toLowerCase();
  if (!name) throw badRequest('Tag name is required');

  const exists = await Tag.findOne({ user: req.userId, name });
  if (exists) {
    return ok(res, { tag: { id: exists._id, name: exists.name, color: exists.color } }, 'This tag already exists');
  }

  const tag = await Tag.create({ user: req.userId, name, color: req.body.color || '#64748B' });
  return created(res, { tag: { id: tag._id, name: tag.name, color: tag.color } }, 'Tag created');
});

// PUT /api/tags/:id
export const updateTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ _id: req.params.id, user: req.userId });
  if (!tag) throw notFound('Tag not found');

  if (req.body.name) tag.name = String(req.body.name).trim().toLowerCase();
  if (req.body.color) tag.color = req.body.color;
  await tag.save();

  return ok(res, { tag: { id: tag._id, name: tag.name, color: tag.color } }, 'Tag updated');
});

// DELETE /api/tags/:id  -> also remove the tag from notes
export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!tag) throw notFound('Tag not found');

  await Note.updateMany({ user: req.userId }, { $pull: { tags: tag._id } });
  return ok(res, { id: tag._id }, 'Tag deleted');
});
