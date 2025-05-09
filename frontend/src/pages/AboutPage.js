import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Dialog, 
  DialogContent,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Fade,
  Tooltip
} from '@mui/material';
import { 
  Build, 
  Assessment, 
  Description, 
  Search, 
  Language, 
  Lightbulb, 
  AutoStories, 
  Star, 
  History, 
  School,
  ArrowForward 
} from '@mui/icons-material';
import axios from 'axios';
import SelfLearningPanel from '../components/SelfLearningPanel';

function AboutPage() {
  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    features: []
  });
  const [selfLearningStatus, setSelfLearningStatus] = useState({ well_rated_available: 0 });
  const [openSelfLearning, setOpenSelfLearning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les données "À propos"
        const aboutResponse = await axios.get('http://localhost:5000/about');
        setAboutData(aboutResponse.data);
    
        // Récupérer le statut de l'auto-apprentissage
        const statusResponse = await axios.get('http://localhost:5000/api/self-learning/status');
        setSelfLearningStatus(statusResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const featureIcons = [
    <Build sx={{ color: 'primary.main' }} />,
    <Assessment sx={{ color: 'primary.main' }} />,
    <Description sx={{ color: 'primary.main' }} />,
    <Search sx={{ color: 'primary.main' }} />,
    <Language sx={{ color: 'primary.main' }} />,
    <Lightbulb sx={{ color: 'primary.main' }} />,
    <AutoStories sx={{ color: 'primary.main' }} />,
    <Star sx={{ color: 'primary.main' }} />,
    <History sx={{ color: 'primary.main' }} />,
    <School sx={{ color: 'primary.main' }} />
  ];

  const progressValue = Math.min((selfLearningStatus.well_rated_available / 10) * 100, 100);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in={!loading} timeout={800}>
        <Box>
          {/* Header Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #26A69A 0%, #80CBC4 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1, fontSize: 240 }}>
              <AutoStories fontSize="inherit" />
            </Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
              {aboutData.title || 'Chatbot ISET'}
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '80%', fontWeight: 400, mb: 3 }}>
              {aboutData.description || 'Votre assistant conversationnel intelligent pour l\'ISET'}
            </Typography>
            <Button 
              variant="contained" 
              endIcon={<ArrowForward />}
              href="/"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                borderRadius: '10px',
                px: 3,
                py: 1,
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              Commencer une discussion
            </Button>
          </Paper>

          {/* Features Section */}
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary', 
              mb: 3, 
              pl: 1 
            }}
          >
            Fonctionnalités
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {aboutData.features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade in={true} timeout={(index + 1) * 200}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      borderRadius: '16px', 
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: 'primary.light',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ 
                          bgcolor: 'primary.lighter', 
                          color: 'primary.dark', 
                          mr: 2,
                          p: 1,
                          width: 50,
                          height: 50
                        }}
                      >
                        {featureIcons[index % featureIcons.length]}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ fontWeight: 500, color: 'text.primary' }}
                        >
                          {feature.split(':')[0] || feature}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'text.secondary' }}
                        >
                          {feature.includes(':') ? feature.split(':')[1].trim() : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Self-Learning Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: '16px', 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.lighter', 
                  color: 'secondary.dark', 
                  mr: 2,
                  width: 56,
                  height: 56
                }}
              >
                <School fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Auto-apprentissage
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Amélioration continue du système basée sur les interactions des utilisateurs
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Questions bien notées disponibles
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ color: 'text.primary' }}>
                  {selfLearningStatus.well_rated_available} / 10
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progressValue >= 100 ? 'success.main' : 'primary.main'
                  }
                }} 
              />
            </Box>

            <Tooltip 
              title={selfLearningStatus.well_rated_available < 10 ? 
                `Il manque ${10 - selfLearningStatus.well_rated_available} questions bien notées` : 
                "Prêt à lancer l'auto-apprentissage"}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<School />}
                  onClick={() => setOpenSelfLearning(true)}
                  disabled={selfLearningStatus.well_rated_available < 10}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: '10px',
                    boxShadow: 2
                  }}
                >
                  {selfLearningStatus.well_rated_available < 10
                    ? `Auto-apprentissage (${10 - selfLearningStatus.well_rated_available} questions manquantes)`
                    : "Lancer l'auto-apprentissage"}
                </Button>
              </span>
            </Tooltip>
          </Paper>
        </Box>
      </Fade>

      {loading && (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Dialogue pour afficher SelfLearningPanel */}
      <Dialog
        open={openSelfLearning}
        onClose={() => setOpenSelfLearning(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1
          }
        }}
      >
        <DialogContent>
          <SelfLearningPanel />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default AboutPage;