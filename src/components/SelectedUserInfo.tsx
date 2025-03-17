import { Person } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Card, CardContent, CardHeader, Chip, Collapse, IconButton, IconButtonProps, ListItem, ListItemAvatar, ListItemButton, ListItemText, styled, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import { useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Link, Node } from '../data';
import "./styles.css";

function CircularProgressWithLabel(
    props: CircularProgressProps & { node: Node, children: JSX.Element | JSX.Element[] },
) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={Number((props.node.belief ? props.node.belief * 100 : 0).toFixed(1))} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {props.children}

            </Box>
        </Box>
    );
}

const nodeInfo = (props: ListChildComponentProps) => {
    const { index, style, data } = props;
    const { nodeInfluenced, showLinkNodes, digraph, getLinkNameColor, getNode } = data;
    const link: {
        source: string,
        target: string,
        date?: string[],
        influenceValues: {
            [key: string]: number
        },
    } = nodeInfluenced[index];

    if (!link) {
        return <></>;
    }
    return (
        <ListItem style={style} key={index} component="div" disablePadding >
            <ListItemButton sx={{ padding: "2px 16px" }} onClick={() => showLinkNodes(link)}>
                <ListItemAvatar sx={{ minWidth: "50px" }}>
                    <CircularProgressWithLabel node={getNode(link.target)}>
                        <SupervisorAccountIcon />
                    </CircularProgressWithLabel>
                </ListItemAvatar>
                <ListItemText
                    primary={`@${link?.target}`}
                    secondary={<Box display={"flex"}>
                        {Object.entries(link.influenceValues).map(([key, value], index) => (
                            <Chip
                                key={index}
                                label={`${key}: ${(value * 100).toFixed(1)}%`}
                                size='small'
                                sx={digraph ? { backgroundColor: `hsl(${getLinkNameColor(key)}, 100%, 60%)`, color: getLinkNameColor(key) == 240 ? "white" : "black" } : { backgroundColor: `hsl(${value < 0 ? 0 : 100}, 100%, 50%)` }}
                            />
                        ))}
                    </Box>}
                    sx={{ margin: "0" }}
                />
            </ListItemButton>

        </ListItem>
    );
}

const SelectedUserInfo = ({ selectedNode, links, showLinkNodes, digraph, getLinkNameColor, getNode }: { selectedNode: Node, links: Link[], showLinkNodes: (link: Link) => void, digraph: boolean, getLinkNameColor: (name: string) => number, getNode: (id: string) => Node | undefined }) => {
    const [expanded, setExpanded] = useState(false);
    let nodeLinks: Link[] = links
        .filter(link => link.source === selectedNode?.id)
        .sort((a, b) => a.target.localeCompare(b.target))
        ;
    let influencedNodes = nodeLinks.reduce((acc, link) => {
        if (!acc[link.target]) {
            acc[link.target] = { source: link.source, target: link.target, date: link.date, influenceValues: {} };
        }
        acc[link.target].influenceValues[link.link_name] = link.influenceValue
        return acc
    }, {} as { [key: string]: { source: string, target: string, date?: string[], influenceValues: { [key: string]: number } } })
    const nodeInfluenced = Object.values(influencedNodes)
    interface ExpandMoreProps extends IconButtonProps {
        expand: boolean;
    }
    const ExpandMore = styled((props: ExpandMoreProps) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
    })(({ theme }) => ({
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        variants: [
            {
                props: ({ expand }) => !expand,
                style: {
                    transform: 'rotate(180deg)',
                },
            },
            {
                props: ({ expand }) => !!expand,
                style: {
                    transform: 'rotate(0deg)',
                },
            },
        ],
    }));
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    return (
        <div className="infoStyle">
            <Card sx={{ width: "100%", gap: 1, overflow: "clip" }}>
                <CardContent
                    sx={{
                        padding: "8px !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, minWidth: 0 }}>
                        <CardHeader
                            sx={{
                                padding: "4px",
                                flexGrow: 1,
                                minWidth: 0
                            }}
                            avatar={
                                <CircularProgressWithLabel
                                    node={selectedNode}
                                >
                                    <Person />
                                </CircularProgressWithLabel>
                            }
                            title={`@${selectedNode?.id}`}
                            component='div'
                            subheader={
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'GrayText' }}>
                                        {selectedNode?.outDegree} nodos influenciados
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <Typography variant="body2" noWrap sx={{ color: 'GrayText' }}>
                                            {selectedNode.belief || selectedNode.belief === 0
                                                ? `${(selectedNode.belief * 100).toFixed(1)}% de acuerdo`
                                                : 'Creencia Indeterminado'}
                                        </Typography>
                                        <Typography variant="body2" noWrap sx={{ color: 'GrayText' }}>
                                            {selectedNode.confidence || selectedNode.confidence === 0
                                                ? `${(selectedNode.confidence * 100).toFixed(1)}% en confianza`
                                                : 'Confianza Indeterminado'}
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        />
                    </Box>

                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                        sx={{ marginLeft: "auto" }}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardContent>


                <Collapse
                    in={expanded}
                    timeout="auto"
                    unmountOnExit
                    sx={{ width: '100%', bgcolor: 'background.paper' }}
                >
                    <FixedSizeList
                        height={550}
                        width={450}
                        itemSize={46}
                        itemCount={nodeInfluenced.length}
                        itemData={{ nodeInfluenced, showLinkNodes, digraph, getLinkNameColor, getNode }}
                        style={{ width: "100%", overflowY: "scroll" }}
                    >
                        {nodeInfo}
                    </FixedSizeList>
                </Collapse>
            </Card>


        </div>
    )
}

export default SelectedUserInfo;