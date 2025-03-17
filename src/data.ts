import { Dispatch, SetStateAction } from "react";

// Define the types
export type Node = {
    id: string;
    outDegree: number;
    x?: number;
    y?: number;
    belief?: number;
    confidence?: number;
};
export type Link = {
    source: string;
    target: string;
    influenceValue: number;
    date?: string[];
    link_name: string;
};
export const heuristicLabel: { mentions_links: string, global_influence_links: string, local_influence_links: string, affinities_links: string, agreement_links: string } = { mentions_links: "Interacciones", global_influence_links: "Popularidad", local_influence_links: "Popularidad Relativa", affinities_links: "Afinidad", agreement_links: "Acuerdo/Desacuerdo" };

export type HeuristicKey = 'mentions_links' | 'global_influence_links' | 'local_influence_links' | 'affinities_links' | 'agreement_links';

export const initializeNodes = (ids: string[]): Node[] => {
    return ids.map(id => ({
        id,
        outDegree: 0,
        x: undefined,
        y: undefined,
        belief: undefined,
        confidence: undefined,
    }));
}

export const processEdges = (
    data: Array<{ source: string; target: string; influenceValue: number, date?: string[] | undefined, link_name: string }>,
    setNodes: Dispatch<SetStateAction<Node[]>>, setLinksNames: Dispatch<SetStateAction<{ [key: string]: {cant: number, active: boolean} }>>
): { links: Link[], maxOutDegree: number, maxInfluence: {[key: string]: number} } => {

    const links: Link[] = [];
    let maxOutDegree = 0;
    let maxInfluence:{[key: string]: number} = {};


    const tempNodeData = new Map<string, { outDegree: number, x: number, y: number }>();

    data.forEach((row) => {
        const { source, target, influenceValue, date, link_name } = row;
        if (!maxInfluence[link_name]) maxInfluence[link_name] = 0
        if (influenceValue > maxInfluence[link_name]) maxInfluence[link_name] = influenceValue;
        if (!tempNodeData.has(source)) {
            tempNodeData.set(source, {
                outDegree: 1,
                x: Math.random() * 8192,
                y: Math.random() * 8192
            });
        } else {
            const existingData = tempNodeData.get(source);
            if (existingData) {
                existingData.outDegree += 1;
                maxOutDegree = Math.max(maxOutDegree, existingData.outDegree);
            }
        }

        if (!tempNodeData.has(target)) {
            tempNodeData.set(target, {
                outDegree: 0,
                x: Math.random() * 8192,
                y: Math.random() * 8192
            });
        }

        links.push({
            source,
            target,
            influenceValue,
            date,
            link_name
        });
    });


    setNodes((prevNodes) =>
        prevNodes.map((node) => {
            const tempData = tempNodeData.get(node.id);
            if (tempData) {
                return {
                    ...node,
                    outDegree: tempData.outDegree,
                    x: node.x ?? tempData.x,  // Mantener posición si ya existe, de lo contrario usar nueva
                    y: node.y ?? tempData.y,  // Mantener posición si ya existe, de lo contrario usar nueva
                };
            }

            return {
                ...node,
                outDegree: 0,
            };
        })
    );

    const linksNames = links.reduce((acc, link) => {
        const key = link.link_name || 'null';
        if (!acc[key]) {
            acc[key]= {cant: 0, active: true};
        }
        acc[key].cant = acc[key].cant + 1;
        return acc;
    }, {} as { [key: string]: {cant: number, active: boolean} });
    
    setLinksNames(linksNames)
    return { links, maxOutDegree, maxInfluence };
};

export const processStance = (stances: { [key: string]: number }, setNodes: React.Dispatch<React.SetStateAction<Node[]>>) => {
    setNodes((prevNodes) =>
        prevNodes.map((node) => {
            node["belief"] = stances[node.id]
            return node
        })
    );
}
export const processConfidence = (confidences: { [key: string]: number }, setNodes: React.Dispatch<React.SetStateAction<Node[]>>) => {
    setNodes((prevNodes) =>
        prevNodes.map((node) => {
            node["confidence"] = confidences[node.id]
            return node
        })
    );
}

export const getHueIndexColor = (index: number, baseHueColor: number) => {
    const hueOffsets = [baseHueColor, 120, 240];
    const hue = hueOffsets[index];
    return hue;
}