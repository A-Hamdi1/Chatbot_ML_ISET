import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Paper,
  InputAdornment,
  Fade,
  Snackbar,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material";
import {
  Send,
  ThumbUp,
  ThumbDown,
  ContentCopy,
  Mic,
  MicOff,
  InsertEmoticon,
  AttachFile,
  AccessTime,
  Phone,
  Description,
  LocalLibrary,
  Book,
} from "@mui/icons-material";

import Slide from "@mui/material/Slide";
import axios from "axios";

function ChatPage({ sessions, setSessions }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [sessionId, setSessionId] = useState(
    new URLSearchParams(window.location.search).get("session_id")
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Memoize handleSend for text input
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const newMessage = { user: input, timestamp: new Date().toISOString() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        session_id: sessionId,
        source: "text",
      });
      const updatedMessages = [...messages, response.data.chat_entry];
      setMessages(updatedMessages);
      setSessionId(response.data.session_id);

      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) =>
          session.id === response.data.session_id
            ? { ...session, messages: updatedMessages }
            : session
        );
        return updatedSessions;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setSnackbarMessage("Erreur lors de l'envoi du message");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
    setInput("");
  }, [input, sessionId, messages, setSessions]);

  // Memoize handleVoiceSend for voice input
  const handleVoiceSend = useCallback(async () => {
    console.log("handleVoiceSend called with voiceInput:", voiceInput);
    if (!voiceInput.trim()) {
      console.warn("Empty voiceInput, showing Snackbar");
      setSnackbarMessage("Aucun texte détecté, veuillez réessayer.");
      setSnackbarOpen(true);
      setVoiceInput("");
      return;
    }
    const newMessage = {
      user: voiceInput,
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: voiceInput,
        session_id: sessionId,
        source: "voice",
      });
      const updatedMessages = [...messages, response.data.chat_entry];
      setMessages(updatedMessages);
      setSessionId(response.data.session_id);

      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) =>
          session.id === response.data.session_id
            ? { ...session, messages: updatedMessages }
            : session
        );
        return updatedSessions;
      });
    } catch (error) {
      console.error("Error sending voice message:", error);
      setSnackbarMessage("Erreur lors de l'envoi du message vocal");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
    setVoiceInput("");
  }, [voiceInput, sessionId, messages, setSessions]);

  // Memoize handleRate
  const handleRate = useCallback(async (question, isUseful) => {
    try {
      await axios.post("http://localhost:5000/rate", {
        question,
        rating: isUseful,
      });
      setSnackbarMessage("Merci pour votre retour !");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error rating response:", error);
      setSnackbarMessage("Erreur lors de l'envoi du retour");
      setSnackbarOpen(true);
    }
  }, []);

  // Memoize copyText
  const copyText = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage("Texte copié !");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error copying text:", error);
      setSnackbarMessage("Erreur lors de la copie du texte");
      setSnackbarOpen(true);
    }
  }, []);

  const sendShortcut = useCallback(
    async (cmd) => {
      if (!cmd.trim()) {
        setSnackbarMessage("Commande vide");
        setSnackbarOpen(true);
        return;
      }

      console.log("Sending shortcut:", cmd, "with sessionId:", sessionId);

      const newMessage = { user: cmd, timestamp: new Date().toISOString() };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setIsLoading(true);

      try {
        const payload = {
          message: cmd,
          session_id: sessionId || null,
          source: "shortcut",
        };
        const response = await axios.post(
          "http://localhost:5000/api/chat",
          payload
        );
        const { chat_entry, session_id } = response.data;

        const updatedMessages = [...messages, chat_entry];
        setMessages(updatedMessages);
        setSessionId(session_id);

        setSessions((prevSessions) => {
          const updatedSessions = prevSessions.map((session) =>
            session.id === session_id
              ? { ...session, messages: updatedMessages }
              : session
          );
          return updatedSessions;
        });
      } catch (error) {
        console.error("Error sending shortcut:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors de l'envoi du raccourci. Vérifiez la connexion au serveur.";
        setSnackbarMessage(errorMessage);
        setSnackbarOpen(true);
        setMessages((prevMessages) => prevMessages.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, messages, setSessions]
  );

  // Check microphone permission
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "denied") {
            setSnackbarMessage(
              "L'accès au microphone est refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur."
            );
            setSnackbarOpen(true);
          }
        })
        .catch((error) => {
          console.error("Error checking microphone permission:", error);
        });
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        console.log(
          "SpeechRecognition onresult:",
          transcript,
          "isFinal:",
          event.results[0].isFinal
        );
        setVoiceInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("SpeechRecognition error:", event.error);
        setSnackbarMessage(
          "Erreur lors de la reconnaissance vocale : " + event.error
        );
        setSnackbarOpen(true);
        setIsRecording(false);
        setVoiceInput("");
      };

      recognition.onend = () => {
        console.log("SpeechRecognition ended");
        setIsRecording(false);
      };

      setSpeechRecognition(recognition);
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
      setSnackbarMessage(
        "La reconnaissance vocale n'est pas supportée par votre navigateur."
      );
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      const session = sessions.find((s) => s.id === parseInt(sessionId));
      if (session) {
        setMessages(session.messages);
      } else {
        axios
          .get("http://localhost:5000/get_sessions")
          .then((response) => {
            const session = response.data.find(
              (s) => s.id === parseInt(sessionId)
            );
            if (session) {
              setMessages(session.messages);
              setSessions(
                response.data.sort(
                  (a, b) => new Date(b.date) - new Date(a.date)
                )
              );
            }
          })
          .catch((error) => console.error("Error fetching session:", error));
      }
    } else {
      setMessages([]);
    }
  }, [sessionId, sessions, setSessions]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleRecording = useCallback(() => {
    if (!speechRecognition) return;
    if (isRecording) {
      console.log("Stopping recording");
      speechRecognition.stop();
      setIsRecording(false);
      handleVoiceSend();
    } else {
      console.log("Starting recording");
      setVoiceInput("");
      speechRecognition.start();
      setIsRecording(true);
    }
  }, [isRecording, speechRecognition, handleVoiceSend]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(95vh - 84px)",
        maxWidth: "1200px",
        mx: "auto",
        my: 2,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        bgcolor: "background.paper",
      }}
    >
      <Box
        ref={chatBoxRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {messages.length === 0 && (
          <Fade in={true}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 500, mb: 2, color: "text.secondary" }}
              >
                Commencez une nouvelle conversation
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Posez une question ou utilisez un raccourci ci-dessous
              </Typography>
            </Box>
          </Fade>
        )}

        {messages.map((msg, index) => (
          <Fade key={index} in={true} timeout={500}>
            <Box>
              {/* User Message */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: msg.bot ? 1 : 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    maxWidth: "70%",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "16px 16px 0 16px",
                      bgcolor: "primary.main",
                      color: "white",
                      mr: 1,
                    }}
                  >
                    <Typography variant="body1">{msg.user}</Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      alignSelf: "flex-end",
                      mb: 0.5,
                      mr: 1,
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              </Box>

              {/* Bot Response */}
              {msg.bot && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      maxWidth: "70%",
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 1,
                        width: 32,
                        height: 32,
                      }}
                      src="/assistant-avatar.png"
                    />
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "16px 16px 16px 0",
                          bgcolor: "background.default",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body1">
                          {msg.bot.answer}
                        </Typography>
                        {msg.bot.url && (
                          <Typography>
                            <a
                              href={msg.bot.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#FF6F61" }}
                            >
                              En savoir plus
                            </a>
                          </Typography>
                        )}
                        {msg.bot.method && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mt: 1,
                            }}
                          >
                            Méthode: {msg.bot.method} (Similarité:{" "}
                            {(msg.bot.similarity * 100).toFixed(2)}%)
                          </Typography>
                        )}
                      </Paper>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          ml: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", mr: 1 }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                        <IconButton
                          onClick={() => handleRate(msg.user, true)}
                          size="small"
                          sx={{
                            color: "text.secondary",
                            p: 0.5,
                            "&:hover": { color: "success.main" },
                          }}
                        >
                          <ThumbUp fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRate(msg.user, false)}
                          size="small"
                          sx={{
                            color: "text.secondary",
                            p: 0.5,
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <ThumbDown fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => copyText(msg.bot.answer)}
                          size="small"
                          sx={{
                            color: "text.secondary",
                            p: 0.5,
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        ))}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        )}
      </Box>
      {/* Shortcuts Chips */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Grid container spacing={1} sx={{ maxWidth: "1000px" }}>
            <Grid item xs>
              <Button
                variant="contained"
                onClick={() => sendShortcut("/horaires")}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "primary.main",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
                startIcon={<AccessTime />}
              >
                Horaires
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                onClick={() => sendShortcut("/contact")}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "secondary.main",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { bgcolor: "secondary.dark" },
                }}
                startIcon={<Phone />}
              >
                Contact
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                onClick={() => sendShortcut("/inscription")}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "warning.main",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { bgcolor: "warning.dark" },
                }}
                startIcon={<Description />}
              >
                Inscription
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                onClick={() => sendShortcut("/bibliotheque")}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "success.main",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { bgcolor: "success.dark" },
                }}
                startIcon={<LocalLibrary />}
              >
                Bibliothèque
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                onClick={() => sendShortcut("/examens")}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "info.main",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { bgcolor: "info.dark" },
                }}
                startIcon={<Book />}
              >
                Examens
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Suggestions chips */}
      {messages.length > 0 &&
        messages[messages.length - 1].bot?.suggestions?.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              px: 2,
              pb: 2,
            }}
          >
            {messages[messages.length - 1].bot.suggestions.map(
              (suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion.label}
                  onClick={() => sendShortcut(suggestion.text)}
                  size="medium"
                  sx={{
                    borderRadius: "16px",
                    bgcolor: "secondary.light",
                    color: "secondary.contrastText",
                    px: 1,
                  }}
                />
              )
            )}
          </Box>
        )}

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton size="medium" sx={{ color: "text.secondary" }}>
            <InsertEmoticon />
          </IconButton>
          <IconButton size="medium" sx={{ color: "text.secondary" }}>
            <AttachFile />
          </IconButton>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            variant="outlined"
            size="medium"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            InputProps={{
              sx: {
                borderRadius: "24px",
                bgcolor: "background.default",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleRecording}
                    disabled={!speechRecognition}
                    sx={{
                      color: isRecording ? "error.main" : "text.secondary",
                    }}
                  >
                    {isRecording ? <MicOff /> : <Mic />}
                  </IconButton>
                  <IconButton
                    onClick={handleSend}
                    disabled={!input.trim()}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      ml: 1,
                    }}
                  >
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Slide}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor:
              snackbarMessage.startsWith("Erreur") ||
              snackbarMessage.startsWith("Aucun")
                ? "error.main"
                : "primary.main",
            color: "white",
            borderRadius: "8px",
          },
        }}
      />
    </Box>
  );
}

export default ChatPage;
