import { CosmographSearch, CosmographSearchRef } from '@cosmograph/react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { RefObject } from 'react';
import { HeuristicKey, heuristicLabel, Link, Node } from '../data';
import "./styles.css";

/**
 * Converts an array of objects to CSV format.
 * @param data - The array of objects to be converted.
 * @returns A CSV string.
 */
function convertToCSV<T extends object>(data: T[]): string {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",") + "\n";
    const csvContent = data.map(item =>
        Object.values(item).map(value =>
            Array.isArray(value) ? `"${value.join(";")}"` : value
        ).join(",")
    ).join("\n");

    return headers + csvContent;
}

/**
 * Handles downloading the graph data as a ZIP containing two CSV files (nodes and links).
 * @param nodes - The list of nodes.
 * @param links - The list of links.
 * @param heuristic - The selected heuristic name.
 */
async function downloadGraph(nodes: Node[], links: Link[], heuristic: string) {
    const zip = new JSZip();
    const nodesCSV = convertToCSV(nodes);
    const linksCSV = convertToCSV(links);

    zip.file(`${heuristic}-nodos.csv`, nodesCSV);
    zip.file(`${heuristic}-aristas.csv`, linksCSV);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${heuristic}.zip`);
}


function TopBar({ handleFileUpload, search, handleChangeHeuristic, onSearchSelectResult, heuristic, heuristicsLinks, links, nodes }: {
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void, search: RefObject<CosmographSearchRef<Node, Link>>, handleChangeHeuristic: (event: SelectChangeEvent) => void, onSearchSelectResult: (node?: Node | undefined) => void, heuristic: string, heuristicsLinks: {
        mentions_links: Link[];
        global_influence_links: Link[];
        local_influence_links: Link[];
        affinities_links: Link[];
        agreement_links: Link[];
    }, links: Link[], nodes: Node[]
}) {
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px", gap: "10px" }}>
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                sx={{ whiteSpace: "nowrap", minWidth: "170px" }}

            >
                Cargar DataSet
                <VisuallyHiddenInput
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    accept=".csv"
                />
            </Button>
            <CosmographSearch
                ref={search}
                className='searchStyle'
                onSelectResult={onSearchSelectResult}
                maxVisibleItems={20}
            />
            <Box sx={{ minWidth: 200, color: "text.primary" }}>
                <FormControl fullWidth variant='standard'>
                    <InputLabel>Heuristica</InputLabel>
                    <Select
                        value={heuristic}
                        label="Heuristica"
                        onChange={handleChangeHeuristic}
                        sx={{ color: "text.primary" }}
                    >
                        {Object.keys(heuristicsLinks).map((heuristicName: string) =>
                            <MenuItem value={heuristicName} disabled={!heuristicsLinks[heuristicName as HeuristicKey].length} key={heuristicName}>
                                {heuristicLabel[heuristicName as HeuristicKey]}
                            </MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            <IconButton disabled={!(nodes?.length && links?.length)} color="primary" aria-label="Descargar Red" onClick={() => downloadGraph(nodes, links, heuristicLabel[heuristic as HeuristicKey])}>
                <CloudDownloadIcon />
            </IconButton>
        </Box>
    )
}

export default TopBar