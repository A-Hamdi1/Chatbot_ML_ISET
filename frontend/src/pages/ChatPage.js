import React, { useState, useEffect, useRef } from 'react';
import { Container, TextField, IconButton, Box, Typography, Avatar, Chip, Card, CardContent, Fade } from '@mui/material';
import { Send, ThumbUp, ThumbDown, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(new URLSearchParams(window.location.search).get('session_id'));
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      axios.get('http://localhost:5000/get_sessions')
        .then(response => {
          const session = response.data.find(s => s.id === sessionId);
          if (session) setMessages(session.messages);
        })
        .catch(error => console.error('Error fetching session:', error));
    }
  }, [sessionId]);

  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { user: input, timestamp: new Date().toISOString() };
    setMessages([...messages, newMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        session_id: sessionId
      });
      setMessages([...messages, response.data.chat_entry]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message');
    }
    setInput('');
  };

  const handleRate = async (question, isUseful) => {
    try {
      await axios.post('http://localhost:5000/rate', { question, rating: isUseful });
      alert('Merci pour votre retour !');
    } catch (error) {
      console.error('Error rating response:', error);
      alert('Erreur lors de l\'envoi du retour');
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Texte copié !');
    } catch (error) {
      console.error('Error copying text:', error);
      alert('Erreur lors de la copie du texte');
    }
  };

  const sendShortcut = async (cmd) => {
    setInput(cmd);
    await handleSend();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
      <Box
        ref={chatBoxRef}
        sx={{
          height: '70vh',
          overflowY: 'auto',
          mb: 2,
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 4,
        }}
      >
        {messages.length === 0 && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src="/assistant-avatar.png" alt="Assistant" sx={{ bgcolor: 'primary.main' }} />
              <Typography sx={{ ml: 2, color: 'text.primary' }}>
                Bonjour ! Posez-moi une question ou utilisez un raccourci ci-dessous.
              </Typography>
            </Box>
          </Fade>
        )}
        {messages.map((msg, index) => (
          <Fade key={index} in={true} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Card
                  sx={{
                    maxWidth: '70%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 4,
                    boxShadow: 2,
                  }}
                >
                  <CardContent>
                    <Typography>{msg.user}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption">
                        {new Date(msg.timestamp).toLocaleString('fr-FR')}
                      </Typography>
                      <IconButton onClick={() => copyText(msg.user)} size="small">
                        <ContentCopy fontSize="small" sx={{ color: 'white' }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              {msg.bot && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar src="/assistant-avatar.png" alt="Assistant" sx={{ bgcolor: 'primary.main' }} />
                  <Card
                    sx={{
                      maxWidth: '70%',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      borderRadius: 4,
                      boxShadow: 2,
                      ml: 2,
                    }}
                  >
                    <CardContent>
                      <Typography>{msg.bot.answer}</Typography>
                      {msg.bot.url && (
                        <Typography>
                          <a href={msg.bot.url} target="_blank" rel="noopener noreferrer" style={{ color: '#FF6F61' }}>
                            En savoir plus
                          </a>
                        </Typography>
                      )}
                      {msg.bot.method && (
                        <Typography variant="caption">
                          Méthode: {msg.bot.method} (Similarité: {(msg.bot.similarity * 100).toFixed(2)}%)
                        </Typography>
                      )}
                      <Typography variant="caption" display="block">
                        {new Date(msg.timestamp).toLocaleString('fr-FR')}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>Utile ?</Typography>
                        <IconButton onClick={() => handleRate(msg.user, true)} size="small">
                          <ThumbUp fontSize="small" sx={{ color: 'text.primary' }} />
                        </IconButton>
                        <IconButton onClick={() => handleRate(msg.user, false)} size="small">
                          <ThumbDown fontSize="small" sx={{ color: 'text.primary' }} />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          </Fade>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          variant="outlined"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
          }}
        />
        <IconButton
          onClick={handleSend}
          sx={{
            ml: 2,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            width: 56,
            height: 56,
          }}
        >
          <Send />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          icon={<span role="img" aria-label="clock">🕒</span>}
          label="Horaires"
          onClick={() => sendShortcut('/horaires')}
          clickable
          sx={{
            borderRadius: '16px',
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        />
        <Chip
          icon={<span role="img" aria-label="contact">📞</span>}
          label="Contact"
          onClick={() => sendShortcut('/contact')}
          clickable
          sx={{
            borderRadius: '16px',
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        />
        <Chip
          icon={<span role="img" aria-label="inscription">📝</span>}
          label="Inscription"
          onClick={() => sendShortcut('/inscription')}
          clickable
          sx={{
            borderRadius: '16px',
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        />
        <Chip
          icon={<span role="img" aria-label="bibliotheque">📚</span>}
          label="Bibliothèque"
          onClick={() => sendShortcut('/bibliotheque')}
          clickable
          sx={{
            borderRadius: '16px',
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        />
        <Chip
          icon={<span role="img" aria-label="examens">📖</span>}
          label="Examens"
          onClick={() => sendShortcut('/examens')}
          clickable
          sx={{
            borderRadius: '16px',
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        />
      </Box>
      {messages.length > 0 && messages[messages.length - 1].bot?.suggestions?.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {messages[messages.length - 1].bot.suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              icon={<span role="img" aria-label="suggestion">💡</span>}
              label={suggestion.label}
              onClick={() => sendShortcut(suggestion.text)}
              clickable
              sx={{
                borderRadius: '16px',
                bgcolor: 'tertiary.main',
                color: 'black',
                '&:hover': { bgcolor: 'tertiary.dark' },
              }}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default ChatPage;