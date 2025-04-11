import { Cosmograph, CosmographRef } from '@cosmograph/react';
import { RefObject } from 'react';
import { Link, Node, getHueIndexColor } from '../data';
import "./styles.css";

const InfluenceGraph = ({ maxOutDegree, linksNames, baseHueColor, cosmographRef, showLabelsFor, onCosmographClick }: {
  maxOutDegree: number,
  linksNames: { [key: string]: { active: boolean, cant: number } },
  baseHueColor: number,
  cosmographRef: RefObject<CosmographRef<Node, Link>>, showLabelsFor: Node[],
  onCosmographClick: (clickedNode: Node | undefined, index: number | undefined, nodePosition: [number, number] | undefined, event: MouseEvent) => void
}) => {


  const getNodeColor = (node: Node | undefined) => {
    if (!node) return `hsl(${baseHueColor}, 0%, 100%)`
    const saturation = Math.round(node.outDegree / maxOutDegree * 100) + 20;
    const newLightness = 100 - saturation / 2;
    return `hsl(${baseHueColor}, ${saturation}%, ${newLightness}%)`;
  };

  const getLinkColor = (link: Link) => {
    const linkKeys = Object.keys(linksNames);
    const keyIndex = linkKeys.indexOf(link.link_name);

    const hue = link.link_name !== "Acuerdo/Desacuerdo" ? getHueIndexColor(keyIndex, baseHueColor) : link?.influenceValue < 0 ? 0 : 100;
    const saturation = Math.round(Math.abs(link?.influenceValue) * 100);
    const lightness = 100 - saturation / 2;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
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
      simulationRepulsionTheta={1}//1
      simulationLinkSpring={1}//1
      simulationLinkDistance={100}
      simulationFriction={0.75}
      disableSimulation={false}
      showDynamicLabels
      renderHoveredNodeRing
      showHoveredNodeLabel
      showTopLabelsValueKey={'outDegree'}
    />
  );
};

export default InfluenceGraph;