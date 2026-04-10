"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errohandler_middleware_1 = require("./middlewares/errohandler.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const sanitize_middleware_1 = require("./middlewares/sanitize.middleware");
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const og_controller_1 = require("./controllers/og.controller");
const file_1 = require("./utils/file");
const app = (0, express_1.default)();
(0, file_1.ensureDir)((0, file_1.getUploadDir)());
app.use(express_1.default.json());
app.use(sanitize_middleware_1.sanitizeInput);
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(rateLimit_middleware_1.generalLimiter);
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/campaigns/:id', og_controller_1.serveCampaignOg);
app.get('/', og_controller_1.serveHomepageOg);
app.use('/api', index_routes_1.default);
app.use(errohandler_middleware_1.errorHandler);
exports.default = app;
