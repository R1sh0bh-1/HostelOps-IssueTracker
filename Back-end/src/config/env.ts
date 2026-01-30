import dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';



const envSchema = z.object({
  NODE_ENV: z.string().optional().default('development'),
  PORT: z.coerce.number().optional().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().optional().default('7d'),
  CORS_ORIGIN: z.string().optional().default('http://localhost:8080'),
  SEED_ADMIN: z
    .string()
    .optional()
    .default('true')
    .transform(v => v === 'true'),
  ADMIN_EMAIL: z.string().email().optional().default('admin@hostel.edu'),
  ADMIN_PASSWORD: z.string().min(6).optional().default('warden123'),
  ADMIN_NAME: z.string().optional().default('Warden Smith'),
  ADMIN_ROLE: z.enum(['student', 'maintenance', 'management', 'warden']).optional().default('management'),
  // Cloudinary
  CLOUD_NAME: z.string().min(1),
  API_KEY: z.string().min(1),
  API_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);