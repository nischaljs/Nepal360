import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuthStore } from '../../store/auth.store';
import {
  getComments,
  addComment,
  deleteComment,
  type Comment,
} from '../../services/comment.service';

interface CommentSectionProps {
  campaignId: string;
}

const CommentSection = ({ campaignId }: CommentSectionProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [campaignId]);

  const fetchComments = async () => {
    try {
      const data = await getComments(campaignId, showAll ? 100 : 5);
      setComments(data.comments);
      setTotal(data.total);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment = await addComment(campaignId, content.trim());
      setComments((prev) => [newComment, ...prev]);
      setTotal((prev) => prev + 1);
      setContent('');
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleShowMore = async () => {
    setShowAll(true);
    try {
      const data = await getComments(campaignId, 100);
      setComments(data.comments);
    } catch {
      // silently fail
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          Discussion ({total})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                maxLength={1000}
                rows={2}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{content.length}/1000</span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
            Please <a href="/login" className="text-emerald-600 font-medium hover:underline">login</a> to join the discussion.
          </p>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {comment.user.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {user?.id === comment.user.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-gray-400 hover:text-red-500"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-line break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            {!showAll && total > 5 && (
              <button
                onClick={handleShowMore}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mx-auto block"
              >
                Show all {total} comments
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentSection;
