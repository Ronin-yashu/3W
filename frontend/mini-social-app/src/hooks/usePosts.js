/**
 * @file usePosts.js
 * @description Post fetching with:
 * - WebSocket listener for real-time like/comment updates (post:updated event)
 * - Polling only for new posts (every 15s) — stops when tab is hidden
 * - Optimistic updatePost for instant UI feedback
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from './useSocket';

const NEW_POST_POLL_INTERVAL = 15000; // 15 seconds — only checks for new posts

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hasNewPost, setHasNewPost] = useState(false); // true/false banner (not a count)
  const cursorRef = useRef(null);
  const pollingRef = useRef(null);
  const topPostIdRef = useRef(null); // ID of the newest post we know about
  const socket = useSocket();

  // ── Initial fetch ──────────────────────────────────────────────────────────
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
      console.error('fetchPosts failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── WebSocket: real-time like/comment updates ──────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handlePostUpdated = (updatedPost) => {
      // Update the post in-place — zero reload, zero scroll jump
      setPosts(prev =>
        prev.map(p => p._id === updatedPost._id ? updatedPost : p)
      );
    };
    socket.on('post:updated', handlePostUpdated);
    return () => socket.off('post:updated', handlePostUpdated);
  }, [socket]);

  // ── Polling: only checks for brand-new posts ───────────────────────────────
  const checkForNewPosts = useCallback(async () => {
    if (!topPostIdRef.current) return;
    try {
      const { data } = await api.get('/api/posts?limit=1');
      const latestId = data.posts[0]?._id;
      // If newest post on server is different from what we have → show banner
      if (latestId && latestId !== topPostIdRef.current) {
        setHasNewPost(true);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (loading) return;
    pollingRef.current = setInterval(checkForNewPosts, NEW_POST_POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loading, checkForNewPosts]);

  // Stop polling when tab hidden, resume + immediately check on focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(pollingRef.current);
      } else {
        checkForNewPosts();
        pollingRef.current = setInterval(checkForNewPosts, NEW_POST_POLL_INTERVAL);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [checkForNewPosts]);

  // ── Load more (infinite scroll) ────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/api/posts?limit=10&cursor=${cursorRef.current}`);
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      cursorRef.current = data.nextCursor;
    } catch (err) {
      console.error('loadMore failed:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  // ── Optimistic update (for the acting user's own like/comment) ─────────────
  const updatePost = useCallback((updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  }, []);

  // ── Prepend own new post immediately ──────────────────────────────────────
  const prependPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
    topPostIdRef.current = newPost._id;
    setHasNewPost(false);
  }, []);

  // ── Refresh feed when user taps banner ────────────────────────────────────
  const refreshFeed = useCallback(async () => {
    setHasNewPost(false);
    await fetchPosts();
  }, [fetchPosts]);

  return {
    posts, loading, loadingMore, hasMore, hasNewPost,
    fetchPosts, loadMore, updatePost, prependPost, refreshFeed
  };
}
