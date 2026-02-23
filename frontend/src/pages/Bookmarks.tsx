import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getMyBookmarks } from '../services/bookmark.service';
import CampaignCard from '../components/campaign/CampaignCard';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Bookmarks | Nepal360';
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const data = await getMyBookmarks();
      setBookmarks(data);
    } catch {
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <Bookmark className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookmarks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {bookmarks.length} saved campaign{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No bookmarks yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Save campaigns you're interested in to find them later.
          </p>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Browse Campaigns
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <CampaignCard key={bookmark.id} campaign={bookmark.campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
