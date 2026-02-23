import { useEffect, useState } from 'react';
import { getCampaignWishes, type BestWish } from '../../services/bestWish.service';
import { Spinner } from '../../components/ui/spinner';

interface BestWishesSliderProps {
  campaignId: string;
}

const cardStyles = {
  simple: 'bg-white border border-gray-200',
  heartfelt: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200',
  festive: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
  minimal: 'bg-gray-50 border border-gray-100',
};

export default function BestWishesSlider({ campaignId }: BestWishesSliderProps) {
  const [wishes, setWishes] = useState<BestWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    getCampaignWishes(campaignId)
      .then((data) => setWishes(data.wishes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error || wishes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        Best Wishes
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {wishes.map((wish) => (
          <div
            key={wish.id}
            className={`flex-shrink-0 w-72 p-4 rounded-xl shadow-sm ${cardStyles[wish.cardStyle]}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {wish.isAnonymous ? '?' : wish.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {wish.isAnonymous ? 'Anonymous Donor' : wish.user?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(wish.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-gray-700 text-sm line-clamp-4">
                "{wish.message}"
              </p>
            </div>

            {wish.cardStyle === 'heartfelt' && (
              <div className="mt-2 text-pink-500">heartfelt</div>
            )}
            {wish.cardStyle === 'festive' && (
              <div className="mt-2 text-yellow-500">festive</div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
