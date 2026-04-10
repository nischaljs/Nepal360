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
exports.generateCertificate = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma_1 = require("../lib/prisma");
const date_fns_1 = require("date-fns");
const generateCertificate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { donationId } = req.params;
        const donation = yield prisma_1.prisma.moneyDonation.findUnique({
            where: { id: donationId },
            include: {
                donor: { select: { name: true, email: true } },
                campaign: { select: { title: true } },
            },
        });
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        if (donation.donorId !== user.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        if (donation.status !== 'COMPLETED') {
            return res
                .status(400)
                .json({ success: false, message: 'Certificate is only available for completed donations' });
        }
        const doc = new pdfkit_1.default({
            size: 'A4',
            layout: 'landscape',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="nepal360-certificate-${donationId}.pdf"`);
        doc.pipe(res);
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        // Outer border
        doc
            .rect(30, 30, pageWidth - 60, pageHeight - 60)
            .lineWidth(3)
            .strokeColor('#065f46')
            .stroke();
        // Inner border
        doc
            .rect(40, 40, pageWidth - 80, pageHeight - 80)
            .lineWidth(1)
            .strokeColor('#10b981')
            .stroke();
        // Decorative corner flourishes
        const cornerSize = 30;
        const corners = [
            { x: 45, y: 45 },
            { x: pageWidth - 45 - cornerSize, y: 45 },
            { x: 45, y: pageHeight - 45 - cornerSize },
            { x: pageWidth - 45 - cornerSize, y: pageHeight - 45 - cornerSize },
        ];
        corners.forEach((corner) => {
            doc
                .rect(corner.x, corner.y, cornerSize, cornerSize)
                .lineWidth(1.5)
                .strokeColor('#065f46')
                .stroke();
        });
        // Nepal360 logo text
        doc
            .fontSize(28)
            .fillColor('#065f46')
            .font('Helvetica-Bold')
            .text('Nepal360', 0, 70, { align: 'center' });
        // Decorative line under logo
        const lineY = 105;
        const lineWidth = 200;
        const centerX = pageWidth / 2;
        doc
            .moveTo(centerX - lineWidth / 2, lineY)
            .lineTo(centerX + lineWidth / 2, lineY)
            .lineWidth(2)
            .strokeColor('#10b981')
            .stroke();
        // Certificate title
        doc
            .fontSize(36)
            .fillColor('#111827')
            .font('Helvetica-Bold')
            .text('Certificate of Appreciation', 0, 130, { align: 'center' });
        // Subtitle
        doc
            .fontSize(14)
            .fillColor('#6b7280')
            .font('Helvetica')
            .text('This certificate is proudly presented to', 0, 185, { align: 'center' });
        // Donor name
        const donorName = donation.donor.name || 'Generous Donor';
        doc
            .fontSize(30)
            .fillColor('#065f46')
            .font('Helvetica-Bold')
            .text(donorName, 0, 215, { align: 'center' });
        // Decorative line under name
        const nameLineY = 255;
        doc
            .moveTo(centerX - 150, nameLineY)
            .lineTo(centerX + 150, nameLineY)
            .lineWidth(1)
            .strokeColor('#d1d5db')
            .stroke();
        // Donation details
        const amount = `NPR ${Number(donation.amount).toLocaleString('en-NP')}`;
        doc
            .fontSize(14)
            .fillColor('#374151')
            .font('Helvetica')
            .text(`For the generous donation of ${amount}`, 0, 275, { align: 'center' });
        doc
            .fontSize(14)
            .fillColor('#374151')
            .font('Helvetica')
            .text('in support of the campaign', 0, 298, { align: 'center' });
        // Campaign title
        doc
            .fontSize(18)
            .fillColor('#065f46')
            .font('Helvetica-Bold')
            .text(`"${donation.campaign.title}"`, 0, 325, { align: 'center' });
        // Date of donation
        const donationDate = (0, date_fns_1.format)(new Date(donation.createdAt), 'MMMM dd, yyyy');
        doc
            .fontSize(12)
            .fillColor('#6b7280')
            .font('Helvetica')
            .text(`Date of Donation: ${donationDate}`, 0, 370, { align: 'center' });
        // Certificate ID
        doc
            .fontSize(10)
            .fillColor('#9ca3af')
            .font('Helvetica')
            .text(`Certificate ID: ${donation.id}`, 0, 395, { align: 'center' });
        // Footer message
        doc
            .fontSize(12)
            .fillColor('#374151')
            .font('Helvetica-Oblique')
            .text('Your generosity makes a real difference. Thank you for being a part of Nepal360.', 0, 435, { align: 'center' });
        // Bottom decorative line
        const bottomLineY = pageHeight - 80;
        doc
            .moveTo(centerX - lineWidth / 2, bottomLineY)
            .lineTo(centerX + lineWidth / 2, bottomLineY)
            .lineWidth(2)
            .strokeColor('#10b981')
            .stroke();
        // Nepal360 footer
        doc
            .fontSize(10)
            .fillColor('#9ca3af')
            .font('Helvetica')
            .text('nepal360.org', 0, bottomLineY + 10, { align: 'center' });
        doc.end();
    }
    catch (error) {
        next(error);
    }
});
exports.generateCertificate = generateCertificate;
