/**
 * @file useNotifications.js
 * @description Derives notifications from posts — likes and comments by others on the user's posts.
 */
import { useMemo } from 'react';

/**
 * @typedef {Object} Notification
 * @property {'like'|'comment'} type
 * @property {string} from - username of the actor
 * @property {string} text - post text or comment text
 * @property {string} postId
 */

/**
 * Derives notifications for the current user from the posts array.
 * @param {Array} posts - all posts
 * @param {string} username - current user's username
 * @returns {Notification[]}
 */
export function useNotifications(posts, username) {
  return useMemo(() => {
    if (!username || !posts.length) return [];
    const notifs = [];

    posts
      .filter(p => p.username === username)
      .forEach(post => {
        // Likes from others
        post.likes?.forEach(l => {
          if (l.username !== username)
            notifs.push({ type: 'like', from: l.username, text: post.text || 'your post', postId: post._id });
        });
        // Comments from others
        post.comments?.forEach(c => {
          if (c.username !== username)
            notifs.push({ type: 'comment', from: c.username, text: c.text, postId: post._id });
        });
      });

    return notifs.reverse();
  }, [posts, username]);
}
