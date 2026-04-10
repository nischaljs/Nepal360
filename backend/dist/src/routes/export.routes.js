"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const router = (0, express_1.Router)();
router.get('/donations', auth_middleware_1.requireAuth, (0, errohandler_middleware_1.catchAsync)(export_controller_1.exportMyDonations));
exports.default = router;
