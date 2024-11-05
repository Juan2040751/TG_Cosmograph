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



// Function to parse CSV and generate nodes and links
export const parseCSVToNodes = (csvFile: File): Promise<{ nodes: Node[]; links: Link[] }> => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvFile, {
            header: true,
            complete: function (results) {
                const data = results.data;
                const nodes = new Map<string, Node>();
                const links: Link[] = [];

                data.forEach((row: any) => {
                    const belief = parseFloat(row.belief);

                    // Create edge between source and target
                    const source = row.source_id;
                    const target = row.target_id;
                    const influenceValue = parseFloat(row.influence_value);

                    // Create node if it doesn't exist
                    if (!nodes.has(source)) {
                        nodes.set(source, {
                            id: source,
                            outDegree: 1,
                            belief,
                            x: Math.random() * 4096, // Random x position
                            y: Math.random() * 4096, // Random y position
                        });
                    } else {
                        const existingNode = nodes.get(source);
                        if (existingNode) {
                            existingNode.outDegree += 1;
                        }

                    }


                    // Create node if it doesn't exist
                    if (!nodes.has(target)) {
                        nodes.set(target, {
                            id: target,
                            outDegree: 0,
                        });
                    }

                    if (source && target) {
                        links.push({
                            source,
                            target,
                            influenceValue,
                        });
                    }
                });

                resolve({ nodes: Array.from(nodes.values()), links });
            },
            error: function (err) {
                reject(err);
            },
        });
    });
};
