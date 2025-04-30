import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  CircularProgress,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  AlertTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Check, School, Refresh } from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const categoryColors = {
  'admission': '#2196f3',  // Bleu
  'cours': '#4caf50',      // Vert
  'examens': '#f44336',    // Rouge
  'bibliotheque': '#ff9800', // Orange 
  'general': '#9c27b0',    // Violet
  'horaires': '#607d8b',   // Bleu-gris
  'contact': '#00bcd4',    // Cyan
  'autres': '#795548'      // Marron
};

const SelfLearningPanel = () => {
  const [status, setStatus] = useState({
    well_rated_available: 0,
    total_questions: 0,
    new_questions: 0,
    candidates_ready: false
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [integrationResult, setIntegrationResult] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/self-learning/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching learning status:', error);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/self-learning/candidates`);
      setCandidates(response.data.candidates || []);
      
      // Initialiser les sélections
      const initialSelection = {};
      response.data.candidates.forEach((candidate, index) => {
        initialSelection[index] = true; // Tous sélectionnés par défaut
      });
      setSelectedCandidates(initialSelection);
      
      setCandidatesOpen(true);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (index, newCategory) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index].category = newCategory;
    setCandidates(updatedCandidates);
  };

  const handleAnswerEdit = (index, newAnswer) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index].answer = newAnswer;
    setCandidates(updatedCandidates);
  };

  const handleSelectionChange = (index) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleIntegration = async () => {
    setLoading(true);
    try {
      // Filtrer uniquement les questions sélectionnées
      const selectedQuestions = candidates.filter((_, index) => selectedCandidates[index]);
      
      if (selectedQuestions.length === 0) {
        setIntegrationResult({
          status: 'info',
          message: 'Aucune question sélectionnée pour l\'intégration.'
        });
        setResultOpen(true);
        setCandidatesOpen(false);
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/self-learning/integrate`, {
        questions: selectedQuestions
      });
      
      setIntegrationResult({
        status: 'success',
        message: `${response.data.count} questions ont été intégrées avec succès.`,
        details: response.data
      });
      
      // Mettre à jour le statut après intégration
      fetchStatus();
      
    } catch (error) {
      console.error('Error integrating questions:', error);
      setIntegrationResult({
        status: 'error',
        message: 'Erreur lors de l\'intégration des questions.',
        details: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
      setResultOpen(true);
      setCandidatesOpen(false);
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <School sx={{ mr: 1 }} />
          Auto-apprentissage du Chatbot
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1">
            Questions bien notées disponibles: <Chip label={status.well_rated_available} color={status.well_rated_available > 0 ? "success" : "default"} />
          </Typography>
          <Typography variant="body1">
            Total dans la base de données: <Chip label={status.total_questions} color="primary" />
          </Typography>
        </Box>
        
        <Alert severity={status.candidates_ready ? "success" : "info"} sx={{ mb: 2 }}>
          <AlertTitle>{status.candidates_ready ? "Prêt pour l'enrichissement" : "En attente de feedback"}</AlertTitle>
          {status.candidates_ready 
            ? "Des questions bien évaluées sont disponibles pour enrichir la base de connaissances."
            : "Attendez plus de questions bien notées avant d'enrichir la base de connaissances."}
        </Alert>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Refresh />}
          onClick={fetchCandidates}
          disabled={loading || status.well_rated_available === 0}
          fullWidth
          sx={{ mb: 1 }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Analyser les questions candidates"}
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Ce processus analyse les questions bien notées et propose leur intégration dans la base de connaissances du chatbot.
        </Typography>
      </CardContent>

      {/* Dialog pour afficher et valider les questions candidates */}
      <Dialog 
        open={candidatesOpen} 
        onClose={() => setCandidatesOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Validation des questions candidates
        </DialogTitle>
        <DialogContent>
          {candidates.length === 0 ? (
            <DialogContentText>
              Aucune question candidate disponible actuellement. Les questions pourraient déjà être présentes dans la base de données ou il n'y a pas assez de questions bien notées.
            </DialogContentText>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Veuillez vérifier et valider les questions suivantes avant leur intégration dans la base de connaissances du chatbot.
              </DialogContentText>
              
              <List sx={{ width: '100%' }}>
                {candidates.map((candidate, index) => (
                  <Card key={index} sx={{ mb: 2, border: selectedCandidates[index] ? '1px solid #4caf50' : '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={selectedCandidates[index] || false}
                              onChange={() => handleSelectionChange(index)}
                              color="primary"
                            />
                          }
                          label={<Typography variant="subtitle1" fontWeight="bold">{candidate.question}</Typography>}
                        />
                        <Chip 
                          label={`${Math.round(candidate.confidence * 100)}% de confiance`}
                          color={candidate.confidence > 0.8 ? "success" : candidate.confidence > 0.6 ? "warning" : "error"}
                          size="small"
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          label="Réponse"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={2}
                          value={candidate.answer}
                          onChange={(e) => handleAnswerEdit(index, e.target.value)}
                          disabled={!selectedCandidates[index]}
                          sx={{ mb: 2 }}
                        />
                        
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Catégorie</InputLabel>
                          <Select
                            value={candidate.category}
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                            label="Catégorie"
                            disabled={!selectedCandidates[index]}
                          >
                            <MenuItem value="admission">Admission</MenuItem>
                            <MenuItem value="cours">Cours</MenuItem>
                            <MenuItem value="examens">Examens</MenuItem>
                            <MenuItem value="bibliotheque">Bibliothèque</MenuItem>
                            <MenuItem value="horaires">Horaires</MenuItem>
                            <MenuItem value="contact">Contact</MenuItem>
                            <MenuItem value="general">Général</MenuItem>
                            <MenuItem value="autres">Autres</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <Chip 
                          label={candidate.category}
                          size="small"
                          sx={{ 
                            ml: 1, 
                            backgroundColor: categoryColors[candidate.category] || '#757575',
                            color: 'white' 
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCandidatesOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleIntegration} 
            color="primary" 
            variant="contained"
            disabled={loading || candidates.length === 0 || Object.values(selectedCandidates).every(val => !val)}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          >
            Intégrer les questions sélectionnées
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour afficher le résultat de l'intégration */}
      <Dialog
        open={resultOpen}
        onClose={() => setResultOpen(false)}
      >
        <DialogTitle>
          Résultat de l'intégration
        </DialogTitle>
        <DialogContent>
          {integrationResult && (
            <Alert severity={integrationResult.status === 'success' ? 'success' : integrationResult.status === 'info' ? 'info' : 'error'}>
              <AlertTitle>{integrationResult.status === 'success' ? 'Succès' : integrationResult.status === 'info' ? 'Information' : 'Erreur'}</AlertTitle>
              {integrationResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultOpen(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SelfLearningPanel;