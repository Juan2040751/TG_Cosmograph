import Papa from 'papaparse';
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
};
export  const heuristicLabel: { mentions_links: string, global_influence_links: string, local_influence_links: string } = { mentions_links: "Menciones", global_influence_links: "Influencia Global", local_influence_links: "Influencia Local" };

export type HeuristicKey = 'mentions_links' | 'global_influence_links' | 'local_influence_links';

export const initializeNodes = (ids: string[]): Node[] => {
    return ids.map(id => ({
        id,
        outDegree: 0,
        x: undefined,   // Opcional, puedes omitir estos si no los necesitas
        y: undefined,
        belief: undefined
    }));
}

export const processEdges = (data: Array<{ source: string; target: string; influenceValue: number }>): { nodes: Node[], links: Link[], maxOutDegree: number, maxInfluence: number } => {
    const nodes = new Map<string, Node>();
    const links: Link[] = [];
    let maxOutDegree = 0;
    let maxInfluence = 0;
    data.forEach((row) => {
        const { source, target, influenceValue } = row;
        if (influenceValue > maxInfluence) maxInfluence = influenceValue;
        // Crear o actualizar el nodo de origen con outDegree
        if (!nodes.has(source)) {
            nodes.set(source, {
                id: source,
                outDegree: 1,
                x: Math.random() * 4096, // Posición x aleatoria
                y: Math.random() * 4096, // Posición y aleatoria
            });
        } else {
            const existingNode = nodes.get(source);
            if (existingNode) {
                existingNode.outDegree += 1;
                if (existingNode.outDegree > maxOutDegree) maxOutDegree = existingNode.outDegree
            }
        }

        if (!nodes.has(target)) {
            nodes.set(target, {
                id: target,
                outDegree: 0,
            });
        }

        
        links.push({
            source,
            target,
            influenceValue,
        });
    });

    // Convertir el Map de nodos a un array
    return { nodes: Array.from(nodes.values()), links, maxOutDegree, maxInfluence };
}