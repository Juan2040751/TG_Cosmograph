import { Box, LinearProgress, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

function ProgressFeedback({ stanceProgress, setStanceProgress, affinityProgress }: {
    stanceProgress: { users: number, progress: number, processing: number, open: boolean, estimatedTime: number, batches: number },
    setStanceProgress: React.Dispatch<React.SetStateAction<{
        users: number, progress: number, processing: number, open: boolean, estimatedTime: number, batches: number
    }>>, affinityProgress: { users: number, progress: number, open: boolean }
}) {
    const [buffer, setBuffer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStanceProgress(prev => {
                if (prev.progress >= prev.users) {
                    clearInterval(interval);
                    return prev;
                }

                const estimatedProgress = prev.progress + Math.ceil((prev.users - prev.processing) / prev.estimatedTime)
                setBuffer((estimatedProgress * 1.25) <= prev.users ? estimatedProgress * 1.5 : prev.users)
                return {
                    ...prev,
                    progress: estimatedProgress,
                };
            });

        }, 1000);
        return () => clearInterval(interval);
    }, [stanceProgress.users, stanceProgress.estimatedTime, setStanceProgress]);

    return (
        <Box>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ backgroundColor: "white", borderRadius: "5px",marginRight: "-14px !important"  }}
                open={affinityProgress.open || stanceProgress.open}>
                <Box sx={{ display: 'flex', flexDirection: "column", justifyContent: 'center', width: "100%", marginInline: "4px" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: "100%" }}>
                        {stanceProgress.open && <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Calculando la creencia de {stanceProgress.users} usuarios
                        </Typography>}
                        {affinityProgress.open && <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Calculando la afinidad entre {affinityProgress.users} usuarios
                        </Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '220px', mr: 1, ml: 1 }}>
                            {stanceProgress.open && <LinearProgress
                                variant="buffer"
                                value={Math.round(100 * stanceProgress.progress / stanceProgress.users)}
                                valueBuffer={Math.round(100 * buffer / stanceProgress.users)}
                            />}
                            {affinityProgress.open && <LinearProgress
                                variant="determinate"
                                value={Math.round(100 * affinityProgress.progress)}
                            />}
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {stanceProgress.open && `${Math.round(100 * stanceProgress.progress / stanceProgress.users)}%`}
                                {affinityProgress.open && `${(100 * affinityProgress.progress).toFixed(1)}%`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

            </Snackbar>
        </Box>
    );
}

export default ProgressFeedback;
