import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Avatar, Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, ListItem, ListItemAvatar, ListItemButton, ListItemText, styled } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import { useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import "../assets/styles.css";
import { Link, Node } from '../data';
function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number, backColor: string },
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
                <SupervisorAccountIcon />
            </Box>
        </Box>
    );
}

const nodeInfo = (props: ListChildComponentProps) => {
    const { index, style, data } = props;
    const { nodeLinks, getLinkColor, showLinkNodes } = data;
    const link = nodeLinks[index];


    return (
        <ListItem style={style} key={index} component="div" disablePadding >
            <ListItemButton sx={{ padding: "2px 16px" }} onClick={() => showLinkNodes(link)}>
                <ListItemAvatar sx={{ minWidth: "50px" }}>
                    <CircularProgressWithLabel value={(link?.influenceValue * 100)} backColor={getLinkColor(link)} />
                </ListItemAvatar>
                <ListItemText
                    primary={`@${link.target}`}
                    secondary={`Influencia: ${(link.influenceValue * 100).toFixed(1)}%`}
                    sx={{ margin: "0" }}
                />
            </ListItemButton>

        </ListItem>
    );
}

const SelectedUserInfo = ({ selectedNode, nodeColor, links, getLinkColor, showLinkNodes }: { selectedNode: Node, nodeColor: string, links: Link[], getLinkColor: (Link: Link) => string, showLinkNodes: (link: Link) => void }) => {
    const [expanded, setExpanded] = useState(false);
    const nodeLinks: Link[] = links.filter(link => link.source === selectedNode?.id);
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
                                <Avatar aria-label="recipe" sx={{ bgcolor: nodeColor }} />
                            }
                            title={`@${selectedNode?.id}`}
                            subheader={`${selectedNode?.outDegree} nodos influenciados`}
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
                            width={300}
                            itemSize={46}
                            itemCount={selectedNode?.outDegree}
                            itemData={{ nodeLinks, getLinkColor, showLinkNodes }}
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