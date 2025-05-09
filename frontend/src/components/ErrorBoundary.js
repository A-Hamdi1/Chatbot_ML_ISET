// components/ErrorBoundary.js
import React from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Button, 
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  ErrorOutline, 
  Refresh, 
  Home 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  state = { 
    hasError: false, 
    error: null,
    errorInfo: null 
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: '16px', 
              border: '1px solid', 
              borderColor: 'error.light',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              mb: 3 
            }}>
              <ErrorOutline 
                color="error" 
                sx={{ fontSize: 80, mb: 2, opacity: 0.8 }} 
              />
              <Typography variant="h4" color="text.primary" fontWeight={600} gutterBottom>
                Oups! Une erreur s'est produite
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                Le système a rencontré un problème inattendu.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Alert 
              severity="error" 
              variant="outlined"
              sx={{ 
                mb: 3, 
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  fontSize: 28
                }
              }}
            >
              <AlertTitle sx={{ fontWeight: 500 }}>Détails de l'erreur</AlertTitle>
              {this.state.error?.message || 'Erreur inconnue'}
            </Alert>

            {this.state.errorInfo && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: '8px',
                  bgcolor: 'grey.50',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                <Typography 
                  variant="caption" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'monospace', 
                    color: 'text.secondary' 
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button 
                variant="outlined" 
                startIcon={<Home />}
                component={Link}
                to="/"
                sx={{ 
                  borderRadius: '10px',
                  px: 3,
                  py: 1
                }}
              >
                Accueil
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleRefresh}
                sx={{ 
                  borderRadius: '10px',
                  px: 3,
                  py: 1
                }}
              >
                Actualiser la page
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;