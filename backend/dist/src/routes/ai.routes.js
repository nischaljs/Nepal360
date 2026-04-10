"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_js_1 = require("../controllers/ai.controller.js");
const router = (0, express_1.Router)();
router.post('/predict-success', ai_controller_js_1.predictSuccess);
router.get('/recommendations', ai_controller_js_1.getRecommendationsHandler);
router.get('/recommendations/similar/:campaignId', ai_controller_js_1.getSimilarCampaignsHandler);
exports.default = router;
