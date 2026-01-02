"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors")); // Import cors
const errohandler_middleware_1 = require("./middlewares/errohandler.middleware");
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const file_1 = require("./utils/file");
const app = (0, express_1.default)();
// Ensure uploads directory exists
(0, file_1.ensureDir)((0, file_1.getUploadDir)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent
}));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api', index_routes_1.default);
app.use(errohandler_middleware_1.errorHandler);
exports.default = app;
