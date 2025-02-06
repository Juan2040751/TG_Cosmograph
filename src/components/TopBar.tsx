import { CosmographSearch, CosmographSearchRef } from '@cosmograph/react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { RefObject } from 'react';
import { HeuristicKey, heuristicLabel, Link, Node } from '../data';
import "./styles.css";



function TopBar({ handleFileUpload, search, handleChangeHeuristic, onSearchSelectResult, heuristic, heuristicsLinks }: {
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void, search: RefObject<CosmographSearchRef<Node, Link>>, handleChangeHeuristic: (event: SelectChangeEvent) => void, onSearchSelectResult: (node?: Node | undefined) => void, heuristic: string, heuristicsLinks: {
        mentions_links: Link[];
        global_influence_links: Link[];
        local_influence_links: Link[];
        affinities_links: Link[];
        agreement_links: Link[];
    }
}) {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px" }}>
            <input type="file" onChange={handleFileUpload} accept=".csv" />
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
        </Box>
    )
}

export default TopBar