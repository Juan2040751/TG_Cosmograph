import { CosmographRef } from '@cosmograph/react';
import { Dispatch, RefObject, SetStateAction } from 'react';
import io from 'socket.io-client';
import { Link, Node, processEdges } from './data';
export const socket = io("http://localhost:5000", {
    transports: ['websocket'],
    upgrade: false
});

export const receiveInfluenceHeuristic = (setHeuristicsLinks: Dispatch<SetStateAction<{
    mentions_links: Link[];
    global_influence_links: Link[];
    local_influence_links: Link[];
    affinities_links: Link[];
    agreement_links: Link[];
}>>, setLinks: Dispatch<SetStateAction<Link[]>>, setAffinityProgress: Dispatch<SetStateAction<{
    users: number;
    progress: number;
    open: boolean;
}>>, setMaxOutDegree: Dispatch<SetStateAction<number>>,
    setMaxInfluence: Dispatch<SetStateAction<{ [key: string]: number}>>,
    setHeuristic: Dispatch<SetStateAction<string>>,
    setNodes: Dispatch<SetStateAction<Node[]>>,
    cosmographRef: RefObject<CosmographRef<Node, Link>>, 
    setLinksNames: Dispatch<SetStateAction<{ [key: string]: {cant: number, active: boolean} }>>) => {
    socket.on("influence_heuristic", (heuristic: { heuristic: Array<{ source: string; target: string; influenceValue: number, date?:string[], link_name: string }> }) => {
        Object.entries(heuristic).forEach(([heuristicName, heuristicLinks]) => {
            setHeuristicsLinks(prev => ({
                ...prev,
                [heuristicName]: heuristicLinks
            }));
            if (heuristicName === "affinities_links") setAffinityProgress(prev => { return { ...prev, open: false } })
            setLinks(prev => {
                if (!prev.length) {
                    const { links, maxOutDegree, maxInfluence } = processEdges(heuristicLinks, setNodes, setLinksNames)
                    setMaxOutDegree(maxOutDegree);
                    setMaxInfluence(maxInfluence);
                    cosmographRef.current?.fitView();
                    cosmographRef.current?.setZoomLevel(0.2, 3000)
                    setHeuristic(heuristicName);
                    return links
                }
                return prev
            })
        });
    })
}
export const sendCSV = (csvBase64: string) => {
    socket.emit('influenceGraph', { csv_data: csvBase64 });
}

