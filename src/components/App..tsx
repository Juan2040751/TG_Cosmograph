import { CosmographInputConfig, CosmographProvider, CosmographRef, CosmographSearchInputConfig, CosmographSearchRef } from '@cosmograph/react';
import { Alert, Box, SelectChangeEvent, Snackbar, SnackbarCloseReason } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { HeuristicKey, Link, Node, getHueIndexColor, getSafeHue, heuristicLabel, initializeNodes, processConfidence, processEdges, processStance, updateOutDegrees } from '../data';
import { receiveInfluenceHeuristic, sendCSV, socket } from '../socket';
import HeuristicInfo from './HeuristicInfo';
import ProgressFeedback from './ProgressFeedback';
import SelectedUserInfo from './SelectedUserInfo';
import "./styles.css";
//import Timeline from './Timeline';
import InfluenceGraph from './InfluenceGraph';
import TopBar from './TopBar';
import Histogram from './Histogram';

const App = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [filteredlinks, setFilteredLinks] = useState<Link[]>([]);
    const [maxOutDegree, setMaxOutDegree] = useState<number>(1);
    const [digraph, setDigraph] = useState<boolean>(true);
    const [linksNames, setLinksNames] = useState<{ [key: string]: { active: boolean, cant: number } }>({});
    const [heuristicsLinks, setHeuristicsLinks] = useState<{ mentions_links: Link[], global_influence_links: Link[], affinities_links: Link[] }>({ mentions_links: [], global_influence_links: [], affinities_links: [] })
    const [heuristic, setHeuristic] = useState<string>('');
    const [preprocessError, setPreprocessError] = useState<{ open: boolean, message: string }>({ open: false, message: "" });
    const [stanceProgress, setStanceProgress] = useState<{ users: number, progress: number, processing: number, open: boolean, estimatedTime: number, batches: number }>({ users: 0, progress: 0, processing: 0, open: false, estimatedTime: 60, batches: 0 });
    const [affinityProgress, setAffinityProgress] = useState<{ users: number, progress: number, open: boolean, buffer: number }>({ users: 0, progress: 0, open: false, buffer: 0 });
    const [progressFeedback, setProgressFeedback] = useState<{ message: string, open: boolean }>({ message: "", open: false });
    const [influenceProgress, setInfluenceProgress] = useState<{ progress: number, open: boolean, message: string }>({ progress: 0, open: false, message: "" });
    const cosmographRef = useRef<CosmographRef<Node, Link>>(null);
    const [selectedNode, setSelectedNode] = useState<Node | undefined>();
    const search = useRef<CosmographSearchRef<Node, Link>>(null);
    const [nodesInfo, setNodesInfo] = useState<{ confidence: boolean, belief: boolean, degree: boolean }>({ confidence: false, belief: false, degree: false });
    const [showLabelsFor, setShowLabelsFor] = useState<Node[]>(
        []
    );
    const [baseHueColor, _] = useState<number>(getSafeHue());
    // Event handler for uploading CSV file
    const handleFileUpload = (file: File, topicInfo: { topic: string, topicContext: string }) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    const csvBase64 = (reader.result as string).split(',')[1];
                    sendCSV(csvBase64, topicInfo)
                    socket.on("preprocess_error", (errorMessage: string) => setPreprocessError({ open: true, message: errorMessage }))
                    socket.on("progress_feedback", (feedback: { message: string, open: boolean }) => setProgressFeedback(feedback))
                    socket.on("influence_progress", (feedback: { progress: number, open: boolean, message: string }) => setInfluenceProgress(feedback))
                    socket.on("users", (ids: string[]) => setNodes(initializeNodes(ids)));
                    receiveInfluenceHeuristic(setHeuristicsLinks, setLinks, setAffinityProgress, setMaxOutDegree, setHeuristic, setNodes, cosmographRef, setLinksNames)
                    socket.on("stance_time", (stanceTime) => setStanceProgress({
                        users: stanceTime.n_users, progress: stanceTime.null_stances, processing: stanceTime.null_stances,
                        estimatedTime: stanceTime.estimated_time, batches: stanceTime.n_batch, open: true
                    }))
                    socket.on("belief_heuristic", stances => {
                        processStance(stances, setNodes);
                        setStanceProgress(prev => { return { ...prev, open: false } });
                        setNodesInfo(prev => { return { ...prev, belief: true } });
                    })
                    socket.on("confidence_heuristic", confidences => { processConfidence(confidences, setNodes); setNodesInfo(prev => { return { ...prev, confidence: true } }) })
                    socket.on("affinity_work_info", affinityUsers => setAffinityProgress(prev => { return { ...prev, users: affinityUsers, open: true } }))
                    socket.on("affinity_work_buffer", affinityUsersBuffer => setAffinityProgress(prev => { return { ...prev, buffer: affinityUsersBuffer, open: true } }))
                    socket.on("affinity_work", affinityProgress => setAffinityProgress(prev => { return { ...prev, progress: affinityProgress } }))
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const getNode = (id: string) => {
        return nodes.find(node => node.id === id)
    }


    const getLinkNameColor = (name: string) => {
        const linkKeys = Object.keys(linksNames);
        const keyIndex = linkKeys.indexOf(name);
        const hue = getHueIndexColor(keyIndex, baseHueColor);
        return hue
    }

    const onSearchSelectResult = useCallback<
        Exclude<CosmographSearchInputConfig<Node>["onSelectResult"], undefined>
    >((n) => {
        setShowLabelsFor(n ? [n] : []);
        setSelectedNode(n);
    }, []);

    const showLinkNodes = (link: Link) => {
        const source = nodes.find(n => n.id === link.source)
        const target = nodes.find(n => n.id === link.target)
        if (source && target) {
            setShowLabelsFor([source, target])
            cosmographRef.current?.selectNodes([source, target])
            cosmographRef.current?.fitViewByNodeIds([source.id, target.id])
        }
    }
    const handleChangeHeuristic = (event: SelectChangeEvent) => {
        const heuristicName: HeuristicKey = (event.target.value) as HeuristicKey
        const { links, maxOutDegree } = processEdges(heuristicsLinks[heuristicName], setNodes, setLinksNames)
        setLinks(links);
        setMaxOutDegree(maxOutDegree);
        cosmographRef.current?.fitView();
        cosmographRef.current?.setZoomLevel(0.1, 2000)
        setHeuristic(event.target.value);
    }
    const filterLinks = (activeLinksNames: string[]) => {
        const filtered = links.filter(link => activeLinksNames.includes(link.linkName));
        setFilteredLinks(filtered);
        const { updatedNodes, maxOutDegree } = updateOutDegrees(nodes, filtered);
        setNodes(updatedNodes);
        setMaxOutDegree(maxOutDegree);
        setDigraph(!(activeLinksNames.length === 1 && activeLinksNames[0] === "Acuerdo/Desacuerdo"))
    }

    const onCosmographClick = useCallback<
        Exclude<CosmographInputConfig<Node, Link>["onClick"], undefined>
    >((n) => {
        search?.current?.clearInput();
        if (n) {
            //cosmographRef.current?.zoomToNode(n)
            cosmographRef.current?.selectNodes([n, ...cosmographRef.current?.getAdjacentNodes(n.id) ?? []]);
            setShowLabelsFor([n]);
            cosmographRef.current?.fitViewByNodeIds([n.id, ...(cosmographRef.current?.getAdjacentNodes(n.id) ?? []).map(node => node.id)]);
            setSelectedNode(n);
        } else {
            cosmographRef.current?.unselectNodes();
            setShowLabelsFor([]);
            setSelectedNode(undefined);
        }

    }, []);

    useEffect(() => {
        if (selectedNode) {
            const updatedNode = nodes.find(node => node.id === selectedNode.id)
            if (updatedNode) {
                setSelectedNode(updatedNode)
            }
        }
    }, [nodes])

    useEffect(() => {
        setFilteredLinks(links)
        setNodesInfo(prev => { return { ...prev, degree: links.length !== 0 } });
    }, [links])



    const handleClose = (
        _event?: SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setPreprocessError({ open: false, message: "" });
    };
    return (
        <Box sx={{ height: "100px !important" }}>
            <CosmographProvider
                nodes={nodes}
                links={filteredlinks}
            >
                <TopBar handleFileUpload={handleFileUpload} search={search} handleChangeHeuristic={handleChangeHeuristic} onSearchSelectResult={onSearchSelectResult} heuristic={heuristic} heuristicsLinks={heuristicsLinks} links={filteredlinks} nodes={nodes} />
                <Box sx={{ position: "relative" }}>
                    <HeuristicInfo heuristicLabel={heuristicLabel[heuristic as HeuristicKey]} baseHueColor={baseHueColor} linksNames={linksNames} setLinksNames={setLinksNames} filterLinks={filterLinks} />
                    <Snackbar open={preprocessError.open} autoHideDuration={30000} onClose={handleClose}>
                        <Alert
                            onClose={handleClose}
                            severity="error"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {preprocessError.message}
                        </Alert>
                    </Snackbar>
                    {Object.values(nodesInfo).some(value => value) && <Histogram baseHueColor={baseHueColor} maxOutDegree={maxOutDegree} nodes={nodes} nodesInfo={nodesInfo}/>}
                    <InfluenceGraph maxOutDegree={maxOutDegree} linksNames={linksNames} baseHueColor={baseHueColor} cosmographRef={cosmographRef} showLabelsFor={showLabelsFor} onCosmographClick={onCosmographClick} />
                </Box>
            </CosmographProvider>
            {selectedNode && <SelectedUserInfo selectedNode={selectedNode} getNode={getNode}
                links={filteredlinks} showLinkNodes={showLinkNodes} digraph={digraph} getLinkNameColor={getLinkNameColor} />
            }
            {<ProgressFeedback stanceProgress={stanceProgress} setStanceProgress={setStanceProgress} affinityProgress={affinityProgress} progressFeedback={progressFeedback} influenceProgress={influenceProgress} />}
        </Box>
    );
};

export default App;