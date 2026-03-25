/**
 * @file InfiniteScrollTrigger.jsx
 * @description Invisible sentinel element that triggers `onIntersect` when scrolled into view.
 * Uses IntersectionObserver for efficient scroll detection without scroll event listeners.
 */
import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * @param {Object} props
 * @param {Function} props.onIntersect - called when sentinel enters viewport
 * @param {boolean} props.hasMore - whether more data exists
 * @param {boolean} props.loading - whether a load is in progress
 */
export default function InfiniteScrollTrigger({ onIntersect, hasMore, loading }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loading) onIntersect(); },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onIntersect, hasMore, loading]);

  return (
    <Box ref={ref} display="flex" justifyContent="center" alignItems="center" py={3}>
      {loading && <CircularProgress size={28} />}
      {!hasMore && !loading && (
        <Typography variant="caption" color="text.secondary">You're all caught up ✨</Typography>
      )}
    </Box>
  );
}
