import React from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';

export const Loading = ({ message = 'Chargement...' }) => (
  <Container maxWidth="md" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
    <CircularProgress />
    <Typography variant="h6" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Container>
);

export const Error = ({ message = 'Une erreur est survenue.' }) => (
  <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
    <Typography variant="h6" color="error">
      {message}
    </Typography>
  </Container>
);