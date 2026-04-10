"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificate_controller_1 = require("../controllers/certificate.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const router = (0, express_1.Router)();
router.get('/:donationId', auth_middleware_1.requireAuth, (0, errohandler_middleware_1.catchAsync)(certificate_controller_1.generateCertificate));
exports.default = router;
