import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

function MetricsPage() {
  const [metrics, setMetrics] = useState({
    nb_score: 0,
    nb_f1: 0,
    best_knn_score: 0,
    best_knn_f1: 0,
    best_n_neighbors: 0
  });
  const [ratingsData, setRatingsData] = useState({ utile: 0, nonUtile: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/report')
      .then(response => {
        setMetrics({
          nb_score: response.data.modeles.naive_bayes.accuracy,
          nb_f1: response.data.modeles.naive_bayes.f1_score,
          best_knn_score: response.data.modeles.knn.accuracy,
          best_knn_f1: response.data.modeles.knn.f1_score,
          best_n_neighbors: response.data.modeles.knn.best_n_neighbors
        });
      })
      .catch(error => console.error('Error fetching report:', error));

    axios.get('http://localhost:5000/metrics')
      .then(response => {
        setRatingsData({
          utile: response.data.ratings_summary.utile,
          nonUtile: response.data.ratings_summary.non_utile
        });
      })
      .catch(error => console.error('Error fetching metrics:', error));
  }, []);

  const chartData = {
    labels: ['Naive Bayes', 'KNN'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: [(metrics.nb_score * 100).toFixed(2), (metrics.best_knn_score * 100).toFixed(2)],
        backgroundColor: '#26A69A',
      },
      {
        label: 'F1-Score (%)',
        data: [(metrics.nb_f1 * 100).toFixed(2), (metrics.best_knn_f1 * 100).toFixed(2)],
        backgroundColor: '#FF6F61',
      }
    ]
  };

  const ratingsChartData = {
    labels: ['Utile', 'Non utile'],
    datasets: [
      {
        label: 'Évaluations',
        data: [ratingsData.utile, ratingsData.nonUtile],
        backgroundColor: ['#26A69A', '#FF6F61'],
      }
    ]
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
        Statistiques
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2 }}>
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
                    title: { display: true, text: 'Performance des Modèles', color: 'text.primary' }
                  },
                  scales: {
                    x: { ticks: { color: 'text.secondary' } },
                    y: { ticks: { color: 'text.secondary' } }
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
                Évaluations des Réponses
              </Typography>
              <Bar
                data={ratingsChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: 'text.primary' } },
                    title: { display: true, text: 'Évaluations des Réponses', color: 'text.primary' }
                  },
                  scales: {
                    x: { ticks: { color: 'text.secondary' } },
                    y: { ticks: { color: 'text.secondary' } }
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography sx={{ color: 'text.primary' }}>
                Précision Naïve Bayes: {(metrics.nb_score * 100).toFixed(2)}%
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>
                F1-score Naïve Bayes: {(metrics.nb_f1 * 100).toFixed(2)}%
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>
                Précision KNN: {(metrics.best_knn_score * 100).toFixed(2)}%
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>
                F1-score KNN: {(metrics.best_knn_f1 * 100).toFixed(2)}%
              </Typography>
              <Typography sx={{ color: 'text.primary' }}>
                Meilleur nombre de voisins (KNN): {metrics.best_n_neighbors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default MetricsPage;