import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';
import { env } from '../config/env';

const adapter = new PrismaMariaDb(env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

export { prisma };
