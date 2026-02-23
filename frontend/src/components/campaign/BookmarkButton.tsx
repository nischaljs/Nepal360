import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/auth.store';
import { toggleBookmark, checkBookmark } from '../../services/bookmark.service';

interface BookmarkButtonProps {
  campaignId: string;
  size?: 'sm' | 'default' | 'icon';
  variant?: 'outline' | 'ghost';
}

const BookmarkButton = ({ campaignId, size = 'icon', variant = 'outline' }: BookmarkButtonProps) => {
  const { isAuthenticated } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkBookmark(campaignId).then(setIsBookmarked).catch(() => {});
    }
  }, [campaignId, isAuthenticated]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to bookmark campaigns');
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleBookmark(campaignId);
      setIsBookmarked(result.bookmarked);
      toast.success(result.bookmarked ? 'Campaign bookmarked!' : 'Bookmark removed');
    } catch {
      toast.error('Failed to toggle bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${
        isBookmarked
          ? 'text-emerald-600 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-700'
          : 'text-gray-400 border-gray-300 hover:text-emerald-600 hover:border-emerald-300 dark:border-gray-600 dark:text-gray-500 dark:hover:text-emerald-400'
      } transition-all`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark campaign'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </Button>
  );
};

export default BookmarkButton;
