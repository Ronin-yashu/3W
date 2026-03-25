/**
 * @file usePosts.js
 * @description Custom hook for paginated post fetching with background polling.
 * Polls every 8 seconds to sync new likes/comments from other users.
 * Uses smart merge so existing posts update in-place (no scroll jump).
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';

const POLL_INTERVAL = 8000; // 8 seconds

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0); // "X new posts" banner
  const cursorRef = useRef(null);
  const pollingRef = useRef(null);
  const latestPostIdRef = useRef(null); // track newest post for new-post detection

  /**
   * Fetches first page. Resets all state.
   */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    try {
      const { data } = await api.get('/api/posts?limit=10');
      setPosts(data.posts);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
      if (data.posts.length > 0) latestPostIdRef.current = data.posts[0]._id;
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Background poll — silently re-fetches latest posts and merges:
   * - Updates existing posts in-place (likes/comments change without scroll jump)
   * - Detects brand-new posts and shows a "X new posts" banner instead of auto-injecting
   */
  const silentRefresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/posts?limit=10');
      const incoming = data.posts;

      setPosts(prev => {
        const prevIds = new Set(prev.map(p => p._id));

        // Count truly new posts (not yet in our list)
        const brandNew = incoming.filter(p => !prevIds.has(p._id));
        if (brandNew.length > 0) {
          setNewPostCount(c => c + brandNew.length);
        }

        // Merge: update existing posts with fresh like/comment data
        const incomingMap = Object.fromEntries(incoming.map(p => [p._id, p]));
        return prev.map(p => incomingMap[p._id] ? incomingMap[p._id] : p);
      });
    } catch (err) {
      // Silently ignore poll errors — don't disrupt the UI
    }
  }, []);

  /**
   * Load the next page (infinite scroll).
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
      console.error('Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  /**
   * Updates a single post optimistically (immediate UI update after like/comment).
   */
  const updatePost = useCallback((updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  }, []);

  /**
   * Prepend a new post to the top and reset the new-post banner.
   */
  const prependPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
    latestPostIdRef.current = newPost._id;
  }, []);

  /**
   * Called when user taps "X new posts" banner — reloads feed from top.
   */
  const refreshFeed = useCallback(async () => {
    setNewPostCount(0);
    await fetchPosts();
  }, [fetchPosts]);

  // Start polling after initial load, stop when component unmounts
  useEffect(() => {
    if (loading) return;
    pollingRef.current = setInterval(silentRefresh, POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loading, silentRefresh]);

  // Stop polling when tab is hidden, resume when visible (saves bandwidth)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(pollingRef.current);
      } else {
        silentRefresh(); // immediate refresh on tab focus
        pollingRef.current = setInterval(silentRefresh, POLL_INTERVAL);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [silentRefresh]);

  return {
    posts, loading, loadingMore, hasMore, newPostCount,
    fetchPosts, loadMore, updatePost, prependPost, refreshFeed
  };
}
