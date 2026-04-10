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
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveHomepageOg = exports.serveCampaignOg = void 0;
const prisma_1 = require("../lib/prisma");
const env_1 = require("../config/env");
const CRAWLER_AGENTS = [
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'Telegram',
];
function isCrawler(userAgent) {
    if (!userAgent)
        return false;
    return CRAWLER_AGENTS.some((agent) => userAgent.includes(agent));
}
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function buildOgHtml(meta) {
    const title = escapeHtml(meta.title);
    const description = escapeHtml(meta.description);
    const image = meta.image ? escapeHtml(meta.image) : '';
    const url = escapeHtml(meta.url);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  ${image ? `<meta property="og:image" content="${image}" />` : ''}
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Nepal360" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${image ? `<meta name="twitter:image" content="${image}" />` : ''}
</head>
<body></body>
</html>`;
}
const serveCampaignOg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ua = req.headers['user-agent'];
    if (!isCrawler(ua)) {
        return res.redirect(`${env_1.env.CORS_ORIGIN}/campaigns/${req.params.id}`);
    }
    try {
        const campaign = yield prisma_1.prisma.campaign.findUnique({
            where: { id: req.params.id },
            select: { title: true, description: true, coverImage: true },
        });
        if (!campaign) {
            return res.redirect(`${env_1.env.CORS_ORIGIN}/campaigns/${req.params.id}`);
        }
        const description = campaign.description.length > 200
            ? campaign.description.substring(0, 200) + '...'
            : campaign.description;
        const coverImage = ((_a = campaign.coverImage) === null || _a === void 0 ? void 0 : _a.startsWith('http'))
            ? campaign.coverImage
            : campaign.coverImage
                ? `${env_1.env.BACKEND_URL}${campaign.coverImage}`
                : undefined;
        const html = buildOgHtml({
            title: campaign.title,
            description,
            image: coverImage,
            url: `${env_1.env.CORS_ORIGIN}/campaigns/${req.params.id}`,
        });
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
    catch (_b) {
        res.redirect(`${env_1.env.CORS_ORIGIN}/campaigns/${req.params.id}`);
    }
});
exports.serveCampaignOg = serveCampaignOg;
const serveHomepageOg = (req, res) => {
    const ua = req.headers['user-agent'];
    if (!isCrawler(ua)) {
        return res.redirect(env_1.env.CORS_ORIGIN);
    }
    const html = buildOgHtml({
        title: 'Nepal360 - Crowdfunding for Nepal',
        description: "Nepal's most trusted crowdfunding platform. Create campaigns, donate, and make an impact.",
        url: env_1.env.CORS_ORIGIN,
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
};
exports.serveHomepageOg = serveHomepageOg;
