import React, { Dispatch, FormEvent, SetStateAction } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const BeliefDialog = ({
    openBeliefDialog,
    setOpenBeliefDialog,
    sendDataset
}: {
    openBeliefDialog: boolean;
    setOpenBeliefDialog: Dispatch<SetStateAction<boolean>>;
    sendDataset: (topic: { topic: string; topicContext: string }) => void;
}) => {
    const handleClose = () => {
        setOpenBeliefDialog(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const topic = formData.get("topic") as string;
        const topicContext = formData.get("topicContext") as string;
        sendDataset({ topic, topicContext });
        handleClose();
    };

    return (
        <Dialog
            open={openBeliefDialog}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit,
            }}
        >
            <DialogTitle>Tema de análisis</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Para continuar con el análisis del dataset, por favor indique el tema principal y un contexto neutral sobre el cual se realizará el estudio.
                    El contexto debe estar redactado de forma imparcial para evitar sesgos en el análisis.
                </DialogContentText>

                <TextField
                    autoFocus
                    required
                    defaultValue="La reforma pensional en Colombia"
                    margin="dense"
                    id="topic"
                    name="topic"
                    label="Tema de análisis"
                    type="text"
                    fullWidth
                    variant="standard"
                    slotProps={{
                        htmlInput: { maxLength: 60 },
                    }}

                    helperText="Máximo 60 caracteres"
                />

                <TextField
                    required
                    margin="dense"
                    defaultValue="El gobierno del presidente Gustavo Petro presentó un proyecto de ley para reformar el sistema pensional, el cual fue aprobado con el apoyo de algunos sectores y cuestionado por otros."
                    id="topicContext"
                    name="topicContext"
                    label="Contexto imparcial sobre el tema"
                    type="text"
                    fullWidth
                    multiline
                    variant="standard"
                    slotProps={{
                        htmlInput: { maxLength: 200 },
                    }}
                    helperText="Máximo 200 caracteres"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button type="submit" variant="contained">Analizar Dataset</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BeliefDialog;