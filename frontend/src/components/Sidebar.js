import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { BarChart, Info, Add, Share, Delete, Compare } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import axios from 'axios';

function Sidebar({ open, toggleDrawer, sessions, setSessions, fetchChatSessions }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const startNewChat = () => {
    axios.post('http://localhost:5000/new_chat')
      .then(response => {
        const newSession = {
          id: response.data.session_id,
          date: new Date().toISOString(),
          messages: []
        };
        setSessions([newSession, ...sessions]);
        window.location.href = `/?session_id=${response.data.session_id}`;
      })
      .catch(error => {
        console.error('Error starting new chat:', error);
        setSnackbarMessage('Erreur lors de la création du chat');
        setSnackbarOpen(true);
      });
  };

  const deleteChat = (sessionId) => {
    axios.post('http://localhost:5000/delete_chat', { session_id: sessionId })
      .then(() => {
        setSessions(sessions.filter(session => session.id !== sessionId));
        const currentSessionId = new URLSearchParams(window.location.search).get('session_id');
        if (currentSessionId && parseInt(currentSessionId) === sessionId) {
          window.location.href = '/';
        }
      })
      .catch(error => {
        console.error('Error deleting chat:', error);
        setSnackbarMessage('Erreur lors de la suppression du chat');
        setSnackbarOpen(true);
      });
  };

  const handleDeleteClick = (sessionId) => {
    setSessionToDelete(sessionId);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteChat(sessionToDelete);
    }
    setDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setSessionToDelete(null);
  };

  const shareChat = () => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    const shareUrl = sessionId ? `${window.location.origin}/?session_id=${sessionId}` : window.location.origin;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setSnackbarMessage('Lien copié !');
        setSnackbarOpen(true);
      })
      .catch(error => {
        console.error('Error copying link:', error);
        setSnackbarMessage('Erreur lors de la copie du lien');
        setSnackbarOpen(true);
      });
  };

  return (
    <>
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
                <IconButton edge="end" onClick={() => handleDeleteClick(session.id)}>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbarMessage.startsWith('Erreur') ? 'error.main' : 'primary.main',
            color: 'white',
            borderRadius: '8px',
          },
        }}
      />
      <Dialog
        open={dialogOpen}
        onClose={handleDeleteCancel}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.primary' }}>
            Êtes-vous sûr de vouloir supprimer ce chat ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ color: 'text.secondary' }}>
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} sx={{ color: 'error.main' }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sidebar;