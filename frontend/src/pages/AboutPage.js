import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogContent,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Fade,
  Tooltip,
  Chip,
  useTheme,
} from "@mui/material";
import { School, ArrowForward, CheckCircle } from "@mui/icons-material";
import axios from "axios";
import SelfLearningPanel from "../components/SelfLearningPanel";

function AboutPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    features: [],
  });
  const [selfLearningStatus, setSelfLearningStatus] = useState({
    well_rated_available: 0,
  });
  const [openSelfLearning, setOpenSelfLearning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les données "À propos"
        const aboutResponse = await axios.get(`${process.env.REACT_APP_API_URL}/about`);
        setAboutData(aboutResponse.data);

        // Récupérer le statut de l'auto-apprentissage
        const statusResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/self-learning/status`);

        setSelfLearningStatus(statusResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featureEmojis = [
    "⚙️",
    "📊",
    "📝",
    "🔍",
    "🌐",
    "💡",
    "📚",
    "⭐",
    "📜",
    "🎙️",
  ];

  const progressValue = Math.min(
    (selfLearningStatus.well_rated_available / 10) * 100,
    100
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Fade in={!loading} timeout={800}>
        <Box>
          {/* Hero Section */}
          <Paper
            elevation={3}
            sx={{
              py: 2.5,
              px: 3,
              mb: 4,
              borderRadius: "16px",
              background: isDarkMode
                ? "linear-gradient(135deg, #00695C 0%, #002620 100%)"
                : "linear-gradient(135deg, #26A69A 0%, #004D40 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              boxShadow: isDarkMode
                ? "0 8px 30px rgba(0, 0, 0, 0.5)"
                : "0 8px 30px rgba(0, 77, 64, 0.2)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -40,
                top: -40,
                opacity: 0.08,
                fontSize: 200,
                transform: "rotate(-10deg)",
              }}
            >
              <Typography variant="h1" fontSize="inherit">
                📚
              </Typography>
            </Box>

            <Box sx={{ position: "relative" }}>
              {/* Robot en arrière-plan avec animation et cercle */}
              <Box
                sx={{
                  position: "absolute",
                  right: "5%",
                  top: "0%",
                  zIndex: 0,
                }}
              >
                <Box
                  sx={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isDarkMode
                      ? "0 15px 30px rgba(0,0,0,0.3)"
                      : "0 15px 30px rgba(0,0,0,0.1)",
                    animation: "float 6s ease-in-out infinite",
                    "@keyframes float": {
                      "0%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-12px)" },
                      "100%": { transform: "translateY(0px)" },
                    },
                  }}
                >
                  <Typography sx={{ fontSize: "80px" }}>🤖</Typography>
                </Box>
              </Box>

              {/* Contenu principal */}
              <Grid container spacing={0} alignItems="center">
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      mb: 1.5,
                      fontSize: { xs: "1.75rem", sm: "2rem" },
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {aboutData.title || "Chatbot ISET"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      mb: 2.5,
                      opacity: 0.9,
                      lineHeight: 1.4,
                      fontSize: "1.25rem",
                      position: "relative",
                      zIndex: 1,
                      pr: { xs: 0 },
                    }}
                  >
                    {aboutData.description ||
                      "Votre assistant conversationnel intelligent pour l'ISET"}
                  </Typography>
                  <Button
                    variant="contained"
                    size="medium"
                    endIcon={<ArrowForward />}
                    href="/"
                    sx={{
                      bgcolor: "white",
                      color: isDarkMode ? "#fafcfc" : "#fafcfc",
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.9)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.3s ease",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    Commencer une discussion
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Features Section */}
          <Box sx={{ mb: 6 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 4,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  position: "relative",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    bottom: -10,
                    left: 0,
                    width: "60px",
                    height: "4px",
                    borderRadius: "2px",
                    bgcolor: "primary.main",
                  },
                }}
              >
                Fonctionnalités
              </Typography>
              <Chip
                label={`${aboutData.features.length} fonctionnalités`}
                color="primary"
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            {/* Grille de fonctionnalités avec disposition fixe - Adaptée au thème */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(2, 1fr)",
                },
                gap: 3,
              }}
            >
              {aboutData.features.map((feature, index) => (
                <Fade in={true} timeout={(index + 1) * 200} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: "16px",
                      border: "1px solid",
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "divider",
                      transition: "all 0.3s ease",
                      bgcolor: isDarkMode
                        ? index % 4 === 0
                          ? "rgba(0,121,189,0.1)"
                          : index % 4 === 1
                          ? "rgba(156,39,176,0.1)"
                          : index % 4 === 2
                          ? "rgba(22,160,133,0.1)"
                          : "rgba(243,156,18,0.1)"
                        : index % 4 === 0
                        ? "#EBF5FB"
                        : index % 4 === 1
                        ? "#F5EEF8"
                        : index % 4 === 2
                        ? "#E8F8F5"
                        : "#FEF9E7",
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        boxShadow: isDarkMode
                          ? "0 6px 20px rgba(0,0,0,0.2)"
                          : "0 6px 20px rgba(0,0,0,0.08)",
                        transform: "translateY(-3px)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "white",
                        color:
                          index % 4 === 0
                            ? "#2980B9"
                            : index % 4 === 1
                            ? "#8E44AD"
                            : index % 4 === 2
                            ? "#16A085"
                            : "#F39C12",
                        mr: 2,
                        width: 56,
                        height: 56,
                        fontSize: "1.6rem",
                        boxShadow: isDarkMode
                          ? "0 4px 10px rgba(0,0,0,0.2)"
                          : "0 4px 10px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      {featureEmojis[index % featureEmojis.length]}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          mb: 0.5,
                          fontSize: "1rem",
                        }}
                      >
                        {feature.split(":")[0] || feature}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          lineHeight: 1.5,
                          fontSize: "0.875rem",
                        }}
                      >
                        {feature.includes(":")
                          ? feature.split(":")[1].trim()
                          : ""}
                      </Typography>
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Box>
          </Box>

          {/* Self-Learning Section */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: "20px",
              bgcolor: "background.paper",
              overflow: "hidden",
              position: "relative",
              background: isDarkMode
                ? "linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(50,50,50,0.4) 100%)"
                : "linear-gradient(135deg, #F5F7FA 0%, #E4E8F0 100%)",
            }}
          >
            {/* Cercles décoratifs */}
            <Box
              sx={{
                position: "absolute",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: isDarkMode
                  ? "linear-gradient(135deg, rgba(0,121,107,0.15) 0%, rgba(0,121,107,0.05) 100%)"
                  : "linear-gradient(135deg, rgba(0,121,107,0.08) 0%, rgba(0,121,107,0.03) 100%)",
                top: "-40px",
                right: "-40px",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: isDarkMode
                  ? "linear-gradient(135deg, rgba(0,121,107,0.12) 0%, rgba(0,121,107,0.04) 100%)"
                  : "linear-gradient(135deg, rgba(0,121,107,0.06) 0%, rgba(0,121,107,0.02) 100%)",
                bottom: "20px",
                left: "5%",
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: isDarkMode ? "#00695C" : "#004D40",
                    color: "white",
                    mr: 2,
                    width: 64,
                    height: 64,
                    fontSize: "2rem",
                    boxShadow: isDarkMode
                      ? "0 6px 16px rgba(0,77,64,0.4)"
                      : "0 6px 16px rgba(0,77,64,0.2)",
                  }}
                >
                  🧠
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Auto-apprentissage
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    Amélioration continue du système basée sur les interactions
                    des utilisateurs
                  </Typography>
                </Box>
              </Box>

              <Divider
                sx={{
                  mb: 4,
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                }}
              />

              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        sx={{ color: "text.primary" }}
                      >
                        Questions bien notées disponibles
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: isDarkMode
                            ? progressValue >= 100
                              ? "rgba(76,175,80,0.15)"
                              : "rgba(33,150,243,0.15)"
                            : progressValue >= 100
                            ? "success.lighter"
                            : "primary.lighter",
                          px: 2,
                          py: 0.5,
                          borderRadius: "12px",
                        }}
                      >
                        {progressValue >= 100 && (
                          <CheckCircle
                            fontSize="small"
                            color="success"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{
                            color:
                              progressValue >= 100
                                ? "success.main"
                                : "primary.main",
                          }}
                        >
                          {selfLearningStatus.well_rated_available} / 10
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressValue}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: isDarkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            progressValue >= 100
                              ? "success.main"
                              : "primary.main",
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}
                  >
                    L'auto-apprentissage permet au chatbot d'améliorer ses
                    réponses en se basant sur les questions bien évaluées par
                    les utilisateurs.
                    {selfLearningStatus.well_rated_available < 10
                      ? ` Il manque encore ${
                          10 - selfLearningStatus.well_rated_available
                        } questions bien notées pour pouvoir commencer le processus.`
                      : " Le système est prêt à lancer le processus d'apprentissage."}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={5}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Tooltip
                    title={
                      selfLearningStatus.well_rated_available < 10
                        ? `Il manque ${
                            10 - selfLearningStatus.well_rated_available
                          } questions bien notées`
                        : "Prêt à lancer l'auto-apprentissage"
                    }
                    placement="top"
                    arrow
                  >
                    <span style={{ width: "100%" }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<School />}
                        onClick={() => setOpenSelfLearning(true)}
                        disabled={selfLearningStatus.well_rated_available < 10}
                        sx={{
                          py: 1.8,
                          borderRadius: "12px",
                          bgcolor:
                            progressValue >= 100
                              ? "success.main"
                              : "primary.main",
                          boxShadow: isDarkMode
                            ? "0 4px 14px rgba(0,0,0,0.4)"
                            : "0 4px 14px rgba(0,121,107,0.25)",
                          color: "#fafcfc",
                          fontWeight: 600,
                          fontSize: "1rem",
                          transition: "all 0.3s ease",

                          // ✅ Forcer le style même quand disabled
                          "&.Mui-disabled": {
                            color: "#fafcfc",
                            bgcolor:
                              progressValue >= 100
                                ? "success.main"
                                : "primary.main",
                            boxShadow: isDarkMode
                              ? "0 4px 14px rgba(0,0,0,0.4)"
                              : "0 4px 14px rgba(0,121,107,0.25)",
                            opacity: 1,
                          },

                          "&:hover": {
                            bgcolor:
                              progressValue >= 100
                                ? "success.dark"
                                : "primary.dark",
                            transform: "translateY(-2px)",
                            boxShadow: isDarkMode
                              ? "0 6px 20px rgba(0,0,0,0.5)"
                              : "0 6px 20px rgba(0,121,107,0.35)",
                          },
                        }}
                      >
                        {selfLearningStatus.well_rated_available < 10
                          ? `Auto-apprentissage (${
                              10 - selfLearningStatus.well_rated_available
                            } questions manquantes)`
                          : "Lancer l'auto-apprentissage"}
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Fade>

      {loading && (
        <Box
          sx={{
            width: "100%",
            mt: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LinearProgress sx={{ width: "70%", mb: 2, borderRadius: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chargement des données...
          </Typography>
        </Box>
      )}

      {/* Dialogue pour afficher SelfLearningPanel */}
      <Dialog
        open={openSelfLearning}
        onClose={() => setOpenSelfLearning(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            boxShadow: isDarkMode
              ? "0 10px 40px rgba(0,0,0,0.5)"
              : "0 10px 40px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogContent>
          <SelfLearningPanel />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default AboutPage;
