// pages/MetricsPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MetricsPage() {
  const [metrics, setMetrics] = useState({
    nb_score: 0,
    nb_f1: 0,
    best_knn_score: 0,
    best_knn_f1: 0,
    best_n_neighbors: 0,
  });
  const [setRatingsData] = useState({ utile: 0, nonUtile: 0 });
  const chartRef = useRef(null);

  useEffect(() => {
    console.log('Fetching metrics...');
    axios
      .get('http://localhost:5000/report')
      .then((response) => {
        console.log('Report data:', response.data);
        setMetrics({
          nb_score: response.data.modeles.naive_bayes.accuracy,
          nb_f1: response.data.modeles.naive_bayes.f1_score,
          best_knn_score: response.data.modeles.knn.accuracy,
          best_knn_f1: response.data.modeles.knn.f1_score,
          best_n_neighbors: response.data.modeles.knn.best_n_neighbors,
        });
      })
      .catch((error) => console.error('Error fetching report:', error));

    axios
      .get('http://localhost:5000/metrics')
      .then((response) => {
        console.log('Metrics data:', response.data);
        setRatingsData({
          utile: response.data.ratings_summary.utile,
          nonUtile: response.data.ratings_summary.non_utile,
        });
      })
      .catch((error) => console.error('Error fetching metrics:', error));

    // Nettoyage du graphique
    return () => {
      if (chartRef.current) {
        console.log('Destroying chart instance');
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [setRatingsData]);

  // Vérifier si les données sont disponibles
  if (!metrics.nb_score) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6">Chargement des statistiques...</Typography>
      </Container>
    );
  }

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
      },
    ],
  };

  console.log('Rendering chart with data:', chartData);

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
        Statistiques
      </Typography>
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
                title: { display: true, text: 'Performance des Modèles', color: 'text.primary' },
              },
              scales: {
                x: { ticks: { color: 'text.secondary' } },
                y: { ticks: { color: 'text.secondary' } },
              },
            }}
            ref={(chart) => {
              if (chart) {
                chartRef.current = chart.chartInstance;
              }
            }}
          />
        </CardContent>
      </Card>
    </Container>
  );
}

export default MetricsPage;