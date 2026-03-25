/**
 * @file NotificationDrawer.jsx
 * @description Reusable swipeable notification drawer.
 * Shows likes and comments on the user's posts.
 */
import {
  SwipeableDrawer, Box, Typography, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Array} props.notifications
 * @param {boolean} props.darkMode
 */
export default function NotificationDrawer({ open, onClose, notifications, darkMode }) {
  const cardBg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onOpen={() => {}}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '85vw', sm: 320 }, bgcolor: cardBg } }}
    >
      {/* Header */}
      <Box p={2} display="flex" alignItems="center" justifyContent="space-between"
        sx={{ borderBottom: '1px solid', borderColor: border }}>
        <Typography variant="h6" fontWeight={700}>Notifications</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <Box textAlign="center" mt={6} p={3}>
          <Typography variant="h2">🔔</Typography>
          <Typography color="text.secondary" mt={1} fontWeight={500}>No notifications yet</Typography>
          <Typography variant="body2" color="text.secondary">When someone likes or comments on your posts, you'll see it here.</Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {notifications.map((n, i) => (
            <ListItem key={i} divider onClick={onClose}
              sx={{ cursor: 'pointer', py: 1.5, '&:hover': { bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5' } }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: n.type === 'like' ? '#e53935' : '#1976d2', width: 38, height: 38 }}>
                  {n.type === 'like'
                    ? <FavoriteIcon sx={{ fontSize: 17 }} />
                    : <ChatBubbleOutlineIcon sx={{ fontSize: 17 }} />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    @{n.from} {n.type === 'like' ? 'liked' : 'commented on'} your post
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {n.text}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </SwipeableDrawer>
  );
}
