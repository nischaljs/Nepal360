"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
require("dotenv/config");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: zod_1.z.string().min(1, 'JWT_SECRET is required'),
    KHALTI_SECRET_KEY: zod_1.z.string().min(1, 'KHALTI_SECRET_KEY is required'),
    PORT: zod_1.z.coerce.number().default(3000),
    KHALTI_API_URL: zod_1.z.string().default('https://dev.khalti.com/api/v2'),
    WEBSITE_URL: zod_1.z.string().default('http://localhost:3000'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    BACKEND_URL: zod_1.z.string().default('http://localhost:3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    GOOGLE_CLIENT_ID: zod_1.z.string().default(''),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
