"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const errohandler_middleware_1 = require("../middlewares/errohandler.middleware");
const router = (0, express_1.Router)();
router.get('/', (0, errohandler_middleware_1.catchAsync)(leaderboard_controller_1.listLeaderboards));
router.get('/:period/:key', (0, errohandler_middleware_1.catchAsync)(leaderboard_controller_1.getLeaderboard));
exports.default = router;
