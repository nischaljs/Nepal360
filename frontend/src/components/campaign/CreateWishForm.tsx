/**
 * Create Wish Form
 * 
 * Form to create a best wishes card after donation
 */

import { useState } from 'react';
import { createBestWish } from '../../services/bestWish.service';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface CreateWishFormProps {
  donationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const cardStyleOptions = [
  { value: 'simple', label: 'Simple', icon: '📝', description: 'Clean and minimal' },
  { value: 'heartfelt', label: 'Heartfelt', icon: '💕', description: 'Warm and caring' },
  { value: 'festive', label: 'Festive', icon: '🎉', description: 'Celebratory' },
  { value: 'minimal', label: 'Minimal', icon: '⚪', description: 'Simple white' },
];

export default function CreateWishForm({
  donationId,
  onSuccess,
  onCancel,
}: CreateWishFormProps) {
  const [message, setMessage] = useState('');
  const [cardStyle, setCardStyle] = useState('simple');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please write a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createBestWish(donationId, {
        message: message.trim(),
        cardStyle: cardStyle as 'simple' | 'heartfelt' | 'festive' | 'minimal',
        isAnonymous,
      });
      onSuccess?.();
    } catch (err) {
      setError('Failed to send wish. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">💌 Send Best Wishes</h3>
        <p className="text-sm text-gray-500">
          Leave a message of encouragement for the campaign
        </p>
      </div>

      <div className="space-y-2">
        <Label>Choose a card style</Label>
        <RadioGroup
          value={cardStyle}
          onValueChange={setCardStyle}
          className="grid grid-cols-2 gap-2"
        >
          {cardStyleOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                cardStyle === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem value={option.value} />
              <span>{option.icon}</span>
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your Message</Label>
        <Textarea
          id="message"
          placeholder="Write something encouraging..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-600">Send anonymously</span>
      </label>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Skip
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : '💌 Send Wish'}
        </Button>
      </div>
    </form>
  );
}
