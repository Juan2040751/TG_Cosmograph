import { Cosmograph, CosmographInputConfig, CosmographProvider, CosmographRef, CosmographSearch, CosmographSearchInputConfig, CosmographSearchRef } from '@cosmograph/react';
import { useCallback, useRef, useState } from 'react';
import "../assets/styles.css";
import { Link, Node, parseCSVToNodes } from '../data';
import io from 'socket.io-client';
import SelectedUserInfo from './SelectedUserInfo';

const socket = io("http://localhost:5000");

const InfluenceGraph = () => {
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
  // Colores base
  const [baseHueColor, setBaseHueColor] = useState<number>(Math.floor(Math.random() * 256));

  
  // Event handler for uploading CSV file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.preventDefault()
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {  // Verificación de nulidad
          const csvBase64 = (reader.result as string).split(',')[1];
          socket.emit('influenceGraph', { csv_data: csvBase64 }, (status: string) => {
            console.log(status);
          });
          socket.on("users", nodes => setNodes(nodes)); 
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
    const saturation = Math.round(link?.influenceValue / maxInfluence * 100);
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

  const getNodeById = (id: string) => nodes.find(node => node.id === id)


  const showLinkNodes = (link: Link) => {
    const source = nodes.find(n => n.id === link.source)
    const target = nodes.find(n => n.id === link.target)
    console.log("he", source, target)
    if (source && target) {
      setShowLabelsFor([source, target])
      cosmographRef.current?.selectNodes([source, target])
      cosmographRef.current?.fitViewByNodeIds([source.id, target.id])
    }
  }
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

          nodeSize={(node: Node) => node.outDegree / 1.5}
          nodeColor={getNodeColor}
          nodeLabelColor={"white"}
          hoveredNodeLabelColor={`hsl(${baseHueColor}, 100%, 50%)`}
          linkWidthScale={1}
          linkArrowsSizeScale={1}
          linkArrows
          linkWidth={(link: Link) => link.influenceValue || 0.1}
          linkColor={getLinkColor}
          linkVisibilityDistanceRange={[0, 20]}

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

      </CosmographProvider>
      {selectedNode ? <SelectedUserInfo selectedNode={selectedNode} nodeColor={getNodeColor(selectedNode)} links={links} getLinkColor={getLinkColor} showLinkNodes={showLinkNodes} /> : <></>}

    </div>
  );
};

export default InfluenceGraph;
