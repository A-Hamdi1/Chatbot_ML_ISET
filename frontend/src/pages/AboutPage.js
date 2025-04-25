import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, ListItemIcon, Card, CardContent } from '@mui/material';
import { Build, Assessment, Description, Search, Language, Lightbulb, AutoStories, Star, History } from '@mui/icons-material';
import axios from 'axios';

function AboutPage() {
  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    features: []
  });

  useEffect(() => {
    axios.get('http://localhost:5000/about')
      .then(response => setAboutData(response.data))
      .catch(error => console.error('Error fetching about data:', error));
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
    <History sx={{ color: 'primary.main' }} />
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
        </CardContent>
      </Card>
    </Container>
  );
}

export default AboutPage;