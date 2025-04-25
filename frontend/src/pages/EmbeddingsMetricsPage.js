import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box, Card, CardContent } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

function EmbeddingsMetricsPage() {
  const [embeddingsData, setEmbeddingsData] = useState({
    results: [],
    similarities: [],
    method_counts: {}
  });

  useEffect(() => {
    axios.get('http://localhost:5000/embeddings-metrics')
      .then(response => {
        if (response.data.status === 'error') {
          throw new Error(response.data.message);
        }
        setEmbeddingsData(response.data);
      })
      .catch(error => console.error('Error fetching embeddings metrics:', error));
  }, []);

  const methodCountsChartData = {
    labels: Object.keys(embeddingsData.method_counts),
    datasets: [
      {
        label: 'Nombre de questions',
        data: Object.values(embeddingsData.method_counts),
        backgroundColor: '#26A69A',
      }
    ]
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
        Métriques d'Embeddings
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
              Méthode avec la Meilleure Similarité
            </Typography>
            <Bar
              data={methodCountsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { color: 'text.primary' } },
                  title: { display: true, text: 'Méthode avec la Meilleure Similarité', color: 'text.primary' }
                },
                scales: {
                  x: { ticks: { color: 'text.secondary' } },
                  y: {
                    title: { display: true, text: 'Nombre de Questions', color: 'text.secondary' },
                    beginAtZero: true,
                    ticks: { color: 'text.secondary' }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
        Résultats Détaillés
      </Typography>
      <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2, overflowX: 'auto' }}>
        <Table>
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
            {embeddingsData.results.map((result, index) => (
              <TableRow key={index}>
                <TableCell sx={{ color: 'text.primary' }}>{result.question}</TableCell>
                <TableCell sx={{ color: 'text.primary' }}>
                  {result.tfidf.response} (Similarité: {(result.tfidf.similarity * 100).toFixed(2)}%)
                </TableCell>
                <TableCell sx={{ color: 'text.primary' }}>
                  {result.word2vec.response} (Similarité: {(result.word2vec.similarity * 100).toFixed(2)}%)
                </TableCell>
                <TableCell sx={{ color: 'text.primary' }}>
                  {result.fasttext.response} (Similarité: {(result.fasttext.similarity * 100).toFixed(2)}%)
                </TableCell>
                <TableCell sx={{ color: 'text.primary' }}>
                  {result.ensemble.response} (Similarité: {(result.ensemble.similarity * 100).toFixed(2)}%)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Container>
  );
}

export default EmbeddingsMetricsPage;