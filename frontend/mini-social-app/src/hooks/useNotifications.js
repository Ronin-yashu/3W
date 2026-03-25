/**
 * @file useNotifications.js
 * @description Derives notifications from posts where the current user is the post author
 * and others have liked or commented. Tracks which notifications have been "seen".
 * Calling markAllRead() resets the unread count to 0.
 */
import { useMemo, useState, useCallback } from 'react';

export function useNotifications(posts, currentUsername) {
  const [seenCount, setSeenCount] = useState(0);

  // Build full notification list from posts
  const allNotifications = useMemo(() => {
    if (!currentUsername || !posts.length) return [];
    const notifs = [];

    posts.forEach(post => {
      if (post.username !== currentUsername) return; // only my posts

      // Likes from others
      post.likes
        .filter(l => l.username !== currentUsername)
        .forEach(l => notifs.push({
          id: `like-${post._id}-${l.username}`,
          type: 'like',
          from: l.username,
          postText: post.text?.slice(0, 40) || 'your post',
          postId: post._id,
        }));

      // Comments from others
      post.comments
        .filter(c => c.username !== currentUsername)
        .forEach(c => notifs.push({
          id: `comment-${post._id}-${c.username}-${c.text?.slice(0, 10)}`,
          type: 'comment',
          from: c.username,
          text: c.text?.slice(0, 60),
          postText: post.text?.slice(0, 40) || 'your post',
          postId: post._id,
        }));
    });

    return notifs;
  }, [posts, currentUsername]);

  // Unread = total - how many were seen when drawer was last opened
  const unreadCount = Math.max(0, allNotifications.length - seenCount);

  // Call this when notification drawer opens — resets unread badge to 0
  const markAllRead = useCallback(() => {
    setSeenCount(allNotifications.length);
  }, [allNotifications.length]);

  return { notifications: allNotifications, unreadCount, markAllRead };
}
