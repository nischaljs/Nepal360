"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prediction_controller_1 = require("../controllers/prediction.controller");
const router = (0, express_1.Router)();
router.get('/:campaignId', prediction_controller_1.getFundraisingPrediction);
exports.default = router;
