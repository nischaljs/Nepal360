import { useState } from 'react';
import { downloadReceipt } from '../../services/receipt.service';
import { Button } from './button';

interface ReceiptDownloadButtonProps {
  donationId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export default function ReceiptDownloadButton({
  donationId,
  variant = 'outline',
  size = 'default',
}: ReceiptDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const blob = await downloadReceipt(donationId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${donationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download receipt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? 'Downloading...' : 'Download Receipt'}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
