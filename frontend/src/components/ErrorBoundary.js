// components/ErrorBoundary.js
import React from 'react';
import { Typography, Container } from '@mui/material';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" color="error">
            Une erreur s'est produite : {this.state.error?.message || 'Erreur inconnue'}
          </Typography>
          <Typography>
            Veuillez réessayer ou contacter le support.
          </Typography>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;   