"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSSEToUser = sendSSEToUser;
const express_1 = require("express");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const clients = new Map();
function sendSSEToUser(userId, event, data) {
    const userClients = clients.get(userId);
    if (!userClients)
        return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of userClients) {
        res.write(payload);
    }
}
router.get('/stream', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required.' });
    }
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    const { userId } = payload;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to notification stream.' })}\n\n`);
    // Register client
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    clients.get(userId).add(res);
    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
        res.write(`:heartbeat\n\n`);
    }, 30000);
    // Cleanup on connection close
    req.on('close', () => {
        clearInterval(heartbeat);
        const userClients = clients.get(userId);
        if (userClients) {
            userClients.delete(res);
            if (userClients.size === 0) {
                clients.delete(userId);
            }
        }
    });
});
exports.default = router;
