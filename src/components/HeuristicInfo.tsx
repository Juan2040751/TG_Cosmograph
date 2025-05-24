import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BlurCircularIcon from '@mui/icons-material/BlurCircular';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FiberSmartRecordIcon from '@mui/icons-material/FiberSmartRecord';
import HubIcon from '@mui/icons-material/Hub';
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, Divider, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { getHueIndexColor } from '../data';
import Histogram from './Histogram';
import "./styles.css";

const HeuristicInfo = ({ heuristicLabel, baseHueColor, linksNames, setLinksNames, filterLinks, maxOutDegree }: {
    heuristicLabel: string | undefined, baseHueColor: number, linksNames: { [key: string]: { cant: number, active: boolean } },
    setLinksNames: Dispatch<SetStateAction<{
        [key: string]: { active: boolean, cant: number }
    }>>, filterLinks: (activeLinksNames: string[],) => void,
    maxOutDegree: number
}) => {
    const heuristicsDescriptions: {
        [key: string]: {
            description: string, influenceRelation: { [key: string]: string }
        }
    } = {
        "Interacciones": {
            description: "Redes basadas en interacciones entre usuarios",
            influenceRelation: {
                Interacciones: "Una arista indica que el usuario influenciado ha interactuado con el usuario influenciador",
                Retweets: "Una arista indica que el usuario influenciado ha retwitteado al usuario influenciador",
                Menciones: "Una arista indica que el usuario influenciado ha mencionado al usuario influenciador"
            },
        },
        "Popularidad": {
            description: "Redes de interacciones basada en popularidad",
            influenceRelation: {
                Popularidad: "Un nodo con mayor popularidad, medida por sus interacciones, tiene más influencia en los usuarios que interactúan con él",
                Betweenness: "Un nodo con mayor nivel de intermediación en la red, ejerce más influencia en los usuarios que interactúan con él"
            },
        },
        "Afinidad": {
            description: "Redes de similitud de opiniones",
            influenceRelation: {
                Afinidad: "La influencia entre usuarios se basa en la similitud de sus opiniones y creencias frente al tema, considerando su sintaxis y semántica",
                Retweets: "Una arista indica que el usuario influenciado ha retwitteado al usuario influenciador",
            }
        }
    }
    const heuristicDetails = heuristicLabel ? heuristicsDescriptions[heuristicLabel] : undefined
    const nodeColor = `hsl(${baseHueColor}, 100%, 50%)`
    return (
        heuristicDetails && <Accordion defaultExpanded
            sx={{ position: "absolute", maxWidth: "400px", right: "10px", top: "15px", zIndex: 1}}>
            <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                sx={{ padding: "0px 8px", minHeight: "45px !important" }}
            >
                <Typography variant='body1' >{heuristicDetails.description}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "0px 12px 0px !important", overflowY:"auto", maxHeight: "calc(100dvh - 140px)", scrollbarColor: "auto"}}>
                {
                    Object.keys(linksNames).map((linkName, index) => (
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }} key={index}>
                            <HubIcon sx={{ color: `hsl(${getHueIndexColor(index, baseHueColor)}, 100%, 50%)` }} />
                            {heuristicDetails.influenceRelation[linkName]}
                        </Typography>))
                }

                <Typography gutterBottom variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <FiberManualRecordIcon sx={{ color: nodeColor }} />
                    Cada nodo es una cuenta de usuario en X
                </Typography>
                <Typography gutterBottom variant="body2" sx={{ display: "flex", alignItems: "center", gap: "3px" }} >
                    <FiberSmartRecordIcon sx={{ color: nodeColor }} />
                    El tamaño del nodo representa la cantidad de cuentas que el usuario influencia.
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

                                                const activeLinksNames: string[] = Object.entries(prev)
                                                    .filter(([_, value]) => value.active)
                                                    .map(([key]) => key)
                                                filterLinks(activeLinksNames)
                                                return prev
                                            })
                                        }}
                                    />}
                                label={`${linkName} (${linksNames[linkName].cant} aristas)`} />)
                    }
                </FormGroup>
                <Divider />
                <Histogram baseHueColor={baseHueColor} maxOutDegree={maxOutDegree} />
            </AccordionDetails>
        </Accordion>
    )
}

export default HeuristicInfo