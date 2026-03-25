/**
 * @file usePosts.js
 * WebSocket: post:updated, post:deleted, post:new
 * Polling: only checks for new posts every 15s (fallback if WS misses post:new)
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from './useSocket';

const POLL_INTERVAL = 15000;

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hasNewPost, setHasNewPost] = useState(false);
  const cursorRef = useRef(null);
  const pollingRef = useRef(null);
  const topPostIdRef = useRef(null);
  const socket = useSocket();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    try {
      const { data } = await api.get('/api/posts?limit=10');
      setPosts(data.posts);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
      if (data.posts.length > 0) topPostIdRef.current = data.posts[0]._id;
    } catch (err) {
      console.error('fetchPosts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    // Live like/comment update
    const onUpdated = (updated) =>
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));

    // Live delete
    const onDeleted = (deletedId) =>
      setPosts(prev => prev.filter(p => p._id !== deletedId));

    // Live new post from another user — show banner instead of auto-insert
    const onNew = (newPost) => {
      setPosts(prev => {
        const exists = prev.some(p => p._id === newPost._id);
        if (exists) return prev; // already prepended by own user
        setHasNewPost(true);
        return prev;
      });
    };

    socket.on('post:updated', onUpdated);
    socket.on('post:deleted', onDeleted);
    socket.on('post:new',     onNew);
    return () => {
      socket.off('post:updated', onUpdated);
      socket.off('post:deleted', onDeleted);
      socket.off('post:new',     onNew);
    };
  }, [socket]);

  // Polling fallback for new posts
  const checkForNewPosts = useCallback(async () => {
    if (!topPostIdRef.current) return;
    try {
      const { data } = await api.get('/api/posts?limit=1');
      const latestId = data.posts[0]?._id;
      if (latestId && latestId !== topPostIdRef.current) setHasNewPost(true);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (loading) return;
    pollingRef.current = setInterval(checkForNewPosts, POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loading, checkForNewPosts]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) clearInterval(pollingRef.current);
      else {
        checkForNewPosts();
        pollingRef.current = setInterval(checkForNewPosts, POLL_INTERVAL);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [checkForNewPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/api/posts?limit=10&cursor=${cursorRef.current}`);
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
    } finally { setLoadingMore(false); }
  }, [loadingMore, hasMore]);

  const updatePost = useCallback((p) =>
    setPosts(prev => prev.map(x => x._id === p._id ? p : x)), []);

  const deletePost = useCallback((id) =>
    setPosts(prev => prev.filter(p => p._id !== id)), []);

  const prependPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
    topPostIdRef.current = newPost._id;
    setHasNewPost(false);
  }, []);

  const refreshFeed = useCallback(async () => {
    setHasNewPost(false);
    await fetchPosts();
  }, [fetchPosts]);

  return {
    posts, loading, loadingMore, hasMore, hasNewPost,
    fetchPosts, loadMore, updatePost, deletePost, prependPost, refreshFeed
  };
}
