import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BlurCircularIcon from '@mui/icons-material/BlurCircular';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FiberSmartRecordIcon from '@mui/icons-material/FiberSmartRecord';
import HubIcon from '@mui/icons-material/Hub';
import { Accordion, AccordionDetails, AccordionSummary, Divider, FormControlLabel, FormGroup, Typography, Checkbox } from '@mui/material';
import "./styles.css";
import { getHueIndexColor } from '../data';
import { Dispatch, SetStateAction } from 'react';

const HeuristicInfo = ({ heuristicLabel, baseHueColor, linksNames, setLinksNames, filterLinks }: {
    heuristicLabel: string | undefined, baseHueColor: number, linksNames: { [key: string]: { cant: number, active: boolean } },
    setLinksNames: Dispatch<SetStateAction<{
        [key: string]: { active: boolean, cant: number }
    }>>, filterLinks: (activeLinksNames: string[])=> void
}) => {
    const heuristicsDescriptions = {
        "Interacciones": {
            description: "Red de menciones entre usuarios",
            influenceRelation: "Una arista indica que el usuario influenciado ha interactuado con el usuario influenciador",
        },
        "Popularidad": {
            description: "Red de menciones basada en popularidad",
            influenceRelation: "Un nodo con mayor popularidad, medida por sus interacciones, tiene más influencia en los usuarios que interactúan con él",
        },
        "Popularidad Relativa": {
            description: "Red de popularidad relativa",
            influenceRelation: "Considera la popularidad de cada usuario en relación a los nodos a los que está conectado directamente"
        },
        "Afinidad": {
            description: "Red de similitud de opiniones",
            influenceRelation: "La influencia entre usuarios se basa en la similitud de sus opiniones frente al tema, considerando su sintaxis y semántica"
        }
    }
    const heuristicDetails = heuristicLabel ? heuristicsDescriptions[heuristicLabel as ("Interacciones" | "Popularidad" | "Popularidad Relativa" | "Afinidad")] : undefined
    const nodeColor = `hsl(${baseHueColor}, 100%, 50%)`
    return (
        heuristicDetails && <Accordion defaultExpanded
            sx={{ position: "absolute", maxWidth: "400px", right: "12px", top: "16px", zIndex: 1 }}>
            <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                sx={{ padding: "0px 8px" }}
            >
                <Typography variant='body1' >{heuristicDetails.description}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <HubIcon sx={{ color: nodeColor }} />
                    {heuristicDetails.influenceRelation}
                </Typography>
                <Typography gutterBottom variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <FiberManualRecordIcon sx={{ color: nodeColor }} />
                    Cada nodo es una cuenta de usuario en X
                </Typography>
                <Typography gutterBottom variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }} >
                    <FiberSmartRecordIcon sx={{ color: nodeColor }} />
                    El tamaño del nodo representa la cantidad de otras cuentas que el usuario influencia.
                </Typography>
                <Typography gutterBottom variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <BlurCircularIcon sx={{ color: nodeColor }} />
                    Los usuarios con más conexiones tienen un color más intenso.
                </Typography>
                <Divider />
                <Typography variant='body1' sx={{ marginTop: "8px" }}>Aristas</Typography>
                <FormGroup>
                    {
                        Object.keys(linksNames).map((linkName, index) =>
                            <FormControlLabel key={linkName}
                                control={
                                    <Checkbox checked={linksNames[linkName].active} sx={{
                                        '&.Mui-checked': {
                                            color: `hsl(${getHueIndexColor(index, baseHueColor)}, 100%, 50%)`,
                                        }
                                    }}
                                        onChange={({ target }) => {
                                            setLinksNames(prev => {
                                                prev[linkName].active = target.checked
                                                console.log(prev)
                                                const activeLinksNames: string[] = Object.entries(prev)
                                                    .filter(([_, value]) => value.active)
                                                    .map(([key]) => key)
                                                console.log(activeLinksNames)
                                                filterLinks(activeLinksNames)
                                                return prev
                                            })
                                        }}
                                    />}
                                label={`${linkName} (${linksNames[linkName].cant} aristas)`} />)
                    }
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    )
}

export default HeuristicInfo