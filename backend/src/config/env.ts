import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  KHALTI_SECRET_KEY: z.string().min(1, 'KHALTI_SECRET_KEY is required'),
  PORT: z.coerce.number().default(3000),
  KHALTI_API_URL: z.string().default('https://dev.khalti.com/api/v2'),
  WEBSITE_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BACKEND_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
