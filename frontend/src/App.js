import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { shareChat } from "./components/Sidebar";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  ScreenShare,
  Brightness7,
  BarChart,
  Analytics as AnalyticsIcon,
  InfoOutline,
} from "@mui/icons-material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatPage from "./pages/ChatPage";
import MetricsPage from "./pages/MetricsPage";
import AboutPage from "./pages/AboutPage";
import EmbeddingsMetricsPage from "./pages/EmbeddingsMetricsPage";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import axios from "axios";

// Initialisation de React-Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  // Initialiser le mode à 'light' par défaut, ou charger depuis localStorage
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("themeMode") || "light";
  });
  const [sessions, setSessions] = useState([]);

  // Sauvegarder le mode dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = () => {
    axios
      .get("http://localhost:5000/get_sessions")
      .then((response) => {
        setSessions(
          response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      })
      .catch((error) => console.error("Error fetching sessions:", error));
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Handle shareChat in AppBar
  const handleShareChat = async () => {
    const result = await shareChat();
    toast[result.success ? "success" : "error"](result.message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: mode,
    });
  };

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: { main: "#3a86ff" },
      secondary: { main: "#FF6F61" },
      tertiary: { main: "#D4E157" },
      background: {
        default: mode === "light" ? "#F5F5F5" : "#1A1A1A",
        paper: mode === "light" ? "#FFFFFF" : "#2D2D2D",
      },
      text: {
        primary: mode === "light" ? "#212121" : "#E0E0E0",
        secondary: mode === "light" ? "#757575" : "#B0B0B0",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h4: { fontWeight: 500 },
      body1: { fontWeight: 400 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              mode === "light"
                ? "linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)"
                : "linear-gradient(135deg, #2D2D2D 0%, #202020 100%)",
            boxShadow:
              mode === "light"
                ? "0px 2px 10px rgba(0, 0, 0, 0.1)"
                : "0px 2px 10px rgba(0, 0, 0, 0.5)",
            color: mode === "light" ? "#212121" : "#E0E0E0",
            borderBottom:
              mode === "light"
                ? "1px solid rgba(0, 0, 0, 0.05)"
                : "1px solid rgba(255, 255, 255, 0.05)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background:
              mode === "light"
                ? "linear-gradient(180deg, #FFFFFF 0%, #F8F8F8 100%)"
                : "linear-gradient(180deg, #2D2D2D 0%, #202020 100%)",
            borderRight: "none",
            boxShadow:
              mode === "light"
                ? "2px 0 10px rgba(0, 0, 0, 0.1)"
                : "2px 0 10px rgba(0, 0, 0, 0.5)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease-in-out",
            },
          },
          containedPrimary: {
            background:
              mode === "light"
                ? "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)"
                : "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: `
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: ${
              mode === "light"
                ? "rgba(0, 0, 0, 0.2)"
                : "rgba(255, 255, 255, 0.2)"
            };
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${
              mode === "light"
                ? "rgba(0, 0, 0, 0.4)"
                : "rgba(255, 255, 255, 0.4)"
            };
          }
        `,
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor:
                mode === "light"
                  ? "rgba(0, 0, 0, 0.04)"
                  : "rgba(255, 255, 255, 0.04)",
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0px 2px 6px rgba(0, 0, 0, 0.15)"
                : "0px 2px 6px rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Fade in={true} timeout={800}>
            <AppBar
              position="fixed"
              sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                borderRadius: 0,
                height: "70px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleDrawer}
                  sx={{
                    mr: 2,
                    backgroundColor:
                      mode === "light"
                        ? "rgba(58, 134, 255, 0.08)"
                        : "rgba(58, 134, 255, 0.15)",
                    borderRadius: "12px",
                    "&:hover": {
                      backgroundColor:
                        mode === "light"
                          ? "rgba(58, 134, 255, 0.15)"
                          : "rgba(58, 134, 255, 0.25)",
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      bgcolor: mode === "light" ? "#3a86ff" : "#3a86ff",
                      width: 38,
                      height: 38,
                      mr: 2,
                      display: { xs: "none", md: "flex" },
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>🤖</span>
                  </Avatar>
                  <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                      flexGrow: 1,
                      fontWeight: 600,
                      background:
                        mode === "light"
                          ? "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)"
                          : "linear-gradient(135deg, #3a86ff 0%, #2979ff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Chatbot ISET
                  </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Tooltip title="Partager">
                    <IconButton
                      onClick={handleShareChat}
                      color="inherit"
                      sx={{
                        backgroundColor:
                          mode === "light"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        marginLeft: 1,
                      }}
                    >
                      <ScreenShare />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Embeddings">
                    <IconButton
                     component="a"
                      href="/embeddings-metrics"
                      color="inherit"
                      sx={{
                        backgroundColor:
                          mode === "light"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        marginLeft: 1,
                      }}
                    >
                      <AnalyticsIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Statistiques">
                    <IconButton
                      component="a"
                      href="/metrics"
                      color="inherit"
                      sx={{
                        backgroundColor:
                          mode === "light"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        marginLeft: 1,
                      }}
                    >
                      <BarChart />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="À propos">
                    <IconButton
                      component="a"
                      href="/about"
                      color="inherit"
                      sx={{
                        backgroundColor:
                          mode === "light"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        marginLeft: 1,
                      }}
                    >
                      <InfoOutline />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={mode === "light" ? "Mode sombre" : "Mode clair"}
                  >
                    <IconButton
                      onClick={toggleMode}
                      color="inherit"
                      sx={{
                        backgroundColor:
                          mode === "light"
                            ? "rgba(0, 0, 0, 0.03)"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        marginLeft: 1,
                      }}
                    >
                      {mode === "light" ? <Brightness4 /> : <Brightness7 />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Toolbar>
            </AppBar>
          </Fade>

          <div style={{ display: "flex" }}>
            <Sidebar
              open={drawerOpen}
              toggleDrawer={toggleDrawer}
              sessions={sessions}
              setSessions={setSessions}
              fetchChatSessions={fetchChatSessions}
            />
            <div
              style={{
                flexGrow: 1,
                padding: "16px",
                marginTop: "70px", // Adjusted for taller AppBar
                marginLeft: drawerOpen ? 80 : 0,
                transition: "margin-left 0.3s ease",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <ChatPage sessions={sessions} setSessions={setSessions} />
                  }
                />
                <Route
                  path="/metrics"
                  element={
                    <ErrorBoundary>
                      <MetricsPage />
                    </ErrorBoundary>
                  }
                />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/embeddings-metrics"
                  element={
                    <ErrorBoundary>
                      <EmbeddingsMetricsPage />
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={mode}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
