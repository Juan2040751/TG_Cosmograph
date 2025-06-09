import { CosmographHistogram, CosmographHistogramRef } from '@cosmograph/react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Accordion, AccordionDetails, AccordionSummary, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import * as d3 from "d3";
import { useEffect, useRef, useState } from 'react';
import { Node } from "../data";
const Histogram = ({ baseHueColor, maxOutDegree, nodes, nodesInfo }: {
    baseHueColor: number, maxOutDegree: number, nodes: Node[], nodesInfo: {
        confidence: boolean, belief: boolean, degree: boolean
    }
}) => {
    type NodeAttribute = "confidence" | "belief" | "outDegree";
    const histogramRef = useRef<CosmographHistogramRef<Node>>(null);
    const [histoValue, setHistoValue] = useState<NodeAttribute>("outDegree");
    const axisXRef = useRef<SVGGElement>(null);
    const axisYRef = useRef<SVGGElement>(null);
    const componentWidth = 400;
    const componentHeight = 200;
    const accessorFunction = (d: Node) => {
        if (histoValue === "outDegree") {
            return d.outDegree;
        } else {
            return d[histoValue] ? d[histoValue] * 100 : -1;
        }
    };
    useEffect(() => {
        const axisElement = axisXRef.current;
        if (!axisElement) return;
        const histogramElement = document.getElementById("CosmographHistogram");
        const width = histogramElement?.getBoundingClientRect().width ?? 400;

        const xDomain = histoValue === "outDegree" ? [0, maxOutDegree] : [-1, 100];
        const xScale = d3.scaleLinear()
            .domain(xDomain as [number, number])
            .range([0, width - 11]);

        const axisX = d3.axisBottom(xScale)
            .ticks(10)
            .tickFormat(d3.format(".0f"));
        d3.select(axisElement).call(axisX);

        const height = histogramElement?.getBoundingClientRect().height ?? 144;
        const values = nodes.map(accessorFunction);
        const bins = d3.histogram()
            .domain(xDomain as [number, number])
            .thresholds(d3.range(xDomain[0], xDomain[1] + 1, 1))(values);
        const maxY = d3.max(bins, d => d.length) ?? 1;
        const yScale = d3.scaleLinear().domain([0, maxY]).range([height - 22, 0]);
        const axisY = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format("~s"));
        if (axisYRef.current) d3.select<SVGGElement, unknown>(axisYRef.current).call(axisY);

    }, [maxOutDegree, histoValue]);

    const handleChange = (event: SelectChangeEvent) => {
        setHistoValue(event.target.value as NodeAttribute);
    };



    return (
        <Accordion defaultExpanded sx={{ position: "absolute", left: "10px", top: "15px", zIndex: 1 }}>
            <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                sx={{ padding: "0px 8px", minHeight: "45px !important" }}
            >
                <Typography variant='body1'>Distribución de Nodos</Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ padding: "0px 12px 0px !important", overflowY: "auto", scrollbarColor: "auto", width: "420", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FormControl fullWidth variant='standard' sx={{ width: componentWidth }}>
                    <InputLabel>Histograma</InputLabel>
                    <Select value={histoValue} onChange={handleChange}>
                        <MenuItem value={"confidence"} disabled={!nodesInfo.confidence}>Confianza</MenuItem>
                        <MenuItem value={"belief"} disabled={!nodesInfo.belief}>Creencia</MenuItem>
                        <MenuItem value={"outDegree"} disabled={!nodesInfo.degree}>Nodos Influenciados</MenuItem>
                    </Select>
                </FormControl>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <svg width={30} height={componentHeight + 10}>
                        <g ref={axisYRef} transform="translate(28, 16)" />
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <CosmographHistogram
                            key={histoValue}
                            style={{
                                '--cosmograph-histogram-bar-color': `hsl(${baseHueColor}, 100%, 50%)`,
                                '--cosmograph-histogram-background': "white",
                                '--cosmograph-histogram-axis-color': `white`,
                                width: componentWidth,
                                height: componentHeight,
                            }}

                            formatter={d => d >= 0 ? (histoValue === "outDegree" ? String(d) : "100") : "None"}
                            dataStep={1}
                            accessor={accessorFunction}
                            ref={histogramRef}
                            minBarHeight={0}
                            allowSelection
                            labelSideMargin={0}

                        />
                        <svg width={componentWidth + 10} height={20}>
                            <g ref={axisXRef} transform="translate(5, 0)" />
                        </svg>
                    </div>
                </div>

            </AccordionDetails>
        </Accordion>
    );
};

export default Histogram;
