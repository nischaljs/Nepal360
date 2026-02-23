import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export interface ReceiptData {
  donation: {
    amount: string | number;
    createdAt: Date;
    paymentRef?: string | null;
    pidx?: string | null;
    status: string;
    visibility: string;
  };
  donor: {
    name: string;
    email: string;
  };
  campaign: {
    id: string;
    title: string;
    beneficiary: {
      name: string;
    };
  };
  receiptNumber: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Nepal360', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Crowdfunding Platform', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('www.nepal360.com', { align: 'center' })
      .moveDown(1);

    doc
      .fillColor('#000000')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('DONATION RECEIPT', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Receipt #: ${data.receiptNumber}`, { align: 'center' })
      .moveDown(0.3);

    doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, { align: 'center' })
       .moveDown(1.5);

    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('DONOR INFORMATION')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Name: ${data.donor.name}`)
      .text(`Email: ${data.donor.email}`)
      .moveDown(1);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('CAMPAIGN INFORMATION')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Campaign: ${data.campaign.title}`)
      .text(`Beneficiary: ${data.campaign.beneficiary.name}`)
      .text(`Campaign ID: ${data.campaign.id}`)
      .moveDown(1);

    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('DONATION DETAILS')
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Amount: NPR ${Number(data.donation.amount).toLocaleString()}`)
      .text(`Method: Khalti Payment`)
      .text(`Status: ${data.donation.status}`)
      .text(`Date: ${format(new Date(data.donation.createdAt), 'MMMM d, yyyy HH:mm')}`)
      .moveDown(0.5);

    if (data.donation.paymentRef) {
      doc.text(`Transaction Ref: ${data.donation.paymentRef}`);
    }
    if (data.donation.pidx) {
      doc.text(`Khalti IDX: ${data.donation.pidx}`);
    }
    doc.text(`Visibility: ${data.donation.visibility}`);

    doc.moveDown(1.5);

    const totalY = doc.y;
    doc
      .fillColor('#f3f4f6')
      .rect(50, totalY, 495, 40)
      .fill();

    doc
      .fillColor('#000000')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`TOTAL: NPR ${Number(data.donation.amount).toLocaleString()}`, 60, totalY + 13);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .moveDown(3)
      .text('This receipt is generated automatically and serves as proof of donation.', { align: 'center' })
      .text('Thank you for your generous donation to support those in need.', { align: 'center' })
      .moveDown(0.5)
      .text('Nepal360 - Empowering Dreams, Changing Lives', { align: 'center' });

    doc.end();
  });
}

export function generateReceiptNumber(donationId: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const shortId = donationId.slice(0, 6).toUpperCase();
  return `N360-${year}${month}-${shortId}`;
}
