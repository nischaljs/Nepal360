import api from './api';

export const toggleBookmark = async (campaignId: string) => {
  const { data } = await api.post('/bookmarks/toggle', { campaignId });
  return data;
};

export const getMyBookmarks = async () => {
  const { data } = await api.get('/bookmarks/me');
  return data.data;
};

export const checkBookmark = async (campaignId: string) => {
  const { data } = await api.get(`/bookmarks/check/${campaignId}`);
  return data.bookmarked;
};
