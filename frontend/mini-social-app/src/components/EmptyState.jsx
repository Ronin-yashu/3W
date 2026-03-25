/**
 * @file EmptyState.jsx
 * @description Reusable empty / zero-state component for feed, profile, and search results.
 */
import { Box, Typography } from '@mui/material';

/**
 * @param {Object} props
 * @param {string} props.emoji
 * @param {string} props.title
 * @param {string} [props.subtitle]
 */
export default function EmptyState({ emoji, title, subtitle }) {
  return (
    <Box textAlign="center" mt={8} px={3}>
      <Typography sx={{ fontSize: { xs: 48, sm: 64 }, lineHeight: 1 }}>{emoji}</Typography>
      <Typography variant="h6" fontWeight={700} mt={2} color="text.primary"
        sx={{ fontSize: { xs: 16, sm: 20 } }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>
      )}
    </Box>
  );
}
