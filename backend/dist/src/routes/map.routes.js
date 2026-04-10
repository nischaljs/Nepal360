"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const map_controller_1 = require("../controllers/map.controller");
const router = (0, express_1.Router)();
router.get('/campaigns', map_controller_1.getCampaignMapData);
router.get('/districts', map_controller_1.getDistrictList);
exports.default = router;
