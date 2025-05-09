import React from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Divider,
  Avatar,
  useTheme,
  Fade,
  LinearProgress,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { Analytics, Speed, BarChart } from "@mui/icons-material";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetchEmbeddingsMetrics = async () => {
  const response = await axios.get("http://localhost:5000/embeddings-metrics");
  return response.data;
};

function EmbeddingsMetricsPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { data, isLoading, error } = useQuery({
    queryKey: ["embeddingsMetrics"],
    queryFn: fetchEmbeddingsMetrics,
    onError: () => {
      toast.error("Erreur lors du chargement des métriques d'embeddings");
    },
  });

  if (isLoading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, mb: 6, textAlign: "center", py: 8 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Chargement des métriques d'embeddings...
          </Typography>
          <LinearProgress sx={{ width: "50%", mt: 4, borderRadius: 1 }} />
        </Box>
      </Container>
    );
  }

  if (error || !data || !data.results.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: "16px",
            textAlign: "center",
            bgcolor: isDarkMode ? "rgba(244, 67, 54, 0.1)" : "#FFEBEE",
          }}
        >
          <Typography
            variant="h5"
            color="error"
            sx={{ mb: 2, fontWeight: 500 }}
          >
            Aucune donnée disponible
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Impossible de charger les métriques d'embeddings. Veuillez réessayer
            ultérieurement.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const methodCountsChartData = {
    labels: Object.keys(data.method_counts),
    datasets: [
      {
        label: "Nombre de questions",
        data: Object.values(data.method_counts),
        backgroundColor: ["#26A69A", "#42A5F5", "#7E57C2", "#EC407A"],
        borderColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
    ],
  };

  // Calculer la méthode la plus efficace
  const bestMethod = Object.entries(data.method_counts).reduce(
    (max, [method, count]) => (count > max.count ? { method, count } : max),
    { method: "", count: 0 }
  );

  // Calculer le pourcentage de réussite pour chaque méthode
  const totalQuestions = data.results.length;
  const methodPercentages = Object.entries(data.method_counts).map(
    ([method, count]) => ({
      method,
      percentage: (count / totalQuestions) * 100,
    })
  );

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
              borderRadius: "16px",
              background: isDarkMode
                ? "linear-gradient(135deg, #5E35B1 0%, #3949AB 100%)"
                : "linear-gradient(135deg, #7C4DFF 0%, #536DFE 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              boxShadow: isDarkMode
                ? "0 8px 32px rgba(0, 0, 0, 0.5)"
                : "0 8px 32px rgba(94, 53, 177, 0.2)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -50,
                top: -50,
                opacity: 0.08,
                fontSize: 280,
                transform: "rotate(-10deg)",
              }}
            >
              <Typography variant="h1" fontSize="inherit">
                📊
              </Typography>
            </Box>

            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Analytics />
                  </Avatar>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    Métriques d'Embeddings
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    mb: 3,
                    opacity: 0.9,
                    lineHeight: 1.5,
                  }}
                >
                  Analyse comparative des différentes méthodes d'embeddings
                  utilisées par le chatbot
                </Typography>
                <Chip
                  icon={<Speed sx={{ color: "#fff !important" }} />}
                  label={`Meilleure méthode: ${bestMethod.method}`}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    color: "white",
                    fontWeight: 500,
                    "& .MuiChip-icon": {
                      color: "white",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    p: 2,
                    borderRadius: "12px",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Statistiques générales
                  </Typography>
                  <Divider
                    sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.2)" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      Questions analysées:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {totalQuestions}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Méthodes comparées:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Object.keys(data.method_counts).length}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Chart Section */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: isDarkMode
                      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                      : "0 4px 20px rgba(0, 0, 0, 0.08)",
                    height: "400px",
                    width: "560px",
                    overflow: "hidden",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <BarChart
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Distribution des Meilleures Méthodes
                      </Typography>
                    </Box>
                    <Box sx={{ height: 300 }}>
                      <Bar
                        data={methodCountsChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                color: theme.palette.text.primary,
                                font: { weight: 500 },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const percentage = (
                                    (context.raw / totalQuestions) *
                                    100
                                  ).toFixed(1);
                                  return `${context.dataset.label}: ${context.raw} (${percentage}%)`;
                                },
                              },
                              backgroundColor: isDarkMode
                                ? "rgba(30, 30, 30, 0.8)"
                                : "rgba(255, 255, 255, 0.95)",
                              titleColor: isDarkMode ? "#fff" : "#000",
                              bodyColor: isDarkMode ? "#fff" : "#000",
                              borderColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.1)",
                              borderWidth: 1,
                              padding: 10,
                              cornerRadius: 8,
                              displayColors: true,
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false,
                                color: isDarkMode
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.1)",
                              },
                              ticks: {
                                color: theme.palette.text.secondary,
                                font: { weight: 500 },
                              },
                            },
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: isDarkMode
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "rgba(0, 0, 0, 0.05)",
                              },
                              ticks: {
                                color: theme.palette.text.secondary,
                                precision: 0,
                              },
                              title: {
                                display: true,
                                text: "Nombre de Questions",
                                color: theme.palette.text.secondary,
                                font: { weight: 500 },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: isDarkMode
                      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                      : "0 4px 20px rgba(0, 0, 0, 0.08)",
                    height: "400px",
                    width: "560px",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Efficacité des Méthodes
                    </Typography>
                    <Box sx={{ height: 50 }} />
                    {methodPercentages.map((item, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {item.method}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {item.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: isDarkMode
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.05)",
                            "& .MuiLinearProgress-bar": {
                              bgcolor:
                                index === 0
                                  ? "#26A69A"
                                  : index === 1
                                  ? "#42A5F5"
                                  : index === 2
                                  ? "#7E57C2"
                                  : "#EC407A",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    ))}

                    <Box
                      sx={{
                        mt: 4,
                        p: 2,
                        bgcolor: isDarkMode
                          ? "rgba(76, 175, 80, 0.1)"
                          : "#E8F5E9",
                        borderRadius: "12px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ color: "#2E7D32" }}
                      >
                        Recommandation
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: isDarkMode ? "#81C784" : "#388E3C",
                        }}
                      >
                        {bestMethod.method} est la méthode la plus efficace avec
                        une précision de{" "}
                        {((bestMethod.count / totalQuestions) * 100).toFixed(1)}
                        % sur l'ensemble des questions testées.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Detailed Results Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper
              sx={{
                mt: 4,
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: isDarkMode
                  ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                  : "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Résultats Détaillés
                </Typography>
                <Chip
                  label={`${data.results.length} questions analysées`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              <Box sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: isDarkMode
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.02)",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Question
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        TF-IDF
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Word2Vec
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        FastText
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Ensemble
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.results.map((result, index) => {
                      // Trouver la meilleure similarité pour cette question
                      const similarities = [
                        { method: "TF-IDF", value: result.tfidf.similarity },
                        {
                          method: "Word2Vec",
                          value: result.word2vec.similarity,
                        },
                        {
                          method: "FastText",
                          value: result.fasttext.similarity,
                        },
                        {
                          method: "Ensemble",
                          value: result.ensemble.similarity,
                        },
                      ];
                      const bestSimilarity = Math.max(
                        ...similarities.map((s) => s.value)
                      );

                      return (
                        <TableRow
                          key={index}
                          sx={{
                            "&:nth-of-type(odd)": {
                              bgcolor: isDarkMode
                                ? "rgba(255, 255, 255, 0.02)"
                                : "rgba(0, 0, 0, 0.01)",
                            },
                            "&:hover": {
                              bgcolor: isDarkMode
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.03)",
                            },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                              borderLeft: "4px solid",
                              borderLeftColor:
                                index % 4 === 0
                                  ? "#26A69A"
                                  : index % 4 === 1
                                  ? "#42A5F5"
                                  : index % 4 === 2
                                  ? "#7E57C2"
                                  : "#EC407A",
                            }}
                          >
                            {result.question}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            <Box
                              sx={{
                                position: "relative",
                                p: 1.5,
                                borderRadius: "8px",
                                bgcolor:
                                  result.tfidf.similarity === bestSimilarity
                                    ? isDarkMode
                                      ? "rgba(76, 175, 80, 0.1)"
                                      : "#E8F5E9"
                                    : "transparent",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ wordBreak: "break-word" }}
                              >
                                {result.tfidf.response}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={`${(
                                    result.tfidf.similarity * 100
                                  ).toFixed(2)}%`}
                                  sx={{
                                    fontWeight: 600,
                                    bgcolor:
                                      result.tfidf.similarity === bestSimilarity
                                        ? "#4CAF50"
                                        : isDarkMode
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(0, 0, 0, 0.08)",
                                    color:
                                      result.tfidf.similarity === bestSimilarity
                                        ? "white"
                                        : theme.palette.text.secondary,
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            <Box
                              sx={{
                                position: "relative",
                                p: 1.5,
                                borderRadius: "8px",
                                bgcolor:
                                  result.word2vec.similarity === bestSimilarity
                                    ? isDarkMode
                                      ? "rgba(76, 175, 80, 0.1)"
                                      : "#E8F5E9"
                                    : "transparent",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ wordBreak: "break-word" }}
                              >
                                {result.word2vec.response}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={`${(
                                    result.word2vec.similarity * 100
                                  ).toFixed(2)}%`}
                                  sx={{
                                    fontWeight: 600,
                                    bgcolor:
                                      result.word2vec.similarity ===
                                      bestSimilarity
                                        ? "#4CAF50"
                                        : isDarkMode
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(0, 0, 0, 0.08)",
                                    color:
                                      result.word2vec.similarity ===
                                      bestSimilarity
                                        ? "white"
                                        : theme.palette.text.secondary,
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            <Box
                              sx={{
                                position: "relative",
                                p: 1.5,
                                borderRadius: "8px",
                                bgcolor:
                                  result.fasttext.similarity === bestSimilarity
                                    ? isDarkMode
                                      ? "rgba(76, 175, 80, 0.1)"
                                      : "#E8F5E9"
                                    : "transparent",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ wordBreak: "break-word" }}
                              >
                                {result.fasttext.response}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={`${(
                                    result.fasttext.similarity * 100
                                  ).toFixed(2)}%`}
                                  sx={{
                                    fontWeight: 600,
                                    bgcolor:
                                      result.fasttext.similarity ===
                                      bestSimilarity
                                        ? "#4CAF50"
                                        : isDarkMode
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(0, 0, 0, 0.08)",
                                    color:
                                      result.fasttext.similarity ===
                                      bestSimilarity
                                        ? "white"
                                        : theme.palette.text.secondary,
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            <Box
                              sx={{
                                position: "relative",
                                p: 1.5,
                                borderRadius: "8px",
                                bgcolor:
                                  result.ensemble.similarity === bestSimilarity
                                    ? isDarkMode
                                      ? "rgba(76, 175, 80, 0.1)"
                                      : "#E8F5E9"
                                    : "transparent",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ wordBreak: "break-word" }}
                              >
                                {result.ensemble.response}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={`${(
                                    result.ensemble.similarity * 100
                                  ).toFixed(2)}%`}
                                  sx={{
                                    fontWeight: 600,
                                    bgcolor:
                                      result.ensemble.similarity ===
                                      bestSimilarity
                                        ? "#4CAF50"
                                        : isDarkMode
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(0, 0, 0, 0.08)",
                                    color:
                                      result.ensemble.similarity ===
                                      bestSimilarity
                                        ? "white"
                                        : theme.palette.text.secondary,
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
}

export default EmbeddingsMetricsPage;
