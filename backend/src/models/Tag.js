import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, lowercase: true, maxlength: 30 },
    color: { type: String, default: '#64748B' },
  },
  { timestamps: true }
);

tagSchema.index({ user: 1, name: 1 }, { unique: true });

const Tag = mongoose.model('Tag', tagSchema);
export default Tag;
