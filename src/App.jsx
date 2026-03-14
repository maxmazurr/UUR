import { useState, useEffect, useRef, useMemo } from 'react';
import { keyframes } from '@emotion/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  ArrowRight, Flame, BookOpen, CheckCircle,
  Calendar, FileText, PenTool, Folder, Play,
  Layers, Search
} from 'lucide-react';
import { GLASS, HIDE_SCROLLBAR, COLORS, fadeInUpAnim } from './styles';

// ─── KEYFRAMES (emotion) ───────────────────────────────────────────────────────
const floatAnim = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(10vw, -10vh) scale(1.1); }
  66%  { transform: translate(-10vw, 5vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;
const pulseGlowAnim = keyframes`
  from { box-shadow: 0 0 20px rgba(var(--orb-color-1-rgb), 0.3), 0 0 40px rgba(var(--orb-color-1-rgb), 0.1); }
  to   { box-shadow: 0 0 30px rgba(var(--orb-color-1-rgb), 0.6), 0 0 60px rgba(var(--orb-color-2-rgb), 0.3); }
`;
const streakPulseAnim = keyframes`
  0%, 100% {
    transform: scale(1) rotate(-5deg);
    filter: drop-shadow(0 0 5px rgba(144, 85, 255, 0.5));
  }
  50% {
    transform: scale(1.15) rotate(5deg);
    filter: drop-shadow(0 0 15px rgba(144, 85, 255, 0.8));
  }
`;
const fadeInCellAnim = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const strikeAnim = keyframes`
  0%   { width: 0; opacity: 0; }
  10%  { opacity: 1; }
  100% { width: 100%; opacity: 1; }
`;

// ─── SHARED STYLES (imported from styles.js) ────────────────────────────────

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useOnScreen(ref, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const CountUp = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isVisible = useOnScreen(ref);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    let rafId = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) rafId = window.requestAnimationFrame(step);
    };
    rafId = window.requestAnimationFrame(step);
    return () => { if (rafId) window.cancelAnimationFrame(rafId); };
  }, [end, duration, isVisible]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Reveal = ({ children, delay = 0, direction = 'up', sx = {} }) => {
  const ref = useRef(null);
  const isVisible = useOnScreen(ref);

  let transformVal = '';
  switch (direction) {
    case 'up': transformVal = 'translateY(48px)'; break;
    case 'down': transformVal = 'translateY(-48px)'; break;
    case 'left': transformVal = 'translateX(-48px)'; break;
    case 'right': transformVal = 'translateX(48px)'; break;
    case 'none': transformVal = 'translateY(0) scale(0.95)'; break;
    default: transformVal = 'translateY(48px)';
  }

  return (
    <Box
      ref={ref}
      sx={{
        transition: 'all 1000ms ease-out',
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0,0) scale(1)' : transformVal,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

const SpotlightButton = ({ children, sx = {}, glowColor = 'rgba(124, 111, 247, 0.6)' }) => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <Box
      component="button"
      className="spotlight-btn hover-target group"
      onMouseMove={handleMouseMove}
      sx={{
        position: 'relative', width: '100%', height: '100%',
        p: { xs: 2, sm: 3 }, borderRadius: 4, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: { xs: 1.5, sm: 2 },
        transition: 'all 0.3s',
        border: 'none', cursor: 'pointer', ...GLASS,
        '--glow-color': glowColor,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

const MagneticBtn = ({ children, className = '', sx: sxProp = {}, onClick, strength = 0.35 }) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    ref.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
  };
  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0,0) scale(1)';
  };
  return (
    <Box
      component="button"
      ref={ref}
      className={className}
      sx={{ transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)', willChange: 'transform', ...sxProp }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

const HoloCard = ({ item }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const move = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setStyle({
      background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
      transform: `perspective(800px) rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg) translateY(-6px) scale(1.02)`,
    });
  };
  const leave = () => setStyle({});

  return (
    <Box
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className="group"
      sx={{
        flexShrink: 0,
        width: '100%', height: '100%',
        p: 'clamp(14px,3vw,24px)', borderRadius: '20px', cursor: 'pointer',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s',
        boxShadow: style.transform ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        ...style,
      }}
    >
      <Box sx={{ 
        width: 44, height: 44, borderRadius: '14px', 
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
        fontSize: '24px'
      }}>
        {item.icon}
      </Box>
      <Typography sx={{ fontSize: 11, color: item.clr, fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kurz</Typography>
      <Typography component="h3" sx={{ fontSize: 20, fontWeight: 600, mb: 2.5, fontFamily: 'var(--font-heading)', color: 'white' }}>{item.title}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 3 }}>
        {[
          { label: 'kartiček', val: item.cards, dotColor: COLORS.accent },
          { label: 'testů', val: item.tests, dotColor: COLORS.green },
          { label: 'poznámek', val: item.notes, dotColor: COLORS.orange },
        ].map(({ label, val, dotColor }, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Typography component="span" sx={{ color: 'white' }}>{val}</Typography> {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#8891AA' }}>
        <span>Naposledy otevřeno</span><span>{item.date}</span>
      </Box>

      <Box sx={{
        position: 'absolute', inset: 0, bgcolor: 'rgba(15,17,23,0.8)', backdropFilter: 'blur(4px)',
        opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.3s', borderRadius: '24px', zIndex: 10,
        '.group:hover &': { opacity: 1 }
      }}>
        <Box component="button" sx={{
          bgcolor: 'white', color: 'black', px: 3, py: 1.25, borderRadius: '9999px', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 1, border: 'none', cursor: 'pointer',
          transform: 'translateY(16px)', transition: 'all 0.3s',
          '.group:hover &': { transform: 'translateY(0)' }
        }}>
          Otevřít <ArrowRight size={16} />
        </Box>
      </Box>
    </Box>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function App() {
  const rootRef = useRef(null);
  const parallaxRef1 = useRef(null);
  const parallaxRef2 = useRef(null);
  const parallaxRef3 = useRef(null);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Opakovat 20 kartiček z Biologie", icon: <Layers size={20} style={{ color: COLORS.accent }} />, completed: false },
    { id: 2, title: "Napsat test: Derivace (Matematika)", icon: <PenTool size={20} style={{ color: COLORS.green }} />, completed: false },
    { id: 3, title: "Přečíst nové poznámky z Historie", icon: <FileText size={20} style={{ color: COLORS.orange }} />, completed: false },
  ]);
  const [isUserInteractingTasks, setIsUserInteractingTasks] = useState(false);
  const heatmapRef = useRef(null);
  const heatmapVisible = useOnScreen(heatmapRef);

  useEffect(() => {
    if (isUserInteractingTasks) return;
    let isActive = true;

    const runTasksDemo = async () => {
      await new Promise(r => setTimeout(r, 3000));
      if (!isActive) return;

      while (isActive) {
        setTasks(prev => prev.map(task => task.id === 1 ? { ...task, completed: true } : task));
        await new Promise(r => setTimeout(r, 500));
        if (!isActive) return;

        setTasks(prev => {
          const incomplete = prev.filter(t => !t.completed);
          const complete = prev.filter(t => t.completed);
          return [...incomplete, ...complete];
        });
        await new Promise(r => setTimeout(r, 4000));
        if (!isActive) return;

        setTasks(prev => {
          const t1 = { ...prev.find(t => t.id === 1), completed: false };
          const t2 = { ...prev.find(t => t.id === 2), completed: false };
          const t3 = { ...prev.find(t => t.id === 3), completed: false };
          return [t1, t2, t3];
        });
        await new Promise(r => setTimeout(r, 6000));
      }
    };

    runTasksDemo();
    return () => { isActive = false; };
  }, [isUserInteractingTasks]);

  const toggleTask = (id) => {
    setIsUserInteractingTasks(true);
    setTasks(prev => prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    setTimeout(() => {
      setTasks(prev => {
        const incomplete = prev.filter(t => !t.completed);
        const complete = prev.filter(t => t.completed);
        return [...incomplete, ...complete];
      });
    }, 500);
  };

  const heatmapData = useMemo(() => {
    return Array.from({ length: 14 }).map(() =>
      Array.from({ length: 7 }).map(() => {
        const intensity = Math.random();
        if (intensity > 0.8) return '1';
        if (intensity > 0.5) return '0.6';
        if (intensity > 0.3) return '0.3';
        return '0';
      })
    );
  }, []);

  useEffect(() => {
    const colorPairs = [
      { c1: [144, 85, 255], c2: [19, 226, 218] },
      { c1: [214, 255, 127], c2: [0, 179, 204] },
      { c1: [64, 37, 101], c2: [48, 190, 150] },
      { c1: [203, 94, 238], c2: [75, 225, 236] },
      { c1: [115, 125, 254], c2: [255, 202, 201] },
      { c1: [237, 123, 132], c2: [144, 85, 255] }
    ];
    const interpolate = (start, end, factor) => Math.round(start + (end - start) * factor);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;

          // Parallax: прямое обновление DOM, минуя React ре-рендер
          if (parallaxRef1.current) parallaxRef1.current.style.transform = `translateY(${currentScroll * 0.4}px)`;
          if (parallaxRef2.current) parallaxRef2.current.style.transform = `translateY(${currentScroll * 0.2}px)`;
          if (parallaxRef3.current) parallaxRef3.current.style.transform = `translateY(${currentScroll * 0.6}px)`;

          const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
          let progress = Math.max(0, Math.min(1, currentScroll / maxScroll));
          const numSegments = colorPairs.length - 1;
          let segment = Math.min(Math.floor(progress * numSegments), numSegments - 1);
          const localProgress = (progress * numSegments) - segment;

          const c1 = `${interpolate(colorPairs[segment].c1[0], colorPairs[segment + 1].c1[0], localProgress)}, ${interpolate(colorPairs[segment].c1[1], colorPairs[segment + 1].c1[1], localProgress)}, ${interpolate(colorPairs[segment].c1[2], colorPairs[segment + 1].c1[2], localProgress)}`;
          const c2 = `${interpolate(colorPairs[segment].c2[0], colorPairs[segment + 1].c2[0], localProgress)}, ${interpolate(colorPairs[segment].c2[1], colorPairs[segment + 1].c2[1], localProgress)}, ${interpolate(colorPairs[segment].c2[2], colorPairs[segment + 1].c2[2], localProgress)}`;

          // CSS-переменные цветов: прямое обновление DOM, минуя React ре-рендер
          if (rootRef.current) {
            rootRef.current.style.setProperty('--orb-color-1-rgb', c1);
            rootRef.current.style.setProperty('--orb-color-2-rgb', c2);
            rootRef.current.style.setProperty('--orb-color-1', `rgb(${c1})`);
            rootRef.current.style.setProperty('--orb-color-2', `rgb(${c2})`);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!document.getElementById('clash-display-font')) {
      const link = document.createElement('link');
      link.id = 'clash-display-font';
      link.href = 'https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=cabinet-grotesk@800,500,700,400&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (!document.getElementById('dm-sans-font')) {
      const link2 = document.createElement('link');
      link2.id = 'dm-sans-font';
      link2.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap';
      link2.rel = 'stylesheet';
      document.head.appendChild(link2);
    }
  }, []);

  return (
    <Box
      ref={rootRef}
      sx={{
        position: 'relative', minHeight: '100vh', color: 'white', overflowX: 'hidden',
        backgroundColor: COLORS.bgPrimary,
        fontFamily: "'DM Sans', sans-serif",
        '--font-body': "'DM Sans', sans-serif",
        '--font-heading': "'Cabinet Grotesk', sans-serif",
        '--orb-color-1-rgb': '144, 85, 255',
        '--orb-color-2-rgb': '19, 226, 218',
        '--orb-color-1': 'rgb(144, 85, 255)',
        '--orb-color-2': 'rgb(19, 226, 218)'
      }}
    >
      {/* Слой зернистости — остаётся в CSS (SVG data URL) */}
      <Box className="bg-noise" />

      {/* Анимированный фон с орбами */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box ref={parallaxRef1} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, willChange: 'transform', transition: 'transform 0.1s ease-out' }}>
          <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.55, mixBlendMode: 'screen', width: '65vw', height: '65vw', background: 'var(--orb-color-1)', top: '-15%', left: '-10%', willChange: 'transform', animation: `${floatAnim} 20s ease-in-out infinite alternate` }} />
        </Box>
        <Box ref={parallaxRef2} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, willChange: 'transform', transition: 'transform 0.1s ease-out' }}>
          <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.45, mixBlendMode: 'screen', width: '60vw', height: '60vw', background: 'var(--orb-color-2)', bottom: '-20%', right: '-15%', willChange: 'transform', animation: `${floatAnim} 24s ease-in-out infinite alternate-reverse` }} />
        </Box>
        <Box ref={parallaxRef3} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, willChange: 'transform', transition: 'transform 0.1s ease-out' }}>
          <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.55, mixBlendMode: 'screen', width: '50vw', height: '50vw', background: 'rgba(255, 255, 255, 0.08)', top: '30%', left: '30%', willChange: 'transform', animation: `${floatAnim} 28s linear infinite` }} />
        </Box>
      </Box>

      {/* Основной контент */}
      <Box sx={{ position: 'relative', zIndex: 10, maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3, md: 5, lg: 8 } }}>

        {/* СЕКЦИЯ 1: HERO */}
        <Box component="section" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', pt: 3, pb: { xs: 8, sm: 16 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: { xs: 4, sm: 8 }, mt: { xs: 7, md: 10 } }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20, maxWidth: '900px', mx: 'auto' }}>
              <Reveal delay={400}>
                <Typography component="h1" sx={{ fontSize: { xs: '1.875rem', sm: '3rem', md: '4.5rem' }, fontWeight: 600, mb: { xs: 2, sm: 3 }, lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
                  Studuj chytřeji s <br />
                  <Box
                    component="span"
                    sx={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: 'linear-gradient(to right, var(--orb-color-1), var(--orb-color-2))', filter: 'drop-shadow(0 0 20px rgba(var(--orb-color-1-rgb), 0.4))' }}
                  >
                    Lapis
                  </Box>
                </Typography>
              </Reveal>

              <Reveal delay={500}>
                <Typography sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, color: 'rgba(255,255,255,0.6)', mb: { xs: 3.5, sm: 5 }, fontWeight: 300, maxWidth: '672px', mx: 'auto', px: { xs: 1, sm: 0 } }}>
                  Tvůj prémiový prostor pro efektivní učení, tvorbu kartiček a sledování pokroku. Vše na jednom místě.
                </Typography>
              </Reveal>

              <Reveal delay={600} direction="up" sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, width: '100%' }}>
                  <MagneticBtn sx={{
                    background: 'linear-gradient(135deg, var(--orb-color-1), var(--orb-color-2))',
                    border: 'none', borderRadius: 100, p: 'clamp(12px,2vw,16px) clamp(20px,4vw,32px)',
                    fontSize: 'clamp(15px,2vw,18px)', fontWeight: 500, color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 1.25,
                    animation: `${pulseGlowAnim} 3s ease-in-out infinite alternate`,
                  }}>
                    Vyzkoušet Lapis <ArrowRight size={18} />
                  </MagneticBtn>
                  <MagneticBtn
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    sx={{
                      background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.12)`,
                      borderRadius: 100, p: 'clamp(12px,2vw,16px) clamp(20px,4vw,32px)',
                      fontSize: 'clamp(15px,2vw,18px)', fontWeight: 500,
                      color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.25,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <Play size={16} /> Jak to funguje
                  </MagneticBtn>
                </Box>
              </Reveal>
            </Box>

          </Box>
        </Box>

        {/* СЕКЦИЯ 1.5: БЫСТРЫЙ ПОИСК */}
        <Box component="section" sx={{ position: 'relative', zIndex: 50, pt: { xs: 6, sm: 12 }, pb: { xs: 8, sm: 12 }, px: 2 }}>
          <Reveal delay={200} direction="up" sx={{ maxWidth: '768px', mx: 'auto', position: 'relative' }}>

            <Box sx={{ textAlign: 'center', mb: { xs: 3.5, sm: 6 } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '9999px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', mb: 2, cursor: 'default' }} className="hover-target">
                <Search size={16} /> Bleskové hledání
              </Box>
              <Typography component="h2" sx={{ fontSize: { xs: '1.875rem', sm: '2.25rem', md: '3rem' }, mb: { xs: 1.5, sm: 2 }, fontFamily: 'var(--font-heading)' }}>Chytré vyhledávání</Typography>
              <Typography sx={{ color: '#9ca3af', fontSize: { xs: '1rem', sm: '1.125rem' } }}>Najdi jakoukoliv kartičku, poznámku nebo kurz rychlostí blesku.</Typography>
            </Box>

            <Box className="hover-target" sx={{ position: 'relative', zIndex: 20, cursor: 'text', filter: 'drop-shadow(0 0 40px rgba(var(--orb-color-1-rgb), 0.2))' }}>
              <Search size={24} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--orb-color-1)' }} />
              <Box
                sx={{
                  width: '100%', bgcolor: 'rgba(15,17,23,0.9)', borderRadius: { xs: '12px', sm: '16px' },
                  py: { xs: 2, sm: 3 }, pl: { xs: 6, sm: 8 }, pr: { xs: 7, sm: 10 },
                  fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'flex', alignItems: 'center',
                  backdropFilter: 'blur(16px)', border: '1px solid rgba(var(--orb-color-1-rgb), 0.5)'
                }}
              >
                <span>bio</span>
                <Box sx={{ width: '2px', height: '24px', ml: 0.5, bgcolor: 'var(--orb-color-1)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              </Box>
            </Box>

            <Box sx={{ mt: 2, bgcolor: 'rgba(15,17,23,0.95)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(16px)' }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, px: 1 }}>Složky a Témata</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box className="hover-target group" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'default' }}>
                        <Folder size={20} style={{ color: 'var(--orb-color-1)' }} />
                        <Typography sx={{ fontWeight: 500, color: 'white' }}>
                          <Box component="span" sx={{ px: 0.5, borderRadius: '4px', color: 'var(--orb-color-1)', bgcolor: 'rgba(var(--orb-color-1-rgb), 0.2)' }}>Bio</Box>logie 101
                        </Typography>
                        <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Kurz</Box>
                      </Box>
                      <Box className="hover-target group" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', cursor: 'default', transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <Folder size={20} style={{ color: '#9ca3af', transition: 'color 0.2s' }} />
                        <Typography sx={{ fontWeight: 500, color: 'white' }}>
                          <Box component="span" sx={{ px: 0.5, borderRadius: '4px', color: 'var(--orb-color-1)', bgcolor: 'rgba(var(--orb-color-1-rgb), 0.2)' }}>Bio</Box>logie — Ekologie
                        </Typography>
                        <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Složka</Box>
                      </Box>
                      <Box className="hover-target group" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', cursor: 'default', transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <Folder size={20} style={{ color: '#9ca3af', transition: 'color 0.2s' }} />
                        <Typography sx={{ fontWeight: 500, color: 'white' }}>
                          <Box component="span" sx={{ px: 0.5, borderRadius: '4px', color: 'var(--orb-color-1)', bgcolor: 'rgba(var(--orb-color-1-rgb), 0.2)' }}>Bio</Box>logie — Vizualizace
                        </Typography>
                        <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Složka</Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, px: 1 }}>Materiály</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box className="hover-target group" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', cursor: 'default', transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <Layers size={20} style={{ color: 'var(--orb-color-2)' }} />
                        <Typography sx={{ fontWeight: 500, color: 'white' }}>
                          Definice: <Box component="span" sx={{ px: 0.5, borderRadius: '4px', color: 'var(--orb-color-2)', bgcolor: 'rgba(var(--orb-color-2-rgb), 0.2)' }}>bio</Box>sféra
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography sx={{ fontSize: '0.75rem', color: 'white' }}>Věda o životě</Typography>
                          <Typography sx={{ fontSize: '10px', color: '#6b7280' }}>Kartička</Typography>
                        </Box>
                      </Box>
                      <Box className="hover-target group" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', cursor: 'default', transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <PenTool size={20} style={{ color: '#facc15' }} />
                        <Typography sx={{ fontWeight: 500, color: 'white' }}>
                          Závěrečný test: <Box component="span" sx={{ color: COLORS.yellow, bgcolor: 'rgba(250,204,21,0.2)', px: 0.5, borderRadius: '4px' }}>Bio</Box>logie buněk
                        </Typography>
                        <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Test</Box>
                      </Box>
                      <Box className="hover-target group" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', cursor: 'default', transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <FileText size={20} style={{ color: '#4ade80' }} />
                        <Typography sx={{ fontWeight: 500, color: 'white' }}>
                          Poznámky k zápočtu (<Box component="span" sx={{ color: COLORS.green, bgcolor: 'rgba(74,222,128,0.2)', px: 0.5, borderRadius: '4px' }}>bio</Box>logie)
                        </Typography>
                        <Box sx={{ ml: 'auto', fontSize: '0.75rem', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>Poznámka</Box>
                      </Box>
                    </Box>
                  </Box>

                </Box>
              </Box>
            </Box>
          </Reveal>
        </Box>

        {/* СЕКЦИЯ 2: АКТИВНОСТЬ */}
        <Box component="section" sx={{ py: { xs: 5, sm: 10 }, position: 'relative', zIndex: 10 }}>
          <Reveal direction="left">
            <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontFamily: 'var(--font-heading)', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Flame style={{ color: 'var(--orb-color-1)', animation: `${streakPulseAnim} 2s ease-in-out infinite` }} />
              Aktivita za 30 dní
            </Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem', mb: { xs: 3, sm: 5 }, ml: 5 }}>Počet zopakovaných karet, testů a napsaných poznámek.</Typography>
          </Reveal>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3 } }}>

            <Box className="hover-target" sx={{ gridColumn: { lg: 'span 2' }, borderRadius: { xs: '16px', sm: '24px' }, p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ...GLASS }}>

              <Box ref={heatmapRef} sx={{ width: '100%', overflowX: 'auto', mb: 3, ...HIDE_SCROLLBAR }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content', mx: 'auto' }}>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '10px', color: '#6b7280', fontWeight: 500, textAlign: 'right', mt: 3 }}>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}>Po</Box>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}></Box>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}>St</Box>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}></Box>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}>Pá</Box>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}></Box>
                      <Box sx={{ height: '16px', lineHeight: '16px' }}>Ne</Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', fontWeight: 500, px: 0.5 }}>
                        <span>Lis</span>
                        <span>Pro</span>
                        <span>Led</span>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {heatmapData.map((col, colIndex) => (
                          <Box key={colIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {col.map((bg, rowIndex) => {
                              const delay = (colIndex * 7 + rowIndex) * 10;
                              return (
                                <Box
                                  key={rowIndex}
                                  sx={{
                                    width: '16px', height: '16px', borderRadius: '2px', transition: 'background-color 0.3s',
                                    backgroundColor: bg === '0' ? 'rgba(255,255,255,0.05)' : `rgba(var(--orb-color-1-rgb), ${bg})`,
                                    ...(heatmapVisible
                                      ? { animation: `${fadeInCellAnim} 0.5s ${delay}ms both` }
                                      : { opacity: 0 }),
                                  }}
                                />
                              );
                            })}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '10px', color: '#6b7280', alignSelf: 'flex-end', mt: 2, mr: 0.5 }}>
                    <span>Méně</span>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                      <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: 'rgba(var(--orb-color-1-rgb), 0.3)' }} />
                      <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: 'rgba(var(--orb-color-1-rgb), 0.6)' }} />
                      <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', bgcolor: 'rgba(var(--orb-color-1-rgb), 1)' }} />
                    </Box>
                    <span>Více</span>
                  </Box>

                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 1, sm: 2 }, pt: { xs: 2, sm: 3 }, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mb: 0.5 }}>Série</Typography>
                  <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'white' }}>
                    <CountUp end={32} />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mb: 0.5 }}>Kartičky</Typography>
                  <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'white' }}>
                    <CountUp end={248} />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mb: 0.5 }}>Testy</Typography>
                  <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'white' }}>
                    <CountUp end={14} />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem', mb: 0.5 }}>Poznámky</Typography>
                  <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'white' }}>
                    <CountUp end={45} />
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Reveal delay={200} direction="up" sx={{ height: '100%' }}>
              <Box className="hover-target group" sx={{ borderRadius: { xs: '16px', sm: '24px' }, p: { xs: 2, sm: 4 }, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', ...GLASS }}>
                <Box sx={{ position: 'absolute', top: '-40px', right: '-40px', width: '192px', height: '192px', filter: 'blur(24px)', borderRadius: '50%', transition: 'all 0.3s', opacity: 0.1, '.group:hover &': { opacity: 0.2 }, backgroundColor: 'var(--orb-color-1)' }} />

                <Typography component="h3" sx={{ fontSize: '1.125rem', fontWeight: 500, color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 10 }}>
                  <Calendar size={20} style={{ color: 'var(--orb-color-1)' }} /> Příští události
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', zIndex: 10 }}>
                  <Box className="group/item" sx={{ display: 'flex', gap: 2, p: 1.5, mx: -1.5, borderRadius: '12px', transition: 'colors 0.3s', cursor: 'pointer', borderLeft: '2px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#ef4444' } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PenTool size={20} style={{ color: COLORS.red }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                        <Typography component="h4" sx={{ fontWeight: 500, color: 'white', fontSize: '0.875rem' }}>Závěrečný test</Typography>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171', bgcolor: 'rgba(248,113,113,0.1)', px: 1, py: 0.25, borderRadius: '4px' }}>Zítra</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Biologie buněk</Typography>
                    </Box>
                  </Box>

                  <Box className="group/item" sx={{ display: 'flex', gap: 2, p: 1.5, mx: -1.5, borderRadius: '12px', transition: 'colors 0.3s', cursor: 'pointer', borderLeft: '2px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#eab308' } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} style={{ color: COLORS.yellow }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                        <Typography component="h4" sx={{ fontWeight: 500, color: 'white', fontSize: '0.875rem' }}>Odevzdání eseje</Typography>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.yellow, bgcolor: 'rgba(250,204,21,0.1)', px: 1, py: 0.25, borderRadius: '4px' }}>Za 3 dny</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Historie Evropy</Typography>
                    </Box>
                  </Box>

                  <Box className="group/item" sx={{ display: 'flex', gap: 2, p: 1.5, mx: -1.5, borderRadius: '12px', transition: 'colors 0.3s', cursor: 'pointer', borderLeft: '2px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#4DB8FF' } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'rgba(77,184,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={20} style={{ color: '#4DB8FF' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                        <Typography component="h4" sx={{ fontWeight: 500, color: 'white', fontSize: '0.875rem' }}>Ústní zkoušení</Typography>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4DB8FF', bgcolor: 'rgba(77,184,255,0.1)', px: 1, py: 0.25, borderRadius: '4px' }}>Příští týden</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>Angličtina B2</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box component="button" sx={{ width: '100%', mt: 'auto', pt: 3, color: '#9ca3af', '&:hover': { color: 'white' }, fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.3s', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer' }}>
                  Otevřít kalendář <ArrowRight size={16} />
                </Box>
              </Box>
            </Reveal>

          </Box>
        </Box>

        {/* СЕКЦИЯ 3: ПРОДОЛЖИТЬ */}
        <Box component="section" sx={{ py: { xs: 5, sm: 10 } }}>
          <Reveal delay={100} direction="up">
            <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontFamily: 'var(--font-heading)', mb: { xs: 3, sm: 5 } }}>Pokračuj tam, kde jsi skončil</Typography>
          </Reveal>

          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2.5 }, overflowX: 'auto', py: 3, my: -3, px: 0.5, ...HIDE_SCROLLBAR }}>
            {[
              { title: "Matematika", clr: "#60a5fa", notes: 12, tests: 2, cards: 145, date: "Dnes, 09:41", icon: "🧮", delay: 0 },
              { title: "Angličtina B2", clr: COLORS.purple, notes: 5, tests: 1, cards: 320, date: "Včera", icon: "🌍", delay: 100 },
              { title: "Fyzika", clr: COLORS.green, notes: 8, tests: 4, cards: 85, date: "Před 2 dny", icon: "⚛️", delay: 200 },
              { title: "Dějepis", clr: COLORS.yellow, notes: 24, tests: 0, cards: 410, date: "Před 3 dny", icon: "📜", delay: 300 },
            ].map((item, idx) => (
              <Reveal key={idx} delay={item.delay} sx={{ width: { xs: '78vw', sm: '55vw', md: 'calc(50% - 12px)', lg: 'calc(33.333% - 16px)' }, flexShrink: 0, minHeight: '200px' }}>
                <HoloCard item={item} />
              </Reveal>
            ))}
          </Box>
        </Box>

        {/* СЕКЦИИ 4 и 5 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: { xs: 4, sm: 6 }, py: { xs: 5, sm: 10 } }}>

          {/* СЕКЦИЯ 4: ЗАДАЧИ */}
          <Box component="section">
            <Reveal direction="right">
              <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontFamily: 'var(--font-heading)', mb: { xs: 3, sm: 4 }, display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
                <Box component="span" sx={{ flex: 1 }}>Na dnes</Box>
                <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 400, bgcolor: 'rgba(255,255,255,0.05)', px: 1.5, py: 0.5, borderRadius: '9999px', color: 'var(--orb-color-1)' }}>
                  {(() => { const n = tasks.filter(t => !t.completed).length; return `${n} ${n === 1 ? 'úkol' : n <= 4 ? 'úkoly' : 'úkolů'}`; })()}
                </Box>
              </Typography>
            </Reveal>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
              {tasks.map((task, idx) => (
                <Box
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="hover-target group"
                  sx={{
                    p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.5s', cursor: 'pointer', borderLeft: '2px solid transparent',
                    ...(task.completed
                      ? { opacity: 0.4, filter: 'grayscale(100%)', transform: 'scale(0.98)' }
                      : { '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#7C6FF7', transform: 'scale(1.01)' }, transform: 'scale(1)', ...GLASS }),
                    animation: `${fadeInUpAnim} 0.4s ease-out both`,
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <Box sx={{ p: 1.5, borderRadius: '8px', transition: 'background-color 0.3s', bgcolor: task.completed ? 'transparent' : 'rgba(255,255,255,0.05)', '.group:hover &': { bgcolor: task.completed ? 'transparent' : 'rgba(255,255,255,0.1)' } }}>
                    {task.icon}
                  </Box>

                  <Box sx={{ fontWeight: 500, transition: 'background-color 0.3s', color: task.completed ? '#6b7280' : 'white' }}>
                    <Box
                      component="span"
                      sx={task.completed ? {
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          height: '1.5px',
                          backgroundColor: 'currentColor',
                          animation: `${strikeAnim} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                        },
                      } : {}}
                    >
                      {task.title}
                    </Box>
                  </Box>

                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    <CheckCircle
                      className={task.completed ? '' : 'group-hover:text-green-400'}
                      sx={{
                        width: 24, height: 24, transition: 'all 0.5s',
                        color: task.completed ? '#22c55e' : '#6b7280',
                        opacity: task.completed ? 1 : 0,
                        transform: task.completed ? 'scale(1.1)' : 'scale(1)',
                        '.group:hover &': { opacity: 1 }
                      }}
                    />
                  </Box>
                </Box>
              ))}

              <Reveal delay={400} direction="up">
                <Box component="button" className="hover-target" sx={{ width: '100%', mt: 1, py: 2, borderRadius: '12px', color: '#9ca3af', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }, transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: 'transparent', border: 'none', cursor: 'pointer' }}>
                  Přidat vlastní úkol +
                </Box>
              </Reveal>
            </Box>
          </Box>

          {/* СЕКЦИЯ 5: БЫСТРЫЕ ДЕЙСТВИЯ */}
          <Box component="section">
            <Reveal direction="left">
              <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontFamily: 'var(--font-heading)', mb: { xs: 3, sm: 4 } }}>Rychlé akce</Typography>
            </Reveal>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: { xs: 1.5, sm: 2 }, minHeight: { xs: '280px', sm: 'calc(100% - 4rem)' } }}>
              <Reveal delay={100} direction="left" sx={{ height: '100%' }}>
                <SpotlightButton glowColor="rgba(124, 111, 247, 0.8)" className="hover-target group" sx={{ '&:hover': { bgcolor: 'rgba(124, 111, 247, 0.05)' }, transition: 'background-color 0.3s' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '.group:hover &': { transform: 'scale(1.1)', bgcolor: 'rgba(124, 111, 247, 0.2)' } }}>
                    <FileText sx={{ color: '#d1d5db', transition: 'color 0.3s', '.group:hover &': { color: '#7C6FF7' } }} />
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>+ Nová poznámka</Typography>
                </SpotlightButton>
              </Reveal>

              <Reveal delay={200} direction="right" sx={{ height: '100%' }}>
                <SpotlightButton glowColor="rgba(77, 184, 255, 0.8)" className="hover-target group" sx={{ '&:hover': { bgcolor: 'rgba(77, 184, 255, 0.05)' }, transition: 'background-color 0.3s' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '.group:hover &': { transform: 'scale(1.1)', bgcolor: 'rgba(77, 184, 255, 0.2)' } }}>
                    <BookOpen sx={{ color: '#d1d5db', transition: 'color 0.3s', '.group:hover &': { color: '#4DB8FF' } }} />
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>+ Nová kartička</Typography>
                </SpotlightButton>
              </Reveal>

              <Reveal delay={300} direction="up" sx={{ height: '100%' }}>
                <SpotlightButton glowColor="rgba(34, 197, 94, 0.8)" className="hover-target group" sx={{ '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.05)' }, transition: 'background-color 0.3s' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '.group:hover &': { transform: 'scale(1.1)', bgcolor: 'rgba(34, 197, 94, 0.2)' } }}>
                    <PenTool sx={{ color: '#d1d5db', transition: 'color 0.3s', '.group:hover &': { color: '#4ade80' } }} />
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>+ Nový test</Typography>
                </SpotlightButton>
              </Reveal>

              <Reveal delay={400} direction="up" sx={{ height: '100%' }}>
                <SpotlightButton glowColor="rgba(255, 255, 255, 0.6)" className="hover-target group" sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }, transition: 'background-color 0.3s' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', '.group:hover &': { transform: 'scale(1.1)' } }}>
                    <Folder sx={{ color: '#d1d5db', transition: 'color 0.3s', '.group:hover &': { color: 'white' } }} />
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>Procházet kurzy</Typography>
                </SpotlightButton>
              </Reveal>
            </Box>
          </Box>

        </Box>

        {/* Footer */}
        <Box component="footer" className="hover-target" sx={{ mt: 5, pt: 4, pb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3, fontSize: '0.875rem', color: '#6b7280', cursor: 'default' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>
              <Box sx={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', bgcolor: '#4ade80', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <Box sx={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: 8, width: 8, bgcolor: '#22c55e' }} />
            </Box>
            <Typography sx={{ fontWeight: 500, color: '#9ca3af' }}>All systems operational</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box component="a" href="#" className="hover-target" sx={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s', '&:hover': { color: 'white' } }}>Podpora</Box>
            <Box component="a" href="#" className="hover-target" sx={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s', '&:hover': { color: 'white' } }}>Twitter (X)</Box>
            <Box component="a" href="#" className="hover-target" sx={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.3s', '&:hover': { color: 'white' } }}>Discord</Box>
          </Box>
          <Typography sx={{ fontWeight: 500 }}>Lapis v.1.0.42</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
