/**
 * usePosts.js
 * WebSocket: post:updated, post:deleted, post:new (instant)
 * Polling: new-post check every 5s (fallback) — banner only if a genuinely new post exists
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from './useSocket';

const POLL_INTERVAL = 5000;

export function usePosts() {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [hasNewPost, setHasNewPost]   = useState(false);
  const cursorRef    = useRef(null);
  const pollingRef   = useRef(null);
  const topPostIdRef = useRef(null); // tracks the latest post _id we have
  const socketRef    = useSocket();

  // ── initial fetch ──────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    try {
      const { data } = await api.get('/api/posts?limit=10');
      setPosts(data.posts);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
      // seed topPostIdRef so first poll has something to compare against
      if (data.posts.length > 0) topPostIdRef.current = data.posts[0]._id;
    } catch (e) { console.error('fetchPosts:', e); }
    finally { setLoading(false); }
  }, []);

  // ── WebSocket listeners ────────────────────────────────────────────────
  useEffect(() => {
    const attach = () => {
      const socket = socketRef.current;
      if (!socket) { setTimeout(attach, 100); return; }

      const onUpdated = (p)  => setPosts(prev => prev.map(x => x._id === p._id ? p : x));
      const onDeleted = (id) => setPosts(prev => prev.filter(x => x._id !== id));
      const onNew     = (p)  => setPosts(prev => {
        if (prev.some(x => x._id === p._id)) return prev;
        setHasNewPost(true);
        return prev;
      });

      socket.on('post:updated', onUpdated);
      socket.on('post:deleted', onDeleted);
      socket.on('post:new',     onNew);

      socketRef._cleanup = () => {
        socket.off('post:updated', onUpdated);
        socket.off('post:deleted', onDeleted);
        socket.off('post:new',     onNew);
      };
    };
    attach();
    return () => socketRef._cleanup?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── polling: only show banner when a genuinely newer post exists ────────
  const checkForNewPosts = useCallback(async () => {
    // Don't run until we have a known top post to compare against
    if (!topPostIdRef.current) return;
    try {
      const { data } = await api.get('/api/posts?limit=1');
      const latestId = data.posts[0]?._id;
      // Only flag as new if latestId exists AND is different from what we already have
      if (latestId && latestId !== topPostIdRef.current) {
        setHasNewPost(true);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (loading) return;
    pollingRef.current = setInterval(checkForNewPosts, POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loading, checkForNewPosts]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(pollingRef.current);
      } else {
        checkForNewPosts();
        pollingRef.current = setInterval(checkForNewPosts, POLL_INTERVAL);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [checkForNewPosts]);

  // ── helpers ────────────────────────────────────────────────────────────
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

  const updatePost  = useCallback((p)  => setPosts(prev => prev.map(x => x._id === p._id ? p : x)), []);
  const deletePost  = useCallback((id) => setPosts(prev => prev.filter(p => p._id !== id)), []);
  const prependPost = useCallback((p)  => {
    setPosts(prev => [p, ...prev]);
    topPostIdRef.current = p._id; // update top so next poll doesn't false-positive
    setHasNewPost(false);
  }, []);
  const refreshFeed = useCallback(async () => {
    setHasNewPost(false);
    await fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, loadingMore, hasMore, hasNewPost, fetchPosts, loadMore, updatePost, deletePost, prependPost, refreshFeed };
}
