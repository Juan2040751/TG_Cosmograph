import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, ListItem, ListItemAvatar, ListItemButton, ListItemText, styled, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import { useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Link, Node } from '../data';
import "./styles.css";
function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number | undefined, backColor: string, children: JSX.Element | JSX.Element[] },
) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={props.value} sx={{ color: props.backColor }} />
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
    const { nodeLinks, nodeColor, showLinkNodes, digraph } = data;
    const link = nodeLinks[index];

    if (!link) {
        return <></>;
    }
    return (
        <ListItem style={style} key={index} component="div" disablePadding >
            <ListItemButton sx={{ padding: "2px 16px" }} onClick={() => showLinkNodes(link)}>
                <ListItemAvatar sx={{ minWidth: "50px" }}>
                    <CircularProgressWithLabel value={(link?.influenceValue * 100)} backColor={digraph ? nodeColor : `hsl(${link?.influenceValue < 0 ? 0 : 100}, 100%, 50%)`}>
                        <SupervisorAccountIcon />
                    </CircularProgressWithLabel>
                </ListItemAvatar>
                <ListItemText
                    primary={`@${link?.target}`}
                    secondary={`Influencia: ${(link.influenceValue * 100).toFixed(1)}%`}
                    sx={{ margin: "0" }}
                />
            </ListItemButton>

        </ListItem>
    );
}

const SelectedUserInfo = ({ selectedNode, nodeColor, links, showLinkNodes, digraph }: { selectedNode: Node, nodeColor: string, links: Link[], getLinkColor: (Link: Link) => string, showLinkNodes: (link: Link) => void, digraph: boolean }) => {
    const [expanded, setExpanded] = useState(false);
    const nodeLinks: Link[] = links
        .filter(link => link.source === selectedNode?.id)
        .sort((a, b) => a.target.localeCompare(b.target));
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
                    transform: 'rotate(0deg)',
                },
            },
            {
                props: ({ expand }) => !!expand,
                style: {
                    transform: 'rotate(180deg)',
                },
            },
        ],
    }));
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    return (
        <div className="sidebarStyle">
            <div className="infoStyle">
                <Card >
                    <CardContent sx={{ padding: "8px !important", display: "flex" }}>
                        <CardHeader
                            sx={{ padding: "4px" }}
                            avatar={
                                <CircularProgressWithLabel value={selectedNode.belief ? (selectedNode.belief * 100).toFixed(1) : 0} backColor={nodeColor}>
                                    <Typography
                                        variant="caption"
                                        component="div"
                                        sx={{ color: 'text.secondary' }}
                                    >{`${selectedNode.belief ||  selectedNode.belief== 0? (selectedNode.belief * 100).toFixed(1) : ''}%`}</Typography></CircularProgressWithLabel>
                            }
                            title={`@${selectedNode?.id}`}
                            subheader={`${selectedNode?.outDegree} nodos influenciados\n${selectedNode.belief || selectedNode.belief == 0? (selectedNode.belief * 100).toFixed(1)+ "% de acuerdo": 'Creencia Indeterminado'}`}
                        />
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="show more"
                        >
                            <ExpandMoreIcon />
                        </ExpandMore>
                    </CardContent>
                    <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }}>
                        <FixedSizeList
                            height={400}
                            width={360}
                            itemSize={46}
                            itemCount={selectedNode?.outDegree}
                            itemData={{ nodeLinks, nodeColor, showLinkNodes, digraph }}
                            style={{ width: "100%", overflowY: "scroll" }}
                        >
                            {nodeInfo}
                        </FixedSizeList>
                    </Collapse>
                </Card>

            </div>

        </div>
    )
}

export default SelectedUserInfo;