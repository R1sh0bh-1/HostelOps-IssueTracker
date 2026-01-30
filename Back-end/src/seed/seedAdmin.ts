import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserModel } from '../models/User';

export async function seedAdminIfNeeded(): Promise<void> {
  if (!env.SEED_ADMIN) return;

  const existing = await UserModel.findOne({ email: env.ADMIN_EMAIL });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await UserModel.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: env.ADMIN_ROLE,
    hostel: 'All Hostels',
    block: 'Admin',
    room: 'Office',
  });
}

