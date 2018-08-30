import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

export const hashPassword = (password) => {
  const hash = crypto.createHash('sha256');
  hash.update(password + process.env.HASHKEY);
  return hash.digest('hex');
};

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: [5, "Username must be at least 5 characters long and contain only letters, spaces, and the following special chracters: -'."],
  },
  password: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  lastModifiedBy: {
    time: Date,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
});

export const User = mongoose.model('User', userSchema);
