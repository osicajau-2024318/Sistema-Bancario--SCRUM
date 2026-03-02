import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER_ROLE', 'ADMIN_ROLE'], default: 'USER_ROLE' },
  status: { type: Boolean, default: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model('User', userSchema);