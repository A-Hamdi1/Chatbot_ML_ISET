import React from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Paper,
  Divider,
  Avatar,
  Fade,
  Chip,
  useTheme,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { QueryStats, ShowChart, Leaderboard } from "@mui/icons-material";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const fetchMetrics = async () => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/report`);
  return response.data;
};

function MetricsPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { data, isLoading, error } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    onError: () => {
      toast.error("Erreur lors du chargement des statistiques");
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 500, color: "text.primary" }}
          >
            Chargement des statistiques...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Nous préparons les données de performance des modèles
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: "20px",
            bgcolor: isDarkMode ? "rgba(244, 67, 54, 0.1)" : "#FFEBEE",
            border: "1px solid",
            borderColor: isDarkMode ? "rgba(244, 67, 54, 0.3)" : "#FFCDD2",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: isDarkMode ? "#C62828" : "#D32F2F", mr: 2 }}>
              <span style={{ fontSize: "1.2rem" }}>❌</span>
            </Avatar>
            <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
              Erreur de chargement
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2, color: "text.primary" }}>
            Impossible de charger les statistiques des modèles. Veuillez
            réessayer ultérieurement.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Si le problème persiste, vérifiez la connexion au serveur backend ou
            contactez l'administrateur système.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Données pour le graphique à barres
  const barChartData = {
    labels: ["Naive Bayes", "KNN"],
    datasets: [
      {
        label: "Accuracy (%)",
        data: [
          (data.modeles.naive_bayes.accuracy * 100).toFixed(2),
          (data.modeles.knn.accuracy * 100).toFixed(2),
        ],
        backgroundColor: isDarkMode
          ? "rgba(38, 166, 154, 0.7)"
          : "rgba(38, 166, 154, 0.8)",
        borderColor: "#26A69A",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "F1-Score (%)",
        data: [
          (data.modeles.naive_bayes.f1_score * 100).toFixed(2),
          (data.modeles.knn.f1_score * 100).toFixed(2),
        ],
        backgroundColor: isDarkMode
          ? "rgba(255, 111, 97, 0.7)"
          : "rgba(255, 111, 97, 0.8)",
        borderColor: "#FF6F61",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Données pour le graphique circulaire - Comparaison des modèles
  const pieChartData = {
    labels: ["Naive Bayes", "KNN"],
    datasets: [
      {
        data: [
          (data.modeles.naive_bayes.accuracy * 100).toFixed(2),
          (data.modeles.knn.accuracy * 100).toFixed(2),
        ],
        backgroundColor: [
          isDarkMode ? "rgba(38, 166, 154, 0.7)" : "rgba(38, 166, 154, 0.8)",
          isDarkMode ? "rgba(255, 111, 97, 0.7)" : "rgba(255, 111, 97, 0.8)",
        ],
        borderColor: ["#26A69A", "#FF6F61"],
        borderWidth: 1,
      },
    ],
  };

  // Option commune pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: "Roboto",
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label || context.label}: ${context.raw}%`,
        },
        backgroundColor: isDarkMode
          ? "rgba(50, 50, 50, 0.8)"
          : "rgba(255, 255, 255, 0.95)",
        titleColor: isDarkMode ? "#FFFFFF" : "#333333",
        bodyColor: isDarkMode ? "#EEEEEE" : "#555555",
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "Roboto",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "Roboto",
          size: 13,
        },
      },
    },
  };

  // Options spécifiques pour le graphique à barres
  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Comparaison des métriques par modèle",
        color: theme.palette.text.primary,
        font: {
          family: "Roboto",
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: "Roboto",
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value) => `${value}%`,
          font: {
            family: "Roboto",
            size: 12,
          },
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Pourcentage",
          color: theme.palette.text.secondary,
          font: {
            family: "Roboto",
            size: 14,
          },
        },
      },
    },
  };

  // Options spécifiques pour le graphique circulaire
  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: "Accuracy par modèle",
        color: theme.palette.text.primary,
        font: {
          family: "Roboto",
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
  };

  // Déterminer le meilleur modèle basé sur l'accuracy
  const bestModel =
    data.modeles.naive_bayes.accuracy > data.modeles.knn.accuracy
      ? "Naive Bayes"
      : "KNN";
  const bestAccuracy =
    Math.max(data.modeles.naive_bayes.accuracy, data.modeles.knn.accuracy) *
    100;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Fade in={true} timeout={800}>
        <Box>
          {/* Hero Section */}
          <Paper
            elevation={3}
            sx={{
              py: 4,
              px: 4,
              mb: 4,
              borderRadius: "24px",
              background: isDarkMode
                ? "linear-gradient(135deg, #03505B 0%, #01232B 100%)"
                : "linear-gradient(135deg, #26A69A 0%, #00796B 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              boxShadow: isDarkMode
                ? "0 10px 40px rgba(0, 0, 0, 0.5)"
                : "0 10px 40px rgba(0, 99, 71, 0.2)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -20,
                top: -20,
                opacity: 0.07,
                fontSize: 240,
                transform: "rotate(-5deg)",
              }}
            >
              <Typography variant="h1" fontSize="inherit">
                📊
              </Typography>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    textShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    mb: 2,
                  }}
                >
                  Statistiques des Modèles
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    mb: 3,
                    opacity: 0.9,
                    lineHeight: 1.5,
                  }}
                >
                  Analysez les performances des différents modèles de
                  classification utilisés par le chatbot.
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Chip
                    icon={<Leaderboard />}
                    label={`Meilleur modèle: ${bestModel}`}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      fontWeight: 600,
                      mr: 2,
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                  <Chip
                    label={`Accuracy: ${bestAccuracy.toFixed(2)}%`}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: "180px",
                    width: "180px",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(20px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isDarkMode
                        ? "0 15px 35px rgba(0,0,0,0.2)"
                        : "0 15px 35px rgba(0,0,0,0.1)",
                      animation: "float 6s ease-in-out infinite",
                      "@keyframes float": {
                        "0%": { transform: "translateY(0px)" },
                        "50%": { transform: "translateY(-15px)" },
                        "100%": { transform: "translateY(0px)" },
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "100px" }}>📊</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Graphique à barres */}
            <Grid item xs={12}>
              <Fade in={true} timeout={1000}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: isDarkMode
                      ? "linear-gradient(135deg, rgba(30,30,30,0.7) 0%, rgba(50,50,50,0.4) 100%)"
                      : "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
                    height: "100%",
                    boxShadow: isDarkMode
                      ? "0 8px 32px rgba(0,0,0,0.3)"
                      : "0 8px 32px rgba(0,0,0,0.05)",
                    width: "560px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: isDarkMode ? "#00695C" : "#004D40",
                        color: "white",
                        mr: 2,
                      }}
                    >
                      <ShowChart />
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Performance des Modèles
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      mb: 3,
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box sx={{ height: 350 }}>
                    <Bar data={barChartData} options={barOptions} />
                  </Box>
                </Paper>
              </Fade>
            </Grid>

            {/* Comparaison des Modèles */}
            <Grid item xs={12} md={5}>
              <Fade in={true} timeout={1200}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: isDarkMode
                      ? "linear-gradient(135deg, rgba(30,30,30,0.7) 0%, rgba(50,50,50,0.4) 100%)"
                      : "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isDarkMode
                      ? "0 8px 32px rgba(0,0,0,0.3)"
                      : "0 8px 32px rgba(0,0,0,0.05)",
                    width: "560px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: isDarkMode ? "#7986CB" : "#3F51B5",
                        color: "white",
                        mr: 2,
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>📊</span>
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Comparaison des Modèles
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      mb: 2,
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ height: 350, position: "relative" }}>
                      <Pie data={pieChartData} options={pieOptions} />
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            </Grid>

            {/* Détails des Modèles */}
            <Grid item xs={12} md={7}>
              <Fade in={true} timeout={1400}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    background: isDarkMode
                      ? "linear-gradient(135deg, rgba(30,30,30,0.7) 0%, rgba(50,50,50,0.4) 100%)"
                      : "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
                    height: "100%",
                    boxShadow: isDarkMode
                      ? "0 8px 32px rgba(0,0,0,0.3)"
                      : "0 8px 32px rgba(0,0,0,0.05)",
                    width: "1150px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: isDarkMode ? "#FF7043" : "#FF5722",
                        color: "white",
                        mr: 2,
                      }}
                    >
                      <QueryStats />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Détails des Métriques
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      mb: 3,
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />

                  <Grid container spacing={3}>
                    {/* Naive Bayes */}
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid",
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "divider",
                          bgcolor: isDarkMode
                            ? "rgba(38, 166, 154, 0.08)"
                            : "rgba(38, 166, 154, 0.04)",
                          mb: 2,
                          width: "500px",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 3 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: isDarkMode
                                ? "rgba(38, 166, 154, 0.2)"
                                : "rgba(38, 166, 154, 0.1)",
                              color: "#26A69A",
                              width: 48,
                              height: 48,
                              fontSize: "1.2rem",
                              mr: 2,
                            }}
                          >
                            NB
                          </Avatar>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: "text.primary" }}
                          >
                            Naive Bayes
                          </Typography>
                        </Box>

                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                          <Grid item xs={12} sm={4}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                Accuracy
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "#26A69A" }}
                              >
                                {(
                                  data.modeles.naive_bayes.accuracy * 100
                                ).toFixed(2)}
                                %
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                F1-Score
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "#FF6F61" }}
                              >
                                {(
                                  data.modeles.naive_bayes.f1_score * 100
                                ).toFixed(2)}
                                %
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                Precision
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "text.primary" }}
                              >
                                {(
                                  data.modeles.naive_bayes.accuracy * 100
                                ).toFixed(2)}
                                %
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* KNN */}
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid",
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "divider",
                          bgcolor: isDarkMode
                            ? "rgba(255, 111, 97, 0.08)"
                            : "rgba(255, 111, 97, 0.04)",
                          mb: 2,
                          width: "500px",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 3 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: isDarkMode
                                ? "rgba(255, 111, 97, 0.2)"
                                : "rgba(255, 111, 97, 0.1)",
                              color: "#FF6F61",
                              width: 48,
                              height: 48,
                              fontSize: "1.2rem",
                              mr: 2,
                            }}
                          >
                            KNN
                          </Avatar>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: "text.primary" }}
                          >
                            K-Nearest Neighbors
                          </Typography>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={3}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                Accuracy
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "#26A69A" }}
                              >
                                {(data.modeles.knn.accuracy * 100).toFixed(2)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                F1-Score
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "#FF6F61" }}
                              >
                                {(data.modeles.knn.f1_score * 100).toFixed(2)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                Precision
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "text.primary" }}
                              >
                                {(data.modeles.knn.accuracy * 100).toFixed(2)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                Meilleur k
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "#3a86ff" }}
                              >
                                {data.modeles.knn.best_n_neighbors}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
}

export default MetricsPage;
