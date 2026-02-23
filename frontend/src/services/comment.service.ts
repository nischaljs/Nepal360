import api from './api';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export const getComments = async (campaignId: string, limit = 20, offset = 0) => {
  const { data } = await api.get(`/comments/${campaignId}?limit=${limit}&offset=${offset}`);
  return data as { comments: Comment[]; total: number };
};

export const addComment = async (campaignId: string, content: string) => {
  const { data } = await api.post(`/comments/${campaignId}`, { content });
  return data as Comment;
};

export const deleteComment = async (id: string) => {
  await api.delete(`/comments/${id}`);
};
