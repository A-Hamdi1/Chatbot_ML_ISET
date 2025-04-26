import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
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

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: { main: "#26A69A" },
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
            backgroundColor: mode === "light" ? "#FFFFFF" : "#2D2D2D",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
            color: mode === "light" ? "#212121" : "#E0E0E0",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "light" ? "#FFFFFF" : "#2D2D2D",
            borderRight: "none",
            boxShadow: "2px 0px 8px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            textTransform: "none",
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
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
              >
                Chatbot ISET
              </Typography>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === "light" ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Toolbar>
          </AppBar>
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
                marginTop: "64px",
                marginLeft: drawerOpen ? 280 : 0,
                transition: "margin-left 0.3s",
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
