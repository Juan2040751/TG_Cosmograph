import { Cosmograph, CosmographInputConfig, CosmographProvider, CosmographRef, CosmographSearchInputConfig, CosmographSearchRef } from '@cosmograph/react';
import { Alert, Box, SelectChangeEvent, Snackbar, SnackbarCloseReason } from '@mui/material';
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { HeuristicKey, Link, Node, getHueIndexColor, heuristicLabel, initializeNodes, processConfidence, processEdges, processStance, updateOutDegrees } from '../data';
import { receiveInfluenceHeuristic, sendCSV, socket } from '../socket';
import HeuristicInfo from './HeuristicInfo';
import ProgressFeedback from './ProgressFeedback';
import SelectedUserInfo from './SelectedUserInfo';
import "./styles.css";
//import Timeline from './Timeline';
import TopBar from './TopBar';

const InfluenceGraph = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredlinks, setFilteredLinks] = useState<Link[]>([]);
  const [maxOutDegree, setMaxOutDegree] = useState<number>(1);
  const [digraph, setDigraph] = useState<boolean>(true);
  const [linksNames, setLinksNames] = useState<{ [key: string]: { active: boolean, cant: number } }>({});
  const [heuristicsLinks, setHeuristicsLinks] = useState<{ mentions_links: Link[], global_influence_links: Link[],  affinities_links: Link[]}>({ mentions_links: [], global_influence_links: [], affinities_links: [] })
  const [heuristic, setHeuristic] = useState<string>('');
  const [preprocessError, setPreprocessError] = useState<{ open: boolean, message: string }>({ open: false, message: "" });
  const [stanceProgress, setStanceProgress] = useState<{ users: number, progress: number, processing: number, open: boolean, estimatedTime: number, batches: number }>({ users: 0, progress: 0, processing: 0, open: false, estimatedTime: 60, batches: 0 });
  const [affinityProgress, setAffinityProgress] = useState<{ users: number, progress: number, open: boolean }>({ users: 0, progress: 0, open: false });
  const cosmographRef = useRef<CosmographRef<Node, Link>>(null);
  const [selectedNode, setSelectedNode] = useState<Node | undefined>();
  const search = useRef<CosmographSearchRef<Node, Link>>(null);
  const [showLabelsFor, setShowLabelsFor] = useState<Node[] | undefined>(
    undefined
  );
  const getSafeHue = (): number => {
    let hue: number;
    do {
      hue = Math.floor(Math.random() * 360); 
    } while ((hue >= 0 && hue <= 5) || (hue >= 95 && hue <= 105));
    return hue;
  };
  
  const [baseHueColor, _] = useState<number>(getSafeHue());

  // Event handler for uploading CSV file
  const handleFileUpload = (file: File, topicInfo: {topic: string, topicContext: string}) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const csvBase64 = (reader.result as string).split(',')[1];
          sendCSV(csvBase64, topicInfo)
          socket.on("preprocess_error", (errorMessage: string) => setPreprocessError({ open: true, message: errorMessage }))
          socket.on("users", (ids: string[]) => {
            const nodes = initializeNodes(ids);
            setNodes(nodes);
          });
          receiveInfluenceHeuristic(setHeuristicsLinks, setLinks, setAffinityProgress, setMaxOutDegree, setHeuristic, setNodes, cosmographRef, setLinksNames)
          socket.on("stance_time", (stanceTime) => {
            setStanceProgress({
              users: stanceTime.n_users, progress: stanceTime.null_stances, processing: stanceTime.null_stances,
              estimatedTime: stanceTime.estimated_time, batches: stanceTime.n_batch, open: true
            })
          })
          socket.on("belief_heuristic", stances => {
            processStance(stances, setNodes);
            setStanceProgress(prev => { return { ...prev, open: false } });
          })
          socket.on("confidence_heuristic", confidences => processConfidence(confidences, setNodes))
          socket.on("affinity_work_info", affinityUsers => setAffinityProgress(prev => { return { ...prev, users: affinityUsers, open: true } }))
          socket.on("affinity_work", affinityProgress => setAffinityProgress(prev => { return { ...prev, progress: affinityProgress } }))
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getNodeColor = (node: Node | undefined) => {
    if (!node) return `hsl(${baseHueColor}, 0%, 100%)`
    const saturation = Math.round(node.outDegree / maxOutDegree * 100) + 20;
    const newLightness = 100 - saturation / 2;
    return `hsl(${baseHueColor}, ${saturation}%, ${newLightness}%)`;
  };

  const getNode = (id: string) => {
    return nodes.find(node => node.id === id)
  }

  const getLinkColor = (link: Link) => {
    const linkKeys = Object.keys(linksNames);
    const keyIndex = linkKeys.indexOf(link.link_name);

    const hue = link.link_name !== "Acuerdo/Desacuerdo" ? getHueIndexColor(keyIndex, baseHueColor) : link?.influenceValue < 0 ? 0 : 100;
    const saturation = Math.round(Math.abs(link?.influenceValue) * 100);
    const lightness = 100 - saturation / 2;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const getLinkNameColor = (name: string) => {
    const linkKeys = Object.keys(linksNames);
    const keyIndex = linkKeys.indexOf(name);
    const hue = getHueIndexColor(keyIndex, baseHueColor);
    return hue
  }

  const onCosmographClick = useCallback<
    Exclude<CosmographInputConfig<Node, Link>["onClick"], undefined>
  >((n) => {
    search?.current?.clearInput();
    if (n) {
      //cosmographRef.current?.zoomToNode(n)
      cosmographRef.current?.selectNode(n);
      setShowLabelsFor([n]);
      setSelectedNode(n);
    } else {
      cosmographRef.current?.unselectNodes();
      setShowLabelsFor(undefined);
      setSelectedNode(undefined);
    }

  }, []);

  const onSearchSelectResult = useCallback<
    Exclude<CosmographSearchInputConfig<Node>["onSelectResult"], undefined>
  >((n) => {
    setShowLabelsFor(n ? [n] : undefined);
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
    cosmographRef.current?.setZoomLevel(0.15, 3000)
    setHeuristic(event.target.value);
  }
  const filterLinks = (activeLinksNames: string[]) => {
    const filtered = links.filter(link => activeLinksNames.includes(link.link_name));
    setFilteredLinks(filtered);
    const { updatedNodes, maxOutDegree } = updateOutDegrees(nodes, filtered);
    setNodes(updatedNodes);
    setMaxOutDegree(maxOutDegree);
    setDigraph(!(activeLinksNames.length === 1 && activeLinksNames[0] === "Acuerdo/Desacuerdo"))
    cosmographRef.current?.fitView();
    cosmographRef.current?.setZoomLevel(0.15, 2000)
    //console.log(activeLinksNames.length === 1, activeLinksNames[0] === "Acuerdo/Desacuerdo", !(activeLinksNames.length === 1 && activeLinksNames[0] === "Acuerdo/Desacuerdo"))
  }

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
          <Cosmograph
            ref={cosmographRef}
            className='cosmographStyle'
            spaceSize={8192}
            curvedLinks
            onClick={onCosmographClick}
            showLabelsFor={showLabelsFor}
            simulationCenter={-1}
            nodeSize={(node: Node) => node.outDegree / 1.5}
            nodeColor={getNodeColor}
            nodeLabelColor={"white"}
            hoveredNodeLabelColor={`hsl(${baseHueColor}, 100%, 50%)`}
            linkWidthScale={1}
            linkArrowsSizeScale={1}
            linkWidth={(link: Link) => Math.abs(link.influenceValue) ?? 0.1}
            linkColor={getLinkColor}

            simulationGravity={0.5}
            simulationRepulsion={300}//
            simulationRepulsionTheta={2}//1
            simulationLinkSpring={1}//1
            simulationLinkDistance={50}
            simulationFriction={0.5}
            disableSimulation={false}
            showDynamicLabels
            renderHoveredNodeRing
            showHoveredNodeLabel
            showTopLabelsValueKey={'outDegree'}
          />
          {/**<Timeline baseHueColor={baseHueColor} />*/}
        </Box>

      </CosmographProvider>
      {selectedNode && <SelectedUserInfo selectedNode={selectedNode} getNode={getNode}
        links={filteredlinks} showLinkNodes={showLinkNodes} digraph={digraph} getLinkNameColor={getLinkNameColor} />
      }
      {<ProgressFeedback stanceProgress={stanceProgress} setStanceProgress={setStanceProgress} affinityProgress={affinityProgress} />}
    </Box>
  );
};

export default InfluenceGraph;