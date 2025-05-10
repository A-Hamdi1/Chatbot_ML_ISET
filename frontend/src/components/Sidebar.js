import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  useTheme,
  ListItemButton,
  Avatar,
  alpha,
  Fade,
  Snackbar,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import {
  Add as AddIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import axios from "axios";




export const shareChat = () => {
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  const shareUrl = sessionId
    ? `${window.location.origin}/?session_id=${sessionId}`
    : window.location.origin;

  return navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      return { success: true, message: "Lien copié !" };
    })
    .catch((error) => {
      console.error("Error copying link:", error);
      return { success: false, message: "Erreur lors de la copie du lien" };
    });
};

function Sidebar({ open, toggleDrawer, sessions, setSessions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [showHistory, setShowHistory] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Gestion de la suppression
  const handleDeleteClick = (sessionId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteChat(sessionToDelete);
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  // Fonctions d'API identiques à Sidebar.js
  const startNewChat = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/new_chat`)
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
      .post(`${process.env.REACT_APP_API_URL}/delete_chat`, { session_id: sessionId })
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

  // Fonction d'aide pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Extraction du premier message pour aperçu
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

  const navigation = [
    { name: "Accueil", path: "/", icon: <HomeIcon /> },
  ];

  const getActiveColor = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
      bgcolor: isActive 
        ? alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.1)
        : "transparent",
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.15),
      },
    };
  };

  const drawerWidth = open ? 240 : 80;

  const handleNavItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: "width 0.3s ease, transform 0.3s ease",
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: "1px solid",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        <Fade in={true} timeout={800}>
          <Box>
            <Box
              sx={{
                height: "70px",
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "flex-end" : "center",
                px: open ? 2 : 0,
              }}
            >
              {open && (
                <Typography
                  variant="h6"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 600,
                    pl: 2,
                    background: isDarkMode
                      ? "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)"
                      : "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Chatbot ISET
                </Typography>
              )}
              <IconButton
                onClick={toggleDrawer}
                sx={{
                  borderRadius: "10px",
                  backgroundColor: isDarkMode 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: isDarkMode 
                      ? alpha(theme.palette.primary.main, 0.25)
                      : alpha(theme.palette.primary.main, 0.2),
                  },
                  transition: "transform 0.2s ease",
                  transform: open ? "rotate(0deg)" : "rotate(180deg)",
                }}
                size="small"
              >
                <CloseIcon sx={{ transform: "rotate(90deg)" }} />
              </IconButton>
            </Box>

            <Divider 
              sx={{ 
                my: 1.5, 
                borderColor: isDarkMode 
                  ? "rgba(255, 255, 255, 0.05)" 
                  : "rgba(0, 0, 0, 0.05)" 
              }} 
            />

            <Box sx={{ px: open ? 2 : 1, py: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={open && <AddIcon />}
                onClick={startNewChat}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  py: 1.2,
                  justifyContent: open ? "flex-start" : "center",
                  background: isDarkMode
                    ? "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)"
                    : "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)",
                  boxShadow: "0px 4px 12px rgba(58, 134, 255, 0.25)",
                  "&:hover": {
                    boxShadow: "0px 6px 16px rgba(58, 134, 255, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {open ? "Nouveau chat" : <AddIcon />}
              </Button>
            </Box>

            <List component="nav" sx={{ px: 1 }}>
              {navigation.map((item) => (
                <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavItemClick(item)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      borderRadius: "12px",
                      ...getActiveColor(item.path),
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Tooltip title={open ? "" : item.name} placement="right">
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : "auto",
                          justifyContent: "center",
                          color: "inherit",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </Tooltip>
                    {open && (
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 600 : 400,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider 
              sx={{ 
                my: 1.5, 
                borderColor: isDarkMode 
                  ? "rgba(255, 255, 255, 0.05)" 
                  : "rgba(0, 0, 0, 0.05)" 
              }} 
            />

            <Box
              sx={{
                mt: 1.5,
                px: open ? 2 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "space-between" : "center",
              }}
            >
              {open && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Historique de Chat
                </Typography>
              )}
              <Tooltip title={open ? "" : "Historique"} placement="right">
                <IconButton
                  size="small"
                  onClick={() => setShowHistory(!showHistory)}
                  sx={{
                    borderRadius: "10px",
                    backgroundColor: isDarkMode 
                      ? alpha(theme.palette.grey[700], 0.2)
                      : alpha(theme.palette.grey[300], 0.5),
                    "&:hover": {
                      backgroundColor: isDarkMode 
                        ? alpha(theme.palette.grey[700], 0.4)
                        : alpha(theme.palette.grey[300], 0.8),
                    },
                  }}
                >
                  <HistoryIcon
                    sx={{
                      fontSize: 20,
                      color: theme.palette.text.secondary,
                      transform: showHistory ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>

            {showHistory && (
              <List sx={{ px: 1, mt: 1, maxHeight: "300px", overflowY: "auto" }}>
                {sessions.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun historique disponible
                    </Typography>
                  </Box>
                ) : (
                  sessions.map((session) => (
                    <Fade key={session.id} in={true} timeout={300}>
                      <ListItem
                        disablePadding
                        sx={{ mb: 0.5 }}
                      >
                        <ListItemButton
                          component="a"
                          href={`/?session_id=${session.id}`}
                          sx={{
                            borderRadius: "12px",
                            py: 0.75,
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? alpha(theme.palette.grey[800], 0.6)
                                : alpha(theme.palette.grey[100], 0.8),
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 1.5 : "auto",
                              justifyContent: "center",
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: isDarkMode 
                                  ? alpha(theme.palette.grey[700], 0.5)
                                  : alpha(theme.palette.grey[300], 0.5),
                                color: theme.palette.text.primary,
                                fontSize: "0.875rem",
                              }}
                              src="/lettre.png"
                            />
                          </ListItemIcon>
                          {open && (
                            <ListItemText
                              primary={getSessionPreview(session)}
                              secondary={formatDate(session.date)}
                              primaryTypographyProps={{
                                noWrap: true,
                                variant: "body2",
                                fontWeight: 500,
                                color: "text.primary",
                              }}
                              secondaryTypographyProps={{
                                noWrap: true,
                                variant: "caption",
                                color: "text.secondary",
                                fontSize: "0.75rem"
                              }}
                            />
                          )}
                          {open && (
                            <Tooltip title="Supprimer cette conversation">
                              <IconButton
                                edge="end"
                                onClick={(e) => handleDeleteClick(session.id, e)}
                                sx={{
                                  color: "error.light",
                                  "&:hover": {
                                    color: "error.main",
                                    bgcolor: "error.lighter",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </ListItemButton>
                      </ListItem>
                    </Fade>
                  ))
                )}
              </List>
            )}
          </Box>
        </Fade>
      </Drawer>
      
      {/* Snackbar pour les notifications */}
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

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
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
          <DialogContentText color="text.primary">
            Êtes-vous sûr de vouloir supprimer cette conversation ?
            Cette action est irréversible.
          </DialogContentText>
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