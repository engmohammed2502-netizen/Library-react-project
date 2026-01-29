import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  MoreVert as MoreIcon,
  ThumbUp as LikeIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PushPin as PinIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

const ForumPage = () => {
  const { courseId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'محمد أحمد',
      role: 'student',
      text: 'هل يمكن شرح النقطة الثالثة في المحاضرة الأخيرة؟',
      time: '10:30 ص',
      likes: 5,
      replies: [
        { id: 1, user: 'د. أحمد محمد', text: 'بالتأكيد، سأشرحها في المحاضرة القادمة', time: '11:00 ص' }
      ],
      isPinned: false
    },
    {
      id: 2,
      user: 'د. أحمد محمد',
      role: 'professor',
      text: 'تم رفع حلول التمارين على المنصة',
      time: 'أمس 3:30 م',
      likes: 12,
      replies: [],
      isPinned: true
    }
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  const userRole = 'student'; // سيأتي من الـ context

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      user: 'أنت',
      role: userRole,
      text: message,
      time: 'الآن',
      likes: 0,
      replies: [],
      isPinned: false
    };
    
    setMessages([newMessage, ...messages]);
    setMessage('');
  };

  const handleLike = (messageId: number) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
    ));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, messageId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleDelete = () => {
    if (selectedMessage) {
      setMessages(messages.filter(msg => msg.id !== selectedMessage));
      handleMenuClose();
    }
  };

  const handlePin = () => {
    if (selectedMessage) {
      setMessages(messages.map(msg =>
        msg.id === selectedMessage ? { ...msg, isPinned: !msg.isPinned } : msg
      ));
      handleMenuClose();
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'professor': return '#ff9800';
      case 'root': return '#f44336';
      default: return '#2196f3';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* العنوان */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h4" gutterBottom>
          📝 منتدى النقاش - رياضيات هندسية 1
        </Typography>
        <Typography color="textSecondary">
          اسأل وناقش مع زملائك وأساتذتك حول المادة
        </Typography>
      </Paper>

      {/* إرسال رسالة جديدة */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="اكتب سؤالك أو مشاركتك هنا..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <IconButton component="label">
              <AttachIcon />
              <input type="file" hidden accept="image/*" />
            </IconButton>
            <Typography variant="caption" sx={{ mr: 1, color: '#666' }}>
              (3MB حد أقصى للصور)
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            نشر المشاركة
          </Button>
        </Box>
      </Paper>

      {/* الرسائل المثبتة */}
      {messages.filter(m => m.isPinned).map((msg) => (
        <Paper 
          key={msg.id} 
          sx={{ 
            p: 3, 
            mb: 2, 
            border: '2px solid #ffd600',
            bgcolor: '#fffde7',
            position: 'relative'
          }}
        >
          <PinIcon sx={{ position: 'absolute', top: 10, left: 10, color: '#ff9800' }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar sx={{ 
              bgcolor: getRoleColor(msg.role),
              width: 40, 
              height: 40,
              mr: 2
            }}>
              {msg.user.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {msg.user}
                  {(msg.role as any) === 'professor' && ' 👨‍🏫'}
                </Typography>
                <Chip 
                  label="رسالة مثبتة" 
                  size="small" 
                  sx={{ ml: 1, bgcolor: '#ffecb3', color: '#ff8f00' }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mr: 'auto', ml: 2 }}>
                  {msg.time}
                </Typography>
                <IconButton size="small" onClick={() => handleMenuOpen({} as any, msg.id)}>
                  <MoreIcon />
                </IconButton>
              </Box>
              <Typography paragraph sx={{ mb: 2 }}>
                {msg.text}
              </Typography>
              
              {/* الإعجابات والردود */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <IconButton size="small" onClick={() => handleLike(msg.id)}>
                  <LikeIcon fontSize="small" />
                  <Typography variant="caption" sx={{ mr: 0.5 }}>
                    {msg.likes}
                  </Typography>
                </IconButton>
                <IconButton size="small">
                  <ReplyIcon fontSize="small" />
                  <Typography variant="caption" sx={{ mr: 0.5 }}>
                    رد
                  </Typography>
                </IconButton>
              </Box>
              
              {/* الردود */}
              {msg.replies.length > 0 && (
                <Box sx={{ mr: 4, mt: 2, borderRight: '2px solid #eee', pr: 2 }}>
                  {msg.replies.map((reply) => (
                    <Paper key={reply.id} sx={{ p: 1.5, mb: 1, bgcolor: '#f9f9f9' }}>
                      <Typography variant="body2">
                        <strong>{reply.user}:</strong> {reply.text}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {reply.time}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      ))}

      {/* جميع الرسائل */}
      <List>
        {messages.filter(m => !m.isPinned).map((msg) => (
          <Paper key={msg.id} sx={{ p: 2, mb: 2 }}>
            <ListItem alignItems="flex-start" disablePadding>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getRoleColor(msg.role) }}>
                  {msg.user.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {msg.user}
                      {(msg.role as any) === 'professor' && ' 👨‍🏫'}
                      {(msg.role as any) === 'root' && ' 👑'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 'auto', ml: 2 }}>
                      {msg.time}
                    </Typography>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, msg.id)}>
                      <MoreIcon />
                    </IconButton>
                  </Box>
                }
                secondary={
                  <>
                    <Typography paragraph sx={{ mb: 2, mt: 0.5 }}>
                      {msg.text}
                    </Typography>
                    
                    {/* الإعجابات والردود */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => handleLike(msg.id)}>
                        <LikeIcon fontSize="small" />
                        <Typography variant="caption" sx={{ mr: 0.5 }}>
                          {msg.likes}
                        </Typography>
                      </IconButton>
                      <IconButton size="small">
                        <ReplyIcon fontSize="small" />
                        <Typography variant="caption" sx={{ mr: 0.5 }}>
                          رد
                        </Typography>
                      </IconButton>
                    </Box>
                    
                    {/* الردود */}
                    {msg.replies.length > 0 && (
                      <Box sx={{ mr: 4, mt: 2, borderRight: '2px solid #eee', pr: 2 }}>
                        {msg.replies.map((reply) => (
                          <Paper key={reply.id} sx={{ p: 1.5, mb: 1, bgcolor: '#f9f9f9' }}>
                            <Typography variant="body2">
                              <strong>{reply.user}:</strong> {reply.text}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {reply.time}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      {/* قائمة الإجراءات */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {(userRole === 'professor' || userRole === 'root') && (
          <MenuItem onClick={handlePin}>
            <PinIcon fontSize="small" sx={{ ml: 1 }} />
            {messages.find(m => m.id === selectedMessage)?.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          </MenuItem>
        )}
        <MenuItem onClick={() => alert('تعديل الرسالة')}>
          <EditIcon fontSize="small" sx={{ ml: 1 }} />
          تعديل
        </MenuItem>
        {(userRole === 'professor' || userRole === 'root') && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ ml: 1 }} />
            حذف
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default ForumPage;
