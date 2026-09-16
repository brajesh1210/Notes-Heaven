import mongoose from 'mongoose';

/**
 * Nested folders  =  materialized path pattern
 *   path      -> "Class 12/Physics"  (breadcrumbs + descendant queries)
 *   ancestors -> [class12Id, physicsId] (root -> immediate parent)
 *
 * This lets us fetch every descendant of a nested folder in a single query:
 *   Folder.find({ user, path: new RegExp('^' + folder.path + '/') })
 */
const folderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [80, 'Folder name must be under 80 characters'],
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
    path: { type: String, default: '', index: true },
    depth: { type: Number, default: 0 },
    color: { type: String, default: '#1D4ED8' },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// names must be unique within a parent
folderSchema.index({ user: 1, parent: 1, name: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderSchema);
export default Folder;
