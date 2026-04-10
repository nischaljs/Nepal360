"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_controller_1 = require("../controllers/activity.controller");
const router = (0, express_1.Router)();
router.get('/', activity_controller_1.getActivityFeed);
exports.default = router;
