import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  InsertChart, // Remplacé BarChart
  InfoOutlined, // Remplacé Info
  AddCircleOutline, // Remplacé Add
  ShareOutlined, // Remplacé Share
  DeleteOutline, // Remplacé Delete
  CompareArrows, // Remplacé Compare
  ChevronLeft,
  FolderOutlined, // Remplacé Folder
} from "@mui/icons-material";
import Slide from "@mui/material/Slide";
import axios from "axios";

function Sidebar({
  open,
  toggleDrawer,
  sessions,
  setSessions,
  fetchChatSessions,
}) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const startNewChat = () => {
    axios
      .post("http://localhost:5000/new_chat")
      .then((response) => {
        const newSession = {
          id: response.data.session_id,
          date: new Date().toISOString(),
          messages: [],
        };
        setSessions([newSession, ...sessions]);
        window.location.href = `/?session_id=${response.data.session_id}`;
      })
      .catch((error) => {
        console.error("Error starting new chat:", error);
        setSnackbarMessage("Erreur lors de la création du chat");
        setSnackbarOpen(true);
      });
  };

  const deleteChat = (sessionId) => {
    axios
      .post("http://localhost:5000/delete_chat", { session_id: sessionId })
      .then(() => {
        setSessions(sessions.filter((session) => session.id !== sessionId));
        const currentSessionId = new URLSearchParams(
          window.location.search
        ).get("session_id");
        if (currentSessionId && parseInt(currentSessionId) === sessionId) {
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error("Error deleting chat:", error);
        setSnackbarMessage("Erreur lors de la suppression du chat");
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
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    const shareUrl = sessionId
      ? `${window.location.origin}/?session_id=${sessionId}`
      : window.location.origin;
    
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setSnackbarMessage("Lien copié !");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error copying link:", error);
        setSnackbarMessage("Erreur lors de la copie du lien");
        setSnackbarOpen(true);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Extraction du premier message de chaque session pour afficher un aperçu
  const getSessionPreview = (session) => {
    if (session.messages && session.messages.length > 0) {
      const firstUserMessage = session.messages.find(msg => msg.user);
      return firstUserMessage ? 
        (firstUserMessage.user.length > 30 ? 
          `${firstUserMessage.user.substring(0, 30)}...` : 
          firstUserMessage.user) : 
        "Nouvelle conversation";
    }
    return "Nouvelle conversation";
  };

  return (
    <>
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: open ? 300 : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
            transition: "all 0.3s ease",
            overflowY: "auto",
            display: open ? 'block' : 'none',
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          p: 2
        }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, color: "primary.main" }}
          >
            Chatbot ISET
          </Typography>
          <IconButton onClick={toggleDrawer} sx={{ color: "text.secondary" }}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddCircleOutline />}
            onClick={startNewChat}
            sx={{
              borderRadius: "12px",
              py: 1.2,
              mb: 2,
              boxShadow: 2,
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            Nouveau Chat
          </Button>
        </Box>

        <List sx={{ px: 1 }}>
          <ListItem disablePadding>
            <ListItemButton 
              component="a" 
              href="/metrics"
              sx={{ 
                borderRadius: "10px", 
                mb: 0.5,
                "&:hover": { bgcolor: "action.hover" }
              }}
            >
              <ListItemIcon>
                <InsertChart sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Statistiques"
                primaryTypographyProps={{ fontWeight: "medium", color: "text.primary" }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              component="a" 
              href="/embeddings-metrics"
              sx={{ 
                borderRadius: "10px", 
                mb: 0.5,
                "&:hover": { bgcolor: "action.hover" }
              }}
            >
              <ListItemIcon>
                <CompareArrows sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Métriques Embeddings"
                primaryTypographyProps={{ fontWeight: "medium", color: "text.primary" }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              component="a" 
              href="/about"
              sx={{ 
                borderRadius: "10px", 
                mb: 0.5,
                "&:hover": { bgcolor: "action.hover" }
              }}
            >
              <ListItemIcon>
                <InfoOutlined sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="À propos"
                primaryTypographyProps={{ fontWeight: "medium", color: "text.primary" }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              onClick={shareChat}
              sx={{ 
                borderRadius: "10px", 
                mb: 0.5,
                "&:hover": { bgcolor: "action.hover" }
              }}
            >
              <ListItemIcon>
                <ShareOutlined sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Partager Chat"
                primaryTypographyProps={{ fontWeight: "medium", color: "text.primary" }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center" }}>
          <FolderOutlined sx={{ color: "secondary.main", mr: 1 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 500, color: "text.primary" }}
          >
            Historique de Chat
          </Typography>
        </Box>
        
        <List sx={{ px: 1, pb: 2 }}>
          {sessions.length === 0 ? (
            <Box sx={{ px: 2, py: 1, color: "text.secondary" }}>
              <Typography variant="body2">Aucun historique disponible</Typography>
            </Box>
          ) : (
            sessions.map((session) => (
              <Fade key={session.id} in={true} timeout={300}>
                <ListItem 
                  disablePadding 
                  sx={{ mb: 1 }}
                >
                  <ListItemButton 
                    component="a" 
                    href={`/?session_id=${session.id}`}
                    sx={{ 
                      borderRadius: "10px",
                      py: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { 
                        bgcolor: "action.hover",
                        borderColor: "primary.light"
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        width: 30,
                        height: 30
                      }}
                      src="/lettre.png"
                    />
                    <ListItemText
                      primary={getSessionPreview(session)}
                      secondary={formatDate(session.date)}
                      primaryTypographyProps={{ 
                        color: "text.primary",
                        fontWeight: "medium",
                        noWrap: true
                      }}
                      secondaryTypographyProps={{ 
                        color: "text.secondary",
                        fontSize: "0.75rem"
                      }}
                    />
                    <Tooltip title="Supprimer cette conversation">
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(session.id);
                        }}
                        sx={{ 
                          color: "error.light",
                          "&:hover": { 
                            color: "error.main",
                            bgcolor: "error.lighter"
                          }
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                </ListItem>
              </Fade>
            ))
          )}
        </List>
      </Drawer>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Slide}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: snackbarMessage.startsWith("Erreur")
              ? "error.main"
              : "primary.main",
            color: "white",
            borderRadius: "12px",
            boxShadow: 3,
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
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary", py: 2 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.primary" }}>
            Êtes-vous sûr de vouloir supprimer cette conversation ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ 
              borderRadius: "10px",
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.primary",
                bgcolor: "action.hover"
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            sx={{ 
              ml: 2,
              borderRadius: "10px",
              bgcolor: "error.main",
              "&:hover": { bgcolor: "error.dark" }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sidebar;