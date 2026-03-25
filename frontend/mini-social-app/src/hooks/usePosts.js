/**
 * usePosts.js
 * WebSocket: post:updated, post:deleted, post:new (instant)
 * Polling: new-post check every 15s (fallback + tab-visibility aware)
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from './useSocket';

const POLL_INTERVAL = 15000;

export function usePosts() {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]     = useState(false);
  const [hasNewPost, setHasNewPost] = useState(false);
  const cursorRef    = useRef(null);
  const pollingRef   = useRef(null);
  const topPostIdRef = useRef(null);
  const socketRef    = useSocket(); // ← ref object, not .current

  // ── initial fetch ─────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    cursorRef.current = null;
    try {
      const { data } = await api.get('/api/posts?limit=10');
      setPosts(data.posts);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
      if (data.posts.length > 0) topPostIdRef.current = data.posts[0]._id;
    } catch (e) { console.error('fetchPosts:', e); }
    finally { setLoading(false); }
  }, []);

  // ── WebSocket listeners (attach once socket is ready) ─────────────────
  useEffect(() => {
    // poll until socket is connected, then attach
    const attach = () => {
      const socket = socketRef.current;
      if (!socket) { setTimeout(attach, 100); return; }

      const onUpdated = (p)  => setPosts(prev => prev.map(x => x._id === p._id ? p : x));
      const onDeleted = (id) => setPosts(prev => prev.filter(x => x._id !== id));
      const onNew     = (p)  => setPosts(prev => {
        if (prev.some(x => x._id === p._id)) return prev; // own post already prepended
        setHasNewPost(true);
        return prev;
      });

      socket.on('post:updated', onUpdated);
      socket.on('post:deleted', onDeleted);
      socket.on('post:new',     onNew);

      // cleanup stored so we can remove on unmount
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

  // ── polling: only for new posts ────────────────────────────────────────
  const checkForNewPosts = useCallback(async () => {
    if (!topPostIdRef.current) return;
    try {
      const { data } = await api.get('/api/posts?limit=1');
      if (data.posts[0]?._id !== topPostIdRef.current) setHasNewPost(true);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (loading) return;
    pollingRef.current = setInterval(checkForNewPosts, POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loading, checkForNewPosts]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) clearInterval(pollingRef.current);
      else {
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
  const prependPost = useCallback((p)  => { setPosts(prev => [p, ...prev]); topPostIdRef.current = p._id; setHasNewPost(false); }, []);
  const refreshFeed = useCallback(async () => { setHasNewPost(false); await fetchPosts(); }, [fetchPosts]);

  return { posts, loading, loadingMore, hasMore, hasNewPost, fetchPosts, loadMore, updatePost, deletePost, prependPost, refreshFeed };
}
