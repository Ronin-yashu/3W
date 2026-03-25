/**
 * @file NotificationDrawer.jsx
 * @description Slide-in notification drawer. Calls markAllRead on open.
 */
import {
  Drawer, Box, Typography, IconButton, List, ListItem,
  ListItemAvatar, Avatar, ListItemText, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useEffect } from 'react';

export default function NotificationDrawer({ open, onClose, notifications, unreadCount, markAllRead, darkMode }) {
  const bg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';

  // Reset badge as soon as drawer opens
  useEffect(() => {
    if (open) markAllRead();
  }, [open, markAllRead]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '85vw', sm: 360 }, bgcolor: bg } }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: border,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700} fontSize={16}>Notifications</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {notifications.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} py={6} gap={1}>
          <Typography fontSize={36}>🔔</Typography>
          <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
        </Box>
      ) : (
        <List disablePadding>
          {notifications.map((n, i) => (
            <Box key={n.id}>
              <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: n.type === 'like' ? '#e53935' : '#1976d2', fontSize: 13, fontWeight: 700 }}>
                    {n.type === 'like'
                      ? <FavoriteIcon sx={{ fontSize: 16 }} />
                      : <ChatBubbleIcon sx={{ fontSize: 16 }} />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600} fontSize={13}>
                      <span style={{ color: '#1976d2' }}>@{n.from}</span>
                      {n.type === 'like' ? ' liked your post' : ' commented on your post'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {n.type === 'comment' ? `"${n.text}"` : `"${n.postText}"`}
                    </Typography>
                  }
                />
              </ListItem>
              {i < notifications.length - 1 && <Divider sx={{ borderColor: border }} />}
            </Box>
          ))}
        </List>
      )}
    </Drawer>
  );
}
