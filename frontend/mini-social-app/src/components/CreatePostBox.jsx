/**
 * @file CreatePostBox.jsx
 * @description Reusable "Create Post" card used in the Feed.
 * Handles text input, image preview, and submission.
 */
import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Divider, IconButton } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * @param {Object} props
 * @param {Function} props.onPost - called with the new post object after successful creation
 * @param {boolean} props.darkMode
 */
export default function CreatePostBox({ onPost, darkMode }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const cardBg = darkMode ? '#1e1e1e' : '#fff';
  const border = darkMode ? '#2a2a2a' : '#e8eaf0';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const clearImage = () => { setImage(null); setPreview(null); };

  const handleSubmit = async () => {
    if (!text.trim() && !image) return;
    setPosting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text);
      if (image) formData.append('image', image);
      const { data } = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPost(data);
      setText(''); setImage(null); setPreview(null);
    } catch (err) {
      console.error('Post creation failed:', err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: border, bgcolor: cardBg, mb: 2, overflow: 'hidden' }}>
      <Box p={{ xs: 1.5, sm: 2 }}>
        {/* Composer label */}
        <Typography variant="subtitle2" fontWeight={700} mb={1}
          sx={{ fontSize: { xs: 13, sm: 15 } }}>Create Post</Typography>

        {/* Text input */}
        <TextField
          placeholder="What's on your mind?"
          multiline minRows={2} fullWidth
          value={text} onChange={e => setText(e.target.value)}
          variant="standard"
          inputProps={{ maxLength: 500 }}
          sx={{ '& .MuiInput-root': { fontSize: { xs: 13, sm: 14 } } }}
        />

        {/* Character count */}
        {text.length > 400 && (
          <Typography variant="caption" color={text.length >= 500 ? 'error' : 'text.secondary'}
            display="block" textAlign="right" mt={0.5}>
            {500 - text.length} chars left
          </Typography>
        )}

        {/* Image preview */}
        {preview && (
          <Box mt={1.5} position="relative">
            <img src={preview} alt="preview"
              style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
            <IconButton size="small" onClick={clearImage}
              sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: border }} />

      {/* Actions row */}
      <Box display="flex" alignItems="center" justifyContent="space-between"
        px={{ xs: 1.5, sm: 2 }} py={1}>
        <IconButton component="label" size="small" sx={{ color: '#1976d2' }}>
          <ImageOutlinedIcon fontSize="small" />
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </IconButton>
        <Button
          variant="contained" size="small"
          endIcon={<SendIcon fontSize="small" />}
          onClick={handleSubmit}
          disabled={posting || (!text.trim() && !image)}
          sx={{ borderRadius: 5, px: { xs: 2, sm: 3 }, fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}
        >
          {posting ? 'Posting...' : 'Post'}
        </Button>
      </Box>
    </Paper>
  );
}
