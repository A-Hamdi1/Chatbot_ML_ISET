import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton } from '@mui/material';
import { BarChart, Info, Add, Share, Delete, Compare } from '@mui/icons-material';
import axios from 'axios';

function Sidebar({ open, toggleDrawer }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = () => {
    axios.get('http://localhost:5000/get_sessions')
      .then(response => {
        setSessions(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch(error => console.error('Error fetching sessions:', error));
  };

  const startNewChat = () => {
    axios.post('http://localhost:5000/new_chat')
      .then(response => {
        window.location.href = `/?session_id=${response.data.session_id}`;
        fetchChatSessions();
      })
      .catch(error => console.error('Error starting new chat:', error));
  };

  const deleteChat = (sessionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chat ?')) {
      axios.post('http://localhost:5000/delete_chat', { session_id: sessionId })
        .then(() => {
          setSessions(sessions.filter(session => session.id !== sessionId));
          const currentSessionId = new URLSearchParams(window.location.search).get('session_id');
          if (currentSessionId === sessionId) {
            window.location.href = '/';
          }
        })
        .catch(error => console.error('Error deleting chat:', error));
    }
  };

  const shareChat = () => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    const shareUrl = sessionId ? `${window.location.origin}/?session_id=${sessionId}` : window.location.origin;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Lien copié !'))
      .catch(error => console.error('Error copying link:', error));
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={toggleDrawer}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          overflowY: 'auto',
        },
      }}
    >
      <Typography variant="h6" sx={{ p: 3, fontWeight: 500, color: 'text.primary' }}>
        Chatbot ISET
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={startNewChat}>
            <ListItemIcon><Add sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary="Nouveau Chat" primaryTypographyProps={{ color: 'text.primary' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="/metrics">
            <ListItemIcon><BarChart sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary="Statistiques" primaryTypographyProps={{ color: 'text.primary' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="/embeddings-metrics">
            <ListItemIcon><Compare sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary="Métriques Embeddings" primaryTypographyProps={{ color: 'text.primary' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href="/about">
            <ListItemIcon><Info sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary="À propos" primaryTypographyProps={{ color: 'text.primary' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={shareChat}>
            <ListItemIcon><Share sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary="Partager Chat" primaryTypographyProps={{ color: 'text.primary' }} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 500, color: 'text.primary' }}>
        Historique de Chat
      </Typography>
      <List>
        {sessions.map(session => (
          <ListItem
            key={session.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" onClick={() => deleteChat(session.id)}>
                <Delete sx={{ color: 'error.main' }} />
              </IconButton>
            }
          >
            <ListItemButton component="a" href={`/?session_id=${session.id}`}>
              <ListItemText
                primary={`Chat du ${new Date(session.date).toLocaleDateString('fr-FR')}`}
                secondary={new Date(session.date).toLocaleTimeString('fr-FR')}
                primaryTypographyProps={{ color: 'text.primary' }}
                secondaryTypographyProps={{ color: 'text.secondary' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;