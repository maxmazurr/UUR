
import React, { Fragment } from 'react';
import { Box, Stack, Typography, Button, IconButton, LinearProgress, TextField, Paper } from '@mui/material';
import { Home, FileText, Layers, CheckSquare, BarChart2, Calendar, Settings, HelpCircle, Plus, Upload, Download, Flame } from 'lucide-react';
import { COLORS } from '../../styles';
import { NavItem, TreeItem } from './Sidebar';

export const AppSidebar = ({ sidebarOpen, setSidebarOpen, activeNav, setActiveNav, setOpenTopic, courses, cards, _events, topicStats, currentDone, TOTAL_DAILY, dailyPercent, handleRenameCourse, handleDeleteCourse, handleRenameTopic, handleDeleteTopic, handleMoveTopic, exportData, importData }) => (
        <Fragment>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <Box onClick={() => setSidebarOpen(false)}
                    sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 190, backdropFilter: 'blur(4px)', transition: 'opacity 0.3s', display: { md: 'none' } }} />
            )}

            <Box component="aside"
                sx={{
                    position: { xs: 'fixed', md: 'sticky' }, top: 0, left: 0, alignSelf: { md: 'flex-start' },
                    height: { xs: '100%', md: '100vh' }, display: 'flex', flexDirection: 'column',
                    borderRight: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s', zIndex: 200, flexShrink: 0,
                    backdropFilter: 'blur(48px)', background: 'rgba(22,27,39,0.85)',
                    width: sidebarOpen ? 260 : { xs: 260, md: 68 },
                    transform: sidebarOpen ? 'translateX(0)' : { xs: 'translateX(-100%)', md: 'translateX(0)' },
                }}>

                {/* Profile area */}
                <Stack sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 1.5, overflow: 'hidden', flexShrink: 0, transition: 'all 0.3s', ...(!sidebarOpen && { alignItems: 'center', justifyContent: 'center' }) }}>
                    <Stack direction="row" alignItems="center" sx={{ gap: sidebarOpen ? 1.5 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, background: 'linear-gradient(135deg, #9055FF, #13E2DA)', color: 'white', flexShrink: 0, boxShadow: '0 4px 16px rgba(144,85,255,0.35)' }}>
                            JN
                        </Box>
                        {sidebarOpen && (
                            <Stack sx={{ whiteSpace: 'nowrap', minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: 13, color: 'white' }}>Jan Novák</Typography>
                                <Stack direction="row" alignItems="center" gap={0.5} mt={0.25}>
                                    <Flame size={11} sx={{ color: COLORS.orange }} />
                                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>32 dní v řadě</Typography>
                                </Stack>
                            </Stack>
                        )}
                    </Stack>
                    {sidebarOpen && (
                        <Box sx={{ width: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Dnešní cíl</Typography>
                                <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{currentDone}/{TOTAL_DAILY}</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={dailyPercent}
                                sx={{ height: 5, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { borderRadius: 99, background: 'linear-gradient(90deg, #9055FF, #13E2DA)', transition: 'all 0.7s' } }} />
                        </Box>
                    )}
                </Stack>

                {/* Nav items */}
                <Box component="nav" sx={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: 1.5, px: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <NavItem icon={<Home size={19} />} label="Dashboard" active={activeNav === 'Dashboard'} open={sidebarOpen} onClick={() => { setOpenTopic(null); setActiveNav('Dashboard'); }} />
                    <NavItem icon={<FileText size={19} />} label="Poznámky" active={activeNav === 'Poznámky'} open={sidebarOpen} onClick={() => { setOpenTopic(null); setActiveNav('Poznámky'); }} />
                    <NavItem icon={<Layers size={19} />} label="Kartičky" badge={cards.filter(c => c.type === 'flashcard').length || null} active={activeNav === 'Kartičky'} open={sidebarOpen} onClick={() => { setOpenTopic(null); setActiveNav('Kartičky'); }} />
                    <NavItem icon={<CheckSquare size={19} />} label="Testy" badge={cards.filter(c => c.type === 'test').length || null} active={activeNav === 'Testy'} open={sidebarOpen} onClick={() => { setOpenTopic(null); setActiveNav('Testy'); }} />
                    <NavItem icon={<BarChart2 size={19} />} label="Statistiky" active={activeNav === 'Statistiky'} open={sidebarOpen} onClick={() => setActiveNav('Statistiky')} />
                    <NavItem icon={<Calendar size={19} />} label="Plánovač" active={activeNav === 'Plánovač'} open={sidebarOpen} onClick={() => setActiveNav('Plánovač')} />

                    <Box sx={{ my: 1, borderTop: '1px solid rgba(255,255,255,0.05)', mx: 1 }} />

                    <NavItem icon={<Settings size={19} />} label="Nastavení" active={activeNav === 'Nastavení'} open={sidebarOpen} onClick={() => setActiveNav('Nastavení')} />
                    <NavItem icon={<HelpCircle size={19} />} label="O aplikaci" active={activeNav === 'O aplikaci'} open={sidebarOpen} onClick={() => setActiveNav('O aplikaci')} />

                    {/* Courses tree */}
                    {sidebarOpen && (
                        <Box sx={{ mt: 2, px: 0.5 }}>
                            <Box sx={{ height: '1px', width: '100%', mb: 2, mx: 0.5, background: 'linear-gradient(90deg, transparent, rgba(124,111,247,0.25), transparent)' }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} px={1}>
                                <Typography sx={{ fontSize: 12, fontFamily: '"Clash Display", sans-serif', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Moje kurzy</Typography>
                                <IconButton size="small" onClick={() => setActiveNav('Poznámky')}
                                    sx={{ width: 24, height: 24, borderRadius: 2, color: 'rgba(255,255,255,0.35)', '&:hover': { color: COLORS.accent, bgcolor: 'rgba(124,111,247,0.1)', boxShadow: '0 0 10px rgba(124,111,247,0.3)' } }}>
                                    <Plus size={14} />
                                </IconButton>
                            </Stack>
                            <Stack gap={0.5}>
                                {courses.map(c => (
                                    <TreeItem key={c.id} title={c.name} color={c.color} courseId={c.id} topics={c.topics || []}
                                        topicStats={topicStats}
                                        onClick={() => { setOpenTopic(null); setActiveNav('Poznámky'); }}
                                        onTopicClick={(topic) => setOpenTopic({ courseId: c.id, course: c, topic })}
                                        onRenameCourse={handleRenameCourse}
                                        onDeleteCourse={handleDeleteCourse}
                                        // onAddTopic={() => handleAddTopicFromTree(c.id)}
                                        onRenameTopic={handleRenameTopic}
                                        onDeleteTopic={handleDeleteTopic}
                                        onMoveTopic={handleMoveTopic} />
                                ))}
                            </Stack>

                            <Box sx={{ my: 3, borderTop: '1px solid rgba(255,255,255,0.05)', mx: 1 }} />
                            
                            <Stack gap={1} px={1} mb={2}>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Správa dat</Typography>
                                <Button 
                                    size="small" 
                                    startIcon={<Download size={14} />} 
                                    onClick={exportData}
                                    sx={{ 
                                        justifyContent: 'flex-start', color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontSize: 12, 
                                        '&:hover': { color: COLORS.primary, background: 'rgba(144,85,255,0.05)' } 
                                    }}
                                >
                                    Exportovat data
                                </Button>
                                <Button 
                                    size="small" 
                                    component="label"
                                    startIcon={<Upload size={14} />}
                                    sx={{ 
                                        justifyContent: 'flex-start', color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontSize: 12,
                                        '&:hover': { color: COLORS.green, background: 'rgba(74,222,128,0.05)' } 
                                    }}
                                >
                                    Importovat data
                                    <input
                                        type="file"
                                        hidden
                                        accept=".json"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) importData(e.target.files[0]);
                                        }}
                                    />
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Box>
        </Fragment>
);
