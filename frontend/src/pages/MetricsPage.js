import React from 'react';
import { Container, Typography, Card, CardContent, CircularProgress, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchMetrics = async () => {
  const response = await axios.get('http://localhost:5000/report');
  return response.data;
};

function MetricsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    onError: () => {
      toast.error('Erreur lors du chargement des statistiques');
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des statistiques...
        </Typography>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6" color="error">
          Impossible de charger les statistiques. Veuillez réessayer.
        </Typography>
      </Container>
    );
  }

  const chartData = {
    labels: ['Naive Bayes', 'KNN'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: [(data.modeles.naive_bayes.accuracy * 100).toFixed(2), (data.modeles.knn.accuracy * 100).toFixed(2)],
        backgroundColor: '#26A69A',
      },
      {
        label: 'F1-Score (%)',
        data: [(data.modeles.naive_bayes.f1_score * 100).toFixed(2), (data.modeles.knn.f1_score * 100).toFixed(2)],
        backgroundColor: '#FF6F61',
      },
    ],
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
          Statistiques des Modèles
        </Typography>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
              Performance des Modèles
            </Typography>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { color: 'text.primary' } },
                  title: {
                    display: true,
                    text: 'Accuracy et F1-Score des Modèles',
                    color: 'text.primary',
                    font: { size: 16 },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${context.raw}%`,
                    },
                  },
                },
                scales: {
                  x: { ticks: { color: 'text.secondary' } },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: 'text.secondary', callback: (value) => `${value}%` },
                    title: { display: true, text: 'Pourcentage', color: 'text.secondary' },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
              Détails
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ color: 'text.primary' }}>
                <strong>Naive Bayes</strong> - Accuracy: {(data.modeles.naive_bayes.accuracy * 100).toFixed(2)}%, F1-Score: {(data.modeles.naive_bayes.f1_score * 100).toFixed(2)}%
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>
                <strong>KNN</strong> - Accuracy: {(data.modeles.knn.accuracy * 100).toFixed(2)}%, F1-Score: {(data.modeles.knn.f1_score * 100).toFixed(2)}%, Meilleur k: {data.modeles.knn.best_n_neighbors}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}

export default MetricsPage;