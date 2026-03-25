/**
 * @file usePosts.js
 * @description Custom hook for cursor-based paginated post fetching.
 * Handles loading state, infinite scroll trigger, and post updates.
 */
import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';

/**
 * @typedef {Object} Post
 * @property {string} _id
 * @property {string} username
 * @property {string} [text]
 * @property {string} [imageUrl]
 * @property {Array} likes
 * @property {Array} comments
 * @property {string} createdAt
 */

/**
 * Custom hook for fetching and paginating posts.
 * @returns {{
 *   posts: Post[],
 *   loading: boolean,
 *   loadingMore: boolean,
 *   hasMore: boolean,
 *   fetchPosts: Function,
 *   loadMore: Function,
 *   updatePost: Function,
 *   prependPost: Function,
 * }}
 */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef(null); // stores last post _id for next page

  /**
   * Fetches the first page of posts. Resets all state.
   */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    try {
      const { data } = await api.get('/api/posts?limit=10');
      setPosts(data.posts);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches the next page using the stored cursor.
   * Appends new posts to the existing list.
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/api/posts?limit=10&cursor=${cursorRef.current}`);
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  /**
   * Updates a single post in the list (e.g. after like/comment).
   * @param {Post} updatedPost
   */
  const updatePost = useCallback((updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  }, []);

  /**
   * Prepends a newly created post to the top of the feed.
   * @param {Post} newPost
   */
  const prependPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  return { posts, loading, loadingMore, hasMore, fetchPosts, loadMore, updatePost, prependPost };
}
