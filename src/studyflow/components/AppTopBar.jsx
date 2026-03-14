
import React, { Fragment } from 'react';
import { Box, Stack, Typography, IconButton, TextField, Paper } from '@mui/material';
import { Menu as MenuIcon, Search, Bell, X, FileText, Layers, CheckSquare, BookOpen } from 'lucide-react';
import { COLORS, fadeInUpAnim, GRADIENT_TEXT } from '../../styles';
import { NotifItem } from './Sidebar';

const searchIcon = (type) => {
    if (type === 'notes') return <FileText size={16} color={COLORS.blue} />;
    if (type === 'cards') return <Layers size={16} color={COLORS.accent} />;
    if (type === 'tests') return <CheckSquare size={16} color={COLORS.green} />;
    return <BookOpen size={16} color={COLORS.orange} />;
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const AppTopBar = ({ sidebarOpen, setSidebarOpen, searchFocused, setSearchFocused, searchQuery, setSearchQuery, filteredItems, handleSearchItemClick, searchInputRef, searchBlurTimerRef, notifOpen, setNotifOpen }) => (
    <Stack component="header" direction="row" alignItems="center" justifyContent="space-between"
        sx={{ height: 56, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(48px)', borderBottom: `1px solid ${COLORS.border}`, px: 2.5, flexShrink: 0, background: COLORS.overlay }}>
        <Stack direction="row" alignItems="center" gap={2}>
            <Stack direction="row" alignItems="center" gap={1.5}>
                <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small"
                    sx={{ color: COLORS.white50, '&:hover': { color: COLORS.textPrimary, bgcolor: COLORS.white05 } }}>
                    <MenuIcon size={18} />
                </IconButton>
                <Typography sx={{ 
                    fontSize: 20, fontFamily: '"Clash Display", sans-serif', fontWeight: 800, 
                    letterSpacing: '-0.025em',
                    color: COLORS.textPrimary,
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.blue} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: { xs: 'none', sm: 'block' } 
                }}>
                    StudyFlow
                </Typography>
            </Stack>
        </Stack>

        <Box sx={{ position: 'relative', display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', flex: 1, maxWidth: 'xl', mx: { xs: 1.5, sm: 3 } }}>
            <Box sx={{ 
                position: 'relative', 
                width: '100%', 
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                maxWidth: searchFocused ? 640 : 440,
                filter: searchFocused ? 'drop-shadow(0 0 20px rgba(124, 111, 247, 0.15))' : 'none'
            }}>
                <TextField
                    inputRef={searchInputRef}
                    placeholder="Hledat poznámky, kartičky, kurzy..."
                    size="small"
                    fullWidth
                    value={searchQuery}
                    onFocus={() => {
                        clearTimeout(searchBlurTimerRef.current);
                        setSearchFocused(true);
                    }}
                    onBlur={() => {
                        clearTimeout(searchBlurTimerRef.current);
                        searchBlurTimerRef.current = setTimeout(() => setSearchFocused(false), 200);
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <Box sx={{ mr: 1.5, display: 'flex', color: searchFocused ? COLORS.accent : COLORS.textMuted, transition: 'color 0.3s' }}>
                                <Search size={17} />
                            </Box>
                        ),
                        endAdornment: !searchQuery && (
                            <Typography component="kbd" sx={{ 
                                fontSize: 10, px: 0.8, py: 0.3, borderRadius: 1.5, 
                                fontFamily: 'monospace', fontWeight: 700,
                                bgcolor: COLORS.white05, border: `1px solid ${COLORS.white10}`, 
                                color: COLORS.textMuted, opacity: searchFocused ? 0 : 0.8,
                                transition: 'opacity 0.2s',
                                userSelect: 'none', pointerEvents: 'none'
                            }}>⌘K</Typography>
                        )
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '14px', py: 0.4, px: 2, fontSize: 13, color: COLORS.textPrimary,
                            background: COLORS.bgTertiary,
                            transition: 'all 0.3s',
                            '& fieldset': {
                                borderColor: searchFocused ? `${COLORS.accent}66` : COLORS.border,
                            },
                            '&:hover fieldset': { borderColor: searchFocused ? `${COLORS.accent}80` : COLORS.white20 },
                        },
                        '& input::placeholder': { color: COLORS.textMuted, opacity: 0.7 },
                    }}
                />
            </Box>

            {searchFocused && (
                <Paper elevation={12} sx={{ 
                    position: 'absolute', top: 52, width: '100%', maxWidth: 640, borderRadius: 4, 
                    overflow: 'hidden', zIndex: 101, animation: `${fadeInUpAnim} 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards`, 
                    background: COLORS.bgSecondary, border: `1px solid ${COLORS.border}`,
                    boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 20px ${COLORS.accent}15`
                }}>
                    {filteredItems.length === 0 ? (
                        <Typography sx={{ p: 2, fontSize: 13, color: COLORS.textDim, textAlign: 'center' }}>
                            {searchQuery.trim() ? `Žádné výsledky pro „${searchQuery}"` : 'Začni psát pro vyhledání'}
                        </Typography>
                    ) : (
                        <>
                            {!searchQuery.trim() && (
                                <Typography sx={{ px: 1.5, py: 0.75, fontSize: 11, fontWeight: 500, color: COLORS.textDim, borderBottom: `1px solid ${COLORS.white05}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Návrhy</Typography>
                            )}
                            {['courses', 'notes', 'cards', 'tests'].map(type => {
                                const items = filteredItems.filter(i => i.type === type);
                                if (!items.length) return null;
                                const labels = { notes: '📄 Témata', cards: '🃏 Kartičky', tests: '✅ Testy', courses: '📚 Kurzy' };
                                return (
                                    <Fragment key={type}>
                                        {searchQuery.trim() && (
                                            <Typography sx={{ px: 1.5, py: 0.75, fontSize: 11, fontWeight: 500, color: COLORS.textDim, borderBottom: `1px solid ${COLORS.white05}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{labels[type]}</Typography>
                                        )}
                                        {items.map((item, idx) => {
                                            const highlight = (text, query) => {
                                                if (!query || !text) return text;
                                                const safeQuery = escapeRegExp(query);
                                                const parts = String(text).split(new RegExp(`(${safeQuery})`, 'gi'));
                                                return parts.map((p, j) => p.toLowerCase() === query.toLowerCase() 
                                                    ? <Box key={j} component="span" sx={{ color: COLORS.primary, fontWeight: 800, background: `${COLORS.primary}26`, px: '2px', borderRadius: '1.5px' }}>{p}</Box> 
                                                    : p
                                                );
                                            };
                                            return (
                                                <Stack key={idx} direction="row" alignItems="center" gap={1.5}
                                                    onClick={() => handleSearchItemClick(item)}
                                                    sx={{ px: 1.5, py: 1, cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: COLORS.actionHover } }}>
                                                    {searchIcon(item.type)}
                                                    <Box>
                                                        <Typography sx={{ fontSize: 13, color: COLORS.textPrimary }}>{highlight(item.label, searchQuery)}</Typography>
                                                        {item.subtitle && <Typography sx={{ fontSize: 11, color: COLORS.textDim }}>{highlight(item.subtitle, searchQuery)}</Typography>}
                                                        {item.searchText && item.searchText.toLowerCase().includes(searchQuery.toLowerCase()) && !item.label.toLowerCase().includes(searchQuery.toLowerCase()) && (
                                                            <Typography sx={{ fontSize: 9, color: COLORS.green, mt: 0.25, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                ✓ v obsahu
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            );
                                        })}
                                    </Fragment>
                                );
                            })}
                        </>
                    )}
                </Paper>
            )}
        </Box>

        {/* Right side */}
        <Stack direction="row" alignItems="center" gap={1}>
            <IconButton 
                onClick={() => {
                    setSearchFocused(true);
                    setTimeout(() => searchInputRef.current?.focus(), 10);
                }}
                sx={{ display: { md: 'none' }, color: COLORS.white50, '&:hover': { color: COLORS.textPrimary, bgcolor: COLORS.white05 } }}
            >
                <Search size={18} />
            </IconButton>
            <Box sx={{ position: 'relative' }}>
                <IconButton onClick={() => setNotifOpen(!notifOpen)}
                    sx={{ color: COLORS.white50, '&:hover': { color: COLORS.textPrimary, bgcolor: COLORS.white05 } }}>
                    <Bell size={18} />
                    <Box sx={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, bgcolor: COLORS.red, borderRadius: '50%', border: `2px solid ${COLORS.bgPrimary}` }} />
                </IconButton>
                {notifOpen && (
                    <Paper elevation={8} sx={{ 
                        position: 'absolute', right: 0, top: 44, width: 320, maxWidth: 'calc(100vw - 1rem)', 
                        borderRadius: 3, overflow: 'hidden', zIndex: 102, 
                        animation: `${fadeInUpAnim} 0.3s ease-out forwards`, 
                        background: COLORS.bgSecondary, border: `1px solid ${COLORS.border}` 
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${COLORS.white05}` }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>Oznámení</Typography>
                            <IconButton size="small" onClick={() => setNotifOpen(false)} sx={{ color: COLORS.textDim, '&:hover': { color: COLORS.textPrimary } }}><X size={14} /></IconButton>
                        </Stack>
                        <NotifItem color={COLORS.blue} title="Nový test k dispozici" sub="Lineární algebra · před 2h" />
                        <NotifItem color={COLORS.green} title="Série 30 dní! 🎉" sub="Gratulujeme! · před 1d" />
                        <NotifItem color={COLORS.orange} title="5 kartiček expiruje" sub="Dějepis · před 3d" isLast />
                    </Paper>
                )}
            </Box>
        </Stack>
    </Stack>
);
