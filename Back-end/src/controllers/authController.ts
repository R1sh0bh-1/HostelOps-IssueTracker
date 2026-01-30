import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { HttpError } from '../utils/httpError';
import { signJwt } from '../utils/jwt';
import { deleteOperation } from '../utils/cloudinary';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  room: z.string().optional().default(''),
  hostel: z.string().optional().default('Boys Hostel A'),
  block: z.string().optional().default(''),
  role: z.enum(['student', 'warden']).optional().default('student'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  hostel: z.string().optional(),
  block: z.string().optional(),
  room: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

export async function signup(req: any, res: any) {
  const data = signupSchema.parse(req.body);
  const existing = await UserModel.findOne({ email: data.email });
  if (existing) throw new HttpError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Map 'warden' role to 'management' in the database
  const userRole = data.role === 'warden' ? 'management' : 'student';

  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: userRole,
    hostel: data.hostel,
    block: data.block,
    room: data.room,
  });

  const token = signJwt({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.status(201).json({ token, user: user.toJSON() });
}

export async function login(req: any, res: any) {
  const data = loginSchema.parse(req.body);
  const user = await UserModel.findOne({ email: data.email }).select('+passwordHash');
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const ok = await user.verifyPassword(data.password);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  const token = signJwt({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.json({ token, user: user.toJSON() });
}

export async function me(req: any, res: any) {
  const user = await UserModel.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');
  req.user.room = user.room;
  res.json({ user: user.toJSON() });
}

export async function updateMe(req: any, res: any) {
  const data = updateMeSchema.parse(req.body);
  const user = await UserModel.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');

  if (data.name) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.hostel) user.hostel = data.hostel;
  if (data.block) user.block = data.block;
  if (data.room) user.room = data.room;

  // Handle avatar update/removal with Cloudinary cleanup
  if (data.avatar !== undefined) {
    const oldAvatar = user.avatar;

    // If user had an old avatar and it's being changed/removed, delete from Cloudinary
    if (oldAvatar && oldAvatar !== data.avatar) {
      // Only delete if it's a Cloudinary URL
      if (oldAvatar.includes('cloudinary.com')) {
        await deleteOperation(oldAvatar);
      }
    }

    user.avatar = data.avatar;
  }

  await user.save();

  const io = req.app.get('io');
  // Emit to specific user if we had rooms per user, but for now broadcast or just use checking
  // If we want real-time sync across devices for the SAME user, we filter on client or emit to room 'user:ID'
  // For simplicity, let's emit a generic 'user:updated' and client filters
  io?.emit('user:updated', user.toJSON());

  res.json({ user: user.toJSON() });
}

