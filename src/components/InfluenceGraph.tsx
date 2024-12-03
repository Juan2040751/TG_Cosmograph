import { Cosmograph, CosmographInputConfig, CosmographProvider, CosmographRef, CosmographSearch, CosmographSearchInputConfig, CosmographSearchRef, CosmographTimeline, CosmographTimelineRef } from '@cosmograph/react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import "./styles.css";
import { HeuristicKey, Link, Node, heuristicLabel, initializeNodes, processEdges, processStance } from '../data';
import SelectedUserInfo from './SelectedUserInfo';
import HeuristicInfo from './HeuristicInfo';
import Timeline from './Timeline';

const socket = io("http://localhost:5000");

const InfluenceGraph = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [maxOutDegree, setMaxOutDegree] = useState<number>(1);
  const [maxInfluence, setMaxInfluence] = useState<number>(0);
  const [digraph, setDigraph] = useState<boolean>(true);
  const [heuristicsLinks, setHeuristicsLinks] = useState<{ mentions_links: Link[], global_influence_links: Link[], local_influence_links: Link[], affinities_links: Link[], agreement_links: Link[] }>({ mentions_links: [], global_influence_links: [], local_influence_links: [], affinities_links: [], agreement_links: [] })
  const [heuristic, setHeuristic] = useState<string>('');

  const cosmographRef = useRef<CosmographRef<Node, Link>>(null);

  const [selectedNode, setSelectedNode] = useState<Node | undefined>();
  const search = useRef<CosmographSearchRef<Node, Link>>(null);

  const [showLabelsFor, setShowLabelsFor] = useState<Node[] | undefined>(
    undefined
  );
  // Colores base
  const [baseHueColor, setBaseHueColor] = useState<number>(Math.floor(Math.random() * 254 + 1));


  // Event handler for uploading CSV file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.preventDefault()
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const csvBase64 = (reader.result as string).split(',')[1];
          socket.emit('influenceGraph', { csv_data: csvBase64 }, (status: string) => {
            if (status) console.log(status);
          });
          socket.on("users", (ids: string[]) => {
            const nodes = initializeNodes(ids);
            setNodes(nodes);
          });
          socket.on("influence_heuristic", (heuristic: { heuristic: Array<{ source: string; target: string; influenceValue: number }> }) => {
            Object.entries(heuristic).forEach(([heuristicName, heuristicLinks]) => {
              setHeuristicsLinks(prev => ({
                ...prev,
                [heuristicName]: heuristicLinks
              }));
              console.log({ heuristicName, heuristicLinks })

              setLinks(prev => {
                if (!prev.length) {
                  const { links, maxOutDegree, maxInfluence } = processEdges(heuristicLinks, setNodes)
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
          socket.on("stance_heuristic", stances => { processStance(stances, setNodes); console.log(stances) }
          )
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
  const getLinkColor = (link: Link) => {
    const hue = digraph ? baseHueColor : link?.influenceValue < 0 ? 0 : 100
    const saturation = Math.round(Math.abs(link?.influenceValue) / maxInfluence * 100);
    const newLightness = 100 - saturation / 2;
    return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
  };
  const onCosmographClick = useCallback<
    Exclude<CosmographInputConfig<Node, Link>["onClick"], undefined>
  >((n) => {
    search?.current?.clearInput();
    if (n) {
      cosmographRef.current?.zoomToNode(n)
      const adjancentNodes: Node[] = cosmographRef.current?.getAdjacentNodes(n.id) ?? []
      
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
    const noDigraph: HeuristicKey[] = ['agreement_links']
    setDigraph(!noDigraph.includes(heuristicName))
    const { links, maxOutDegree, maxInfluence } = processEdges(heuristicsLinks[heuristicName], setNodes)
    console.log(maxOutDegree, maxInfluence)
    setLinks(links);
    setMaxOutDegree(maxOutDegree);
    setMaxInfluence(maxInfluence);
    cosmographRef.current?.fitView();
    cosmographRef.current?.setZoomLevel(0.2, 3000)
    setHeuristic(event.target.value);
    
    //setShowLabelsFor(undefined);
    //setSelectedNode(undefined);
  }
useEffect(()=>{
  if (selectedNode){
    const updatedNode = nodes.find(node => node.id === selectedNode.id)
    if (updatedNode){
      setSelectedNode(updatedNode)
    }
  }
}, [nodes])

  return (
    <Box sx={{ height: "100px !important" }}>
      <CosmographProvider
        nodes={nodes}
        links={links}
      >
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
        <Box sx={{ position: "relative" }}>
          <HeuristicInfo heuristicLabel={heuristicLabel[heuristic as HeuristicKey]} nodeColor={`hsl(${baseHueColor}, 100%, 50%)`} />

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
            linkArrows={digraph}
            linkWidth={(link: Link) => Math.abs(link.influenceValue) || 0.1}
            linkColor={getLinkColor}
            
            simulationGravity={0.5}
            simulationRepulsion={200}//
            simulationRepulsionTheta={1}//1
            simulationLinkSpring={1}//1
            simulationLinkDistance={50}
            simulationFriction={0.5}

            disableSimulation={false}
            showDynamicLabels
            renderHoveredNodeRing
            showHoveredNodeLabel
            showTopLabelsValueKey={'outDegree'}
          />
          <Timeline baseHueColor={baseHueColor} />
        </Box>

      </CosmographProvider>
      {selectedNode && <SelectedUserInfo selectedNode={selectedNode} nodeColor={`hsl(${baseHueColor}, 100%, 50%)`}
        links={links} getLinkColor={getLinkColor} showLinkNodes={showLinkNodes} digraph={digraph} />
      }

    </Box>
  );
};


export default InfluenceGraph;
