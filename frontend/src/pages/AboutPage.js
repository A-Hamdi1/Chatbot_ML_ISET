import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, ListItemIcon, Card, CardContent, Button, Dialog,DialogContent  } from '@mui/material';
import { Build, Assessment, Description, Search, Language, Lightbulb, AutoStories, Star, History, School } from '@mui/icons-material';
import axios from 'axios';
import SelfLearningPanel from '../components/SelfLearningPanel'; // Importer le panneau

function AboutPage() {
  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    features: []
  });
  const [selfLearningStatus, setSelfLearningStatus] = useState({ well_rated_available: 0 });
  const [openSelfLearning, setOpenSelfLearning] = useState(false);

  useEffect(() => {
    // Récupérer les données "À propos"
    axios.get('http://localhost:5000/about')
      .then(response => setAboutData(response.data))
      .catch(error => console.error('Error fetching about data:', error));

    // Récupérer le statut de l'auto-apprentissage
    axios.get('http://localhost:5000/api/self-learning/status')
      .then(response => setSelfLearningStatus(response.data))
      .catch(error => console.error('Error fetching self-learning status:', error));
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
    <School sx={{ color: 'primary.main' }} /> // Icône pour l'auto-apprentissage
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
            {aboutData.title}
          </Typography>
          <Typography paragraph sx={{ color: 'text.primary' }}>
            {aboutData.description}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
            Fonctionnalités
          </Typography>
          <List>
            {aboutData.features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  {featureIcons[index]}
                </ListItemIcon>
                <ListItemText primary={feature} primaryTypographyProps={{ color: 'text.primary' }} />
              </ListItem>
            ))}
          </List>
          {/* Bouton pour déclencher l'auto-apprentissage */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<School />}
            onClick={() => setOpenSelfLearning(true)}
            disabled={selfLearningStatus.well_rated_available < 10}
            sx={{ mt: 2 }}
          >
            {selfLearningStatus.well_rated_available < 10
              ? `Auto-apprentissage (Attendez ${10 - selfLearningStatus.well_rated_available} questions bien notées)`
              : 'Lancer l\'auto-apprentissage'}
          </Button>
        </CardContent>
      </Card>

      {/* Dialogue pour afficher SelfLearningPanel */}
      <Dialog
        open={openSelfLearning}
        onClose={() => setOpenSelfLearning(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <SelfLearningPanel />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default AboutPage;