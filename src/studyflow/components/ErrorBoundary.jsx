import { Component } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { COLORS } from '../../styles';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, p: 4 }}>
                    <Stack alignItems="center" gap={2} sx={{ maxWidth: 380, textAlign: 'center' }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: `${COLORS.orange}15`, border: `1px solid ${COLORS.orange}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={24} color={COLORS.orange} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Něco se pokazilo</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, lineHeight: 1.6 }}>
                            {this.state.error?.message || 'Neočekávaná chyba v komponentě.'}
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshCw size={14} />}
                            onClick={() => this.setState({ hasError: false, error: null })}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: COLORS.white10, color: COLORS.textSecondary, '&:hover': { borderColor: COLORS.white25, color: COLORS.textPrimary } }}
                        >
                            Zkusit znovu
                        </Button>
                    </Stack>
                </Box>
            );
        }
        return this.props.children;
    }
}
