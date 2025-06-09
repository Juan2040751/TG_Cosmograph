import { Box, LinearProgress, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

function ProgressFeedback({ stanceProgress, setStanceProgress, affinityProgress, progressFeedback, influenceProgress }: {
    stanceProgress: { users: number, progress: number, processing: number, open: boolean, estimatedTime: number, batches: number },
    setStanceProgress: React.Dispatch<React.SetStateAction<{
        users: number, progress: number, processing: number, open: boolean, estimatedTime: number, batches: number
    }>>, affinityProgress: { users: number, progress: number, open: boolean, buffer: number },
    progressFeedback: { message: string, open: boolean }, influenceProgress: { progress: number, open: boolean, message: string }
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
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ backgroundColor: "white", borderRadius: "5px", marginRight: "-14px !important" }}
                open={affinityProgress.open || stanceProgress.open || progressFeedback.open || influenceProgress.open}>
                <Box sx={{ display: 'flex', flexDirection: "column", justifyContent: 'center', width: "100%", marginInline: "4px" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: "100%" }}>
                        {stanceProgress.open && <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Calculando la creencia de {stanceProgress.users} usuarios
                        </Typography>}
                        {affinityProgress.open && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {affinityProgress.progress !== 0
                                    ? `Calculando la afinidad entre ${affinityProgress.users} usuarios`
                                    : 'Generando representaciones vectoriales de las opiniones'}
                            </Typography>
                        )}
                        {progressFeedback.open && <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {progressFeedback.message}
                        </Typography>}
                        {influenceProgress.open && <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {influenceProgress.message}
                        </Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', margin: 1 }}>
                            {stanceProgress.open && <LinearProgress
                                variant="buffer"
                                value={Math.round(100 * stanceProgress.progress / stanceProgress.users)}
                                valueBuffer={Math.round(100 * buffer / stanceProgress.users)}
                                sx={{ minWidth: "230px" }}
                            />}
                            {affinityProgress.open && <LinearProgress
                                variant="buffer"
                                value={Math.round(100 * affinityProgress.progress)}
                                valueBuffer={Math.round(100 * affinityProgress.buffer)}
                                sx={{ minWidth: "230px" }}
                            />}
                            {progressFeedback.open && <LinearProgress sx={{ minWidth: "230px" }} />}
                            {influenceProgress.open && <LinearProgress variant="determinate" value={Math.round(100 * influenceProgress.progress)} sx={{ minWidth: "230px" }} />}
                        </Box>
                        <Box >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {stanceProgress.open && `${Math.round(100 * stanceProgress.progress / stanceProgress.users)}%`}
                                {affinityProgress.open && `${affinityProgress.progress !== 0 ? Math.round(100 * affinityProgress.progress) : Math.round(100 * affinityProgress.buffer)}%`}
                                {influenceProgress.open && `${Math.round(100 * influenceProgress.progress)}%`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

            </Snackbar>
        </Box>
    );
}

export default ProgressFeedback;
