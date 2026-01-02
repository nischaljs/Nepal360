"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const router = express_1.default.Router();
router.post('/signup', (0, errohandler_middleware_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, auth_controller_1.signup)(req.body);
    res.status(result.status).json(result.body);
})));
router.post('/verify-email', (0, errohandler_middleware_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, auth_controller_1.verifyEmail)(req.body);
    res.status(result.status).json(result.body);
})));
router.post('/login', (0, errohandler_middleware_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, auth_controller_1.login)(req.body);
    res.status(result.status).json(result.body);
})));
router.get('/me', auth_middleware_1.requireAuth, (0, errohandler_middleware_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, auth_controller_1.getCurrentUser)(req.user.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.status(200).json({ success: true, user });
})));
exports.default = router;
