import React from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchEmbeddingsMetrics = async () => {
  const response = await axios.get('http://localhost:5000/embeddings-metrics');
  return response.data;
};

function EmbeddingsMetricsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['embeddingsMetrics'],
    queryFn: fetchEmbeddingsMetrics,
    onError: () => {
      toast.error('Erreur lors du chargement des métriques d\'embeddings');
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des métriques...
        </Typography>
      </Container>
    );
  }

  if (error || !data || !data.results.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6" color="error">
          Aucune donnée disponible ou erreur lors du chargement des métriques.
        </Typography>
      </Container>
    );
  }

  const methodCountsChartData = {
    labels: Object.keys(data.method_counts),
    datasets: [
      {
        label: 'Nombre de questions',
        data: Object.values(data.method_counts),
        backgroundColor: '#26A69A',
        borderColor: '#26A69A',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
          Métriques d'Embeddings
        </Typography>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
              Meilleure Méthode par Question
            </Typography>
            <Bar
              data={methodCountsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { color: 'text.primary' } },
                  title: {
                    display: true,
                    text: 'Méthode avec la Meilleure Similarité',
                    color: 'text.primary',
                    font: { size: 16 },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${context.raw}`,
                    },
                  },
                },
                scales: {
                  x: { ticks: { color: 'text.secondary' } },
                  y: {
                    beginAtZero: true,
                    ticks: { color: 'text.secondary' },
                    title: { display: true, text: 'Nombre de Questions', color: 'text.secondary' },
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
          Résultats Détaillés
        </Typography>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2, overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>Question</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>TF-IDF</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>Word2Vec</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>FastText</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>Ensemble</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: 'text.primary' }}>{result.question}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {result.tfidf.response} <br />
                    <Typography variant="caption">
                      (Similarité: {(result.tfidf.similarity * 100).toFixed(2)}%)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {result.word2vec.response} <br />
                    <Typography variant="caption">
                      (Similarité: {(result.word2vec.similarity * 100).toFixed(2)}%)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {result.fasttext.response} <br />
                    <Typography variant="caption">
                      (Similarité: {(result.fasttext.similarity * 100).toFixed(2)}%)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {result.ensemble.response} <br />
                    <Typography variant="caption">
                      (Similarité: {(result.ensemble.similarity * 100).toFixed(2)}%)
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </Container>
  );
}

export default EmbeddingsMetricsPage;