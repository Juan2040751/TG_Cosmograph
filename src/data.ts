// Define the types
export type Node = {
    id: string;
    outDegree: number;
    x?: number;
    y?: number;
    belief?: number;
};
export type Link = {
    source: string;
    target: string;
    influenceValue: number;
    date?: string[];
};
export const heuristicLabel: { mentions_links: string, global_influence_links: string, local_influence_links: string, affinities_links: string } = { mentions_links: "Interacciones", global_influence_links: "Popularidad", local_influence_links: "Popularidad Relativa", affinities_links: "Afinidad" };

export type HeuristicKey = 'mentions_links' | 'global_influence_links' | 'local_influence_links' | 'affinities_links';

export const initializeNodes = (ids: string[]): Node[] => {
    return ids.map(id => ({
        id,
        outDegree: 0,
        x: undefined,   // Opcional, puedes omitir estos si no los necesitas
        y: undefined,
        belief: undefined
    }));
}

export const processEdges = (
    data: Array<{ source: string; target: string; influenceValue: number, date?: string[] | undefined }>,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>
): { links: Link[], maxOutDegree: number, maxInfluence: number } => {

    const links: Link[] = [];
    let maxOutDegree = 0;
    let maxInfluence = 0;


    const tempNodeData = new Map<string, { outDegree: number, x: number, y: number }>();

    data.forEach((row) => {
        const { source, target, influenceValue, date } = row;

        if (influenceValue > maxInfluence) maxInfluence = influenceValue;
        if (!tempNodeData.has(source)) {
            tempNodeData.set(source, {
                outDegree: 1,
                x: Math.random() * 4096,
                y: Math.random() * 4096
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
                x: Math.random() * 4096,
                y: Math.random() * 4096
            });
        }

        links.push({
            source,
            target,
            influenceValue,
            date
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
            return node;
        })
    );

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