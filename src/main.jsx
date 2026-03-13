import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, GlobalStyleConfig } from './theme.jsx';
import './index.css';
import App from './App.jsx';
import StudyFlow from './pages/StudyFlow.jsx';

export function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Výběr dashboardu</h1>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
        <button
          onClick={() => navigate('/1')}
          style={{
            padding: '10px 20px', fontSize: '18px', cursor: 'pointer', borderRadius: '8px',
            background: 'linear-gradient(135deg, #9055FF, #13E2DA)', color: 'white', border: 'none'
          }}
        >
          Dashboard 1 (Lapis)
        </button>
        <button
          onClick={() => navigate('/2')}
          style={{
            padding: '10px 20px', fontSize: '18px', cursor: 'pointer', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C6FF7, #4F9CF9)', color: 'white', border: 'none'
          }}
        >
          Dashboard 2 (StudyFlow)
        </button>
      </div>
    </div>
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
