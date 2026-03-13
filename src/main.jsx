import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Button, Typography } from '@mui/material';
import { darkTheme, GlobalStyleConfig } from './theme.jsx';
import { COLORS } from './styles.js';
import './index.css';
import App from './App.jsx';
import StudyFlow from './pages/StudyFlow.jsx';

export function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2.5, textAlign: 'center' }}>
      <Typography variant="h4">Výběr dashboardu</Typography>
      <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', mt: 5 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/1')}
          sx={{
            px: 2.5, py: 1.25, fontSize: '18px', borderRadius: 2,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            '&:hover': { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, filter: 'brightness(1.1)' },
          }}
        >
          Dashboard 1 (Lapis)
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/2')}
          sx={{
            px: 2.5, py: 1.25, fontSize: '18px', borderRadius: 2,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`,
            '&:hover': { background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.blue})`, filter: 'brightness(1.1)' },
          }}
        >
          Dashboard 2 (StudyFlow)
        </Button>
      </Box>
    </Box>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {GlobalStyleConfig}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/1" element={<App />} />
          <Route path="/2" element={<StudyFlow />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);