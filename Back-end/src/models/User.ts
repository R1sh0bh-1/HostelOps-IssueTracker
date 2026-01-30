import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '../types/auth';

export interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  hostel: string;
  block?: string;
  room?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  verifyPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'maintenance', 'management', 'warden'], required: true },
    hostel: { type: String, required: true, default: 'Unknown' },
    block: { type: String, required: false, default: '' },
    room: { type: String, required: false, default: '' },
    phone: { type: String, required: false },
    avatar: { type: String, required: false },
  },
  { timestamps: true }
);

userSchema.method('verifyPassword', async function verifyPassword(this: UserDoc, password: string) {
  return bcrypt.compare(password, this.passwordHash);
});

userSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete (ret as any)._id;
    delete (ret as any).passwordHash;
    return ret;
  },
});

export const UserModel = mongoose.model<UserDoc>('User', userSchema);

