import { Cosmograph, CosmographInputConfig, CosmographProvider, CosmographRef, CosmographSearch, CosmographSearchInputConfig, CosmographSearchRef } from '@cosmograph/react';
import { useCallback, useRef, useState } from 'react';
import "../assets/styles.css";
import { Link, Node, parseCSVToNodes } from '../data';

const Display = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [maxOutDegree, setMaxOutDegree] = useState<number>(1);
  const [maxInfluence, setMaxInfluence] = useState<number>(0);
  const cosmographRef = useRef<CosmographRef<Node, Link>>(null);
  const [selectedNode, setSelectedNode] = useState<Node | undefined>();
  const search = useRef<CosmographSearchRef<Node, Link>>(null);
  const [showLabelsFor, setShowLabelsFor] = useState<Node[] | undefined>(
    undefined
  );
  // Event handler for uploading CSV file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseCSVToNodes(file).then(({ nodes, links }) => {
        setNodes(nodes);
        for (const node of nodes) setMaxOutDegree(prev => (node.outDegree > prev) ? node.outDegree : prev)
        setLinks(links);
        for (const link of links) setMaxInfluence(prev => (link.influenceValue > prev) ? link.influenceValue : prev)
      });
    }
  };


  // Colores base
  const baseHueColor: Number = Math.floor(Math.random() * 256);
  const getNodeColor = (node: Node) => {
    const saturation = Math.round(node.outDegree / maxOutDegree * 100) + 20;
    const newLightness = 100 - saturation / 2;
    return `hsl(${baseHueColor}, ${saturation}%, ${newLightness}%)`;
  };
  const getLinkColor = (link: Link) => {
    const saturation = Math.round(link.influenceValue / maxInfluence * 100);
    const newLightness = 100 - saturation / 2;
    return `hsl(${baseHueColor}, ${saturation}%, ${newLightness}%)`;
  };
  const onCosmographClick = useCallback<
    Exclude<CosmographInputConfig<Node, Link>["onClick"], undefined>
  >((n) => {
    search?.current?.clearInput();
    if (n) {
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


  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".csv" />
      <CosmographProvider
        nodes={nodes}
        links={links}
      >
        <CosmographSearch
          ref={search}
          className="searchStyle"
          onSelectResult={onSearchSelectResult}
          maxVisibleItems={20}
        />
        <Cosmograph
          ref={cosmographRef}
          //spaceSize={4096}
          curvedLinks
          onClick={onCosmographClick}
          showLabelsFor={showLabelsFor}
          simulationCenter={-1}

          nodeSize={(node: Node) => node.outDegree/1.5 }
          nodeColor={getNodeColor}
          linkWidthScale={1}
          linkArrowsSizeScale={1}
          linkArrows
          linkWidth={(link: Link) => link.influenceValue || 0.1}
          linkColor={getLinkColor}
          linkVisibilityDistanceRange={[0,20]}
          
          simulationGravity={0}
          simulationRepulsion={5}
          simulationRepulsionTheta={0}
          simulationLinkSpring={0.1}
          simulationLinkDistance={20}
          simulationFriction={0.2}
          
          disableSimulation={false}
          renderHoveredNodeRing
          showHoveredNodeLabel

          showTopLabelsValueKey={'outDegree'}


        />
        <div className="sidebarStyle">
          {selectedNode ? (
            <div className="infoStyle">
              {`id: ${selectedNode?.id}
            Out degree: ${selectedNode?.outDegree}`}
            </div>
          ) : (
            <></>
          )}

        </div>
      </CosmographProvider>

    </div>
  );
};

export default Display;
