import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name 60 characters se chhota rakho'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email daalo'],
    },
    password: {
      type: String,
      minlength: [6, 'Password kam se kam 6 characters ka ho'],
      select: false, // by default query me nahi aayega
    },
    avatar: { type: String, default: '' },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, select: false },

    // forgot password
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    prefs: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      defaultFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ createdAt: -1 });

/** password hash karo, sirf tab jab change hua ho */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.publicProfile = function publicProfile() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    provider: this.provider,
    prefs: this.prefs,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
