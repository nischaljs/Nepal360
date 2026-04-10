"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const client_1 = require("../../generated/prisma/client");
const env_1 = require("../config/env");
const adapter = new adapter_mariadb_1.PrismaMariaDb(env_1.env.DATABASE_URL);
const prisma = new client_1.PrismaClient({ adapter });
exports.prisma = prisma;
