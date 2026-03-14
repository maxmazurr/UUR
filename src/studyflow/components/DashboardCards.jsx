
import { Box, Stack, Typography, Button, Chip } from '@mui/material';
import { Play, FileText, Layers, CheckSquare, ArrowRight, Flame, Lightbulb, Frown, Smile } from 'lucide-react';
import { COLORS, GRADIENT_TEXT, bounceAnim } from '../../styles';
import { FadeUp } from './SharedUI';

export const HeroCard = ({ TOTAL_DAILY, currentDone, setZenCards, setShowZen, setOpenTopic, setActiveNav }) => (
    <Box component="section" sx={{
        position: 'relative', overflow: 'hidden', border: `1px solid ${COLORS.border}`,
        borderRadius: { xs: 4, sm: 6 }, p: { xs: '20px', sm: '28px', lg: '40px' },
        display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between', gap: { xs: '20px', sm: '32px' }, background: COLORS.bgSecondary,
    }}>
        <Box sx={{
            position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', opacity: 0.3, pointerEvents: 'none',
            background: `radial-gradient(circle at 80% 0%, ${COLORS.accent}33 0%, transparent 60%), radial-gradient(circle at 20% 100%, ${COLORS.blue}26 0%, transparent 60%)`,
        }} />

        <Stack sx={{ position: 'relative', zIndex: 10, gap: '12px', maxWidth: 'xl' }}>
            <FadeUp delay={50}>
                <Typography variant="h1" sx={{
                    fontSize: { xs: '1.5rem', sm: '1.875rem', lg: '2.75rem' }, fontFamily: '"Clash Display", sans-serif',
                    fontWeight: 700, mb: 1, letterSpacing: '-0.025em', lineHeight: 1.15, color: COLORS.textPrimary,
                }}>
                    Ahoj Jane! <Typography component="span" sx={{ display: 'inline-block', animation: `${bounceAnim} 2s infinite` }}>👋</Typography><br />
                    <Typography component="span" sx={GRADIENT_TEXT(COLORS.accent, COLORS.blue)}>Dnes jsi v ráži.</Typography>
                </Typography>
            </FadeUp>
            <FadeUp delay={100}>
                <Typography sx={{ fontSize: '0.95rem', color: COLORS.textSecondary, lineHeight: 1.5, opacity: 0.9 }}>
                    Zbývá ti <Typography component="span" sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>{TOTAL_DAILY - currentDone} karet</Typography> a <Typography component="span" sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>2 testy</Typography>.
                </Typography>
            </FadeUp>
        </Stack>

        <FadeUp delay={150} sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0, width: { xs: '100%', md: 'auto' }, minWidth: { md: 240 } }}>
            <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.accent, fontWeight: 700, mb: 0.5, pl: 0.5 }}>Rychlé akce</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(2, 1fr)' }, gap: { xs: 1, sm: 1.5 } }}>
                {[
                    { icon: <Play size={14} style={{ fill: 'currentColor' }} />, label: 'Opakování', accent: COLORS.accent, action: () => { setZenCards(null); setShowZen(true); } },
                    { icon: <FileText size={14} />, label: 'Poznámka', accent: COLORS.blue, action: () => { setOpenTopic(null); setActiveNav('Poznámky'); } },
                    { icon: <Layers size={14} />, label: 'Kartička', accent: COLORS.green, action: () => { setOpenTopic(null); setActiveNav('Kartičky'); } },
                    { icon: <CheckSquare size={14} />, label: 'Nový test', accent: COLORS.orange, action: () => { setOpenTopic(null); setActiveNav('Testy'); } },
                ].map((a, i) => (
                    <Button key={i} onClick={a.action} sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2, py: 1.5,
                        borderRadius: 4, fontSize: '13px', fontWeight: 700, textTransform: 'none',
                        transition: 'all 0.2s', '&:hover': { transform: 'scale(1.03)', background: `${a.accent}25` }, '&:active': { transform: 'scale(0.98)' },
                        background: `${a.accent}15`, color: a.accent, border: `1px solid ${a.accent}30`, boxShadow: `0 4px 15px ${a.accent}15`,
                    }}>
                        {a.icon} {a.label}
                    </Button>
                ))}
            </Box>
        </FadeUp>
    </Box>
);

export const StatCards = ({ TOTAL_DAILY, currentDone, dailyPercent, tipFlipped, setTipFlipped, tipStatus, setTipStatus }) => (
    <Box component="section" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: '20px' } }}>

        {/* Combined Goal & Streak Widget */}
        <FadeUp delay={80} sx={{
            gridColumn: { sm: 'span 2' },
            border: `1px solid ${COLORS.border}`, borderRadius: 4, 
            background: COLORS.bgSecondary, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            transition: 'all 0.3s',
            '&:hover': { borderColor: COLORS.borderLight, transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' },
        }}>
            {/* Subtle background decoration */}
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', opacity: 0.03, pointerEvents: 'none', background: `radial-gradient(circle at 100% 0%, ${COLORS.orange}, transparent)` }} />
            
            {/* Left Section: Daily Goal */}
            <Stack sx={{ p: { xs: 2.5, sm: 3 }, flex: 1, borderRight: { md: `1px solid ${COLORS.white05}` }, alignItems: 'center', position: 'relative' }}>
                <Typography sx={{ alignSelf: 'flex-start', fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', mb: 3 }}>Dnešní cíl</Typography>
                
                <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                    <Box component="svg" viewBox="0 0 36 36" sx={{ display: 'block', mx: 'auto', width: '100%', height: '100%' }}>
                        <path fill="none" stroke={COLORS.bgTertiary} strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path fill="none" strokeWidth="3" strokeLinecap="round" stroke="url(#goalGradLarge)" strokeDasharray={`${dailyPercent}, 100`} style={{ transition: 'stroke-dasharray 0.8s ease' }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <defs><linearGradient id="goalGradLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={COLORS.accent} /><stop offset="100%" stopColor={COLORS.green} />
                        </linearGradient></defs>
                    </Box>
                    <Stack sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '2.25rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 800, lineHeight: 1, color: '#fff' }}>
                            {currentDone}<Typography component="span" sx={{ color: COLORS.white50, fontSize: '0.95rem', fontWeight: 600 }}>/{TOTAL_DAILY}</Typography>
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: COLORS.white80, mt: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>kartiček</Typography>
                    </Stack>
                </Box>

                <Stack direction="row" sx={{
                    width: '100%', mt: 3, borderRadius: 3, px: 2, py: 1.5,
                    justifyContent: 'space-between', alignItems: 'center',
                    background: COLORS.overlayDark, border: `1px solid ${COLORS.white05}`,
                }}>
                    <Typography sx={{ fontSize: '13px', color: COLORS.textSecondary }}>Zbývá ti <Typography component="strong" sx={{ color: COLORS.accent, fontWeight: 700 }}>{TOTAL_DAILY - currentDone}</Typography></Typography>
                    <ArrowRight size={16} color={COLORS.accent} />
                </Stack>
            </Stack>

            {/* Right Section: Streak & Week History */}
            <Stack sx={{ p: { xs: 2.5, sm: 3 }, flex: { md: 1.4 }, justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.01)' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Flame size={20} color={COLORS.orange} />
                            <Typography sx={{ fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Tvá série</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '3.5rem', fontFamily: '"Clash Display", sans-serif', fontWeight: 800, color: '#fff', lineHeight: 1, mb: 1 }}>
                            32 <Typography component="span" sx={{ fontSize: '1.5rem', color: COLORS.white50, fontWeight: 600 }}>dní</Typography>
                        </Typography>
                    </Box>
                    <Chip label="Rekord: 45 dní" size="small" sx={{ 
                        fontSize: '11px', fontWeight: 700, background: `${COLORS.orange}1a`, color: COLORS.orange, 
                        border: `1px solid ${COLORS.orange}33`, height: 26, borderRadius: 2
                    }} />
                </Stack>

                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${COLORS.white05}` }}>
                    <Typography sx={{ fontSize: '13px', color: COLORS.white70, mb: 2.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aktivita tento týden</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 1.5, sm: 2 } }}>
                        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d, i) => (
                            <Stack key={i} sx={{ alignItems: 'center', gap: 1.5 }}>
                                <Typography sx={{ fontSize: '11px', color: COLORS.white60, fontWeight: 800 }}>{d}</Typography>
                                <Box sx={{
                                    width: '100%', aspectRatio: '1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    minHeight: 38,
                                    ...(i < 4
                                        ? { background: `linear-gradient(135deg, ${COLORS.green}33, ${COLORS.green}1a)`, border: `1px solid ${COLORS.green}4d`, color: COLORS.green }
                                        : i === 4
                                            ? { background: `linear-gradient(135deg, ${COLORS.orange}33, ${COLORS.orange}1a)`, border: `1px solid ${COLORS.orange}4d`, color: COLORS.orange }
                                            : { background: COLORS.white02, border: `1px solid ${COLORS.white05}`, color: COLORS.textMuted }
                                    ),
                                    '&:hover': { transform: 'scale(1.1)', filter: 'brightness(1.2)' }
                                }}>
                                    {i < 4 ? <CheckSquare size={16} /> : i === 4 ? <Flame size={16} /> : null}
                                </Box>
                            </Stack>
                        ))}
                    </Box>
                </Box>
            </Stack>
        </FadeUp>

        {/* Tip of the day (flip) */}
        <FadeUp delay={200} sx={{ position: 'relative', height: '100%', minHeight: { xs: 250, sm: 280 }, perspective: '1000px' }}>
            <Box sx={{ width: '100%', height: '100%' }}
                onClick={() => {
                    if (!tipFlipped && !tipStatus) setTipFlipped(true);
                }}>
                <Box sx={{ transition: 'transform 0.6s', transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%', transform: tipFlipped ? 'rotateY(180deg)' : 'none' }}>
                    <Stack sx={{
                        border: '1px solid', borderRadius: 4, p: '20px', transition: 'all 0.7s',
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        ...(!tipStatus ? { cursor: 'pointer', '&:hover': { borderColor: COLORS.white10 } } : {}),
                        ...(tipStatus === 'success'
                            ? { background: `${COLORS.green}1a`, borderColor: `${COLORS.green}66`, boxShadow: `0 0 30px ${COLORS.green}26` }
                            : tipStatus === 'fail'
                                ? { background: `${COLORS.red}1a`, borderColor: `${COLORS.red}66`, boxShadow: `0 0 30px ${COLORS.red}26` }
                                : { background: `linear-gradient(135deg, ${COLORS.bgSecondary}, ${COLORS.bgTertiary})`, borderColor: COLORS.borderSubtle }
                        ),
                    }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: COLORS.blue, fontSize: '0.75rem', fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Lightbulb size={14} sx={{ color: tipStatus === 'success' ? COLORS.green : tipStatus === 'fail' ? COLORS.red : undefined }} />
                            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit' }}>
                                {tipStatus === 'success' ? 'Skvělá práce!' : tipStatus === 'fail' ? 'Nevadí, příště to půjde!' : 'Tip dne'}
                            </Typography>
                        </Stack>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 1 }}>
                            <Typography sx={{
                                fontFamily: '"Clash Display", sans-serif', fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4,
                                transition: 'color 0.5s',
                                color: tipStatus === 'success' ? COLORS.green : tipStatus === 'fail' ? COLORS.red : COLORS.textPrimary,
                            }}>
                                {tipStatus ? 'Tenhle tip už máš zmáknutý.' : 'Co je to derivace funkce?'}
                            </Typography>
                        </Box>
                        <Typography sx={{
                            textAlign: 'center', fontSize: '11px', mt: 1.5, py: 1, borderRadius: 2, transition: 'color 0.5s, background 0.5s',
                            background: tipStatus === 'success' ? `${COLORS.green}26` : tipStatus === 'fail' ? `${COLORS.red}26` : COLORS.glassBgLight,
                            color: tipStatus === 'success' ? COLORS.green : tipStatus === 'fail' ? COLORS.red : COLORS.textMuted,
                        }}>
                            {tipStatus ? 'Dokončeno ✓' : 'Klikni pro zobrazení odpovědi'}
                        </Typography>
                    </Stack>
                    <Stack sx={{
                        border: `1px solid ${COLORS.accent}40`, borderRadius: 4, p: '20px', justifyContent: 'space-between',
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                        background: `linear-gradient(135deg, ${COLORS.bgElevated}, ${COLORS.bgPrimary})`,
                    }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: COLORS.blue, fontSize: '0.75rem', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Lightbulb size={14} /> <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit' }}>Odpověď</Typography></Stack>
                        <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.625, px: 0.5, color: COLORS.textSecondary }}>
                            Derivace udává okamžitou rychlost změny funkce. Geometricky odpovídá směrnici tečny ke grafu funkce v daném bodě.
                        </Typography>
                        <Stack direction="row" sx={{ gap: 1, mt: 1.5 }}>
                            <Button sx={{
                                flex: 1, py: 1, borderRadius: 3, fontSize: '0.75rem', fontWeight: 500, textTransform: 'none',
                                display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center',
                                transition: 'all 0.2s', '&:hover': { transform: 'scale(1.03)', background: `${COLORS.red}26` }, '&:active': { transform: 'scale(0.97)' },
                                background: `${COLORS.red}1a`, color: COLORS.red, border: `1px solid ${COLORS.red}40`,
                            }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTipStatus('fail');
                                    setTimeout(() => setTipFlipped(false), 150);
                                }}>
                                <Frown size={13} /> Nevím
                            </Button>
                            <Button sx={{
                                flex: 1, py: 1, borderRadius: 3, fontSize: '0.75rem', fontWeight: 500, textTransform: 'none',
                                display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center',
                                transition: 'all 0.2s', '&:hover': { transform: 'scale(1.03)', background: `${COLORS.green}26` }, '&:active': { transform: 'scale(0.97)' },
                                background: `${COLORS.green}1a`, color: COLORS.green, border: `1px solid ${COLORS.green}40`,
                            }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTipStatus('success');
                                    setTimeout(() => setTipFlipped(false), 150);
                                }}>
                                <Smile size={13} /> Znám
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Box>
        </FadeUp>
    </Box>
);
