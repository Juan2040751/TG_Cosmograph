import { CosmographHistogram, CosmographHistogramRef } from '@cosmograph/react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Node } from "../data";
import * as d3 from "d3";

const Histogram = ({ baseHueColor, maxOutDegree }: { baseHueColor: number, maxOutDegree: number }) => {
    type NodeAttribute = "confidence" | "belief" | "outDegree";
    const histogramRef = useRef<CosmographHistogramRef<Node>>(null);
    const [histoValue, setHistoValue] = useState<NodeAttribute>("outDegree");
    const axisRef = useRef<SVGGElement>(null);

    useEffect(() => {
        const axisElement = axisRef.current;
        if (!axisElement) return;
        const histogramElement = document.getElementById("CosmographHistogram");
        const rectHistogramWidth = histogramElement?.getBoundingClientRect().width ?? 368;
        console.log(rectHistogramWidth)
        const scale = d3.scaleLinear()
            .domain([histoValue === "outDegree" ? 0 : -1, histoValue === "outDegree" ? maxOutDegree : 100])
            .range([0, rectHistogramWidth-10]);

        const axis = d3.axisBottom(scale)
            .ticks(10)
            .tickFormat(d3.format(".0f"));
        d3.select(axisElement).call(axis);
    }, [maxOutDegree, histoValue]);

    const handleChange = (event: SelectChangeEvent) => {
        setHistoValue(event.target.value as NodeAttribute);
    };

    const accesorFunction = (d: Node) => {
        if (histoValue === "outDegree") {
            return d.outDegree;
        } else {
            return d[histoValue] ? d[histoValue] * 100 : -1;
        }
    };

    return (
        <Box position="relative">
            <Typography variant='body1' sx={{ marginTop: "8px" }}>Nodos</Typography>
            <FormControl fullWidth variant='standard' sx={{ m: 1, width: 340 }}>
                <InputLabel>Histograma</InputLabel>
                <Select value={histoValue} onChange={handleChange}>
                    <MenuItem value={"confidence"}>Confianza</MenuItem>
                    <MenuItem value={"belief"}>Creencia</MenuItem>
                    <MenuItem value={"outDegree"}>Nodos Influenciados</MenuItem>
                </Select>
            </FormControl>

            <CosmographHistogram
                key={histoValue}
                style={{
                    '--cosmograph-histogram-bar-color': `hsl(${baseHueColor}, 100%, 50%)`,
                    '--cosmograph-histogram-background': "white",
                    '--cosmograph-histogram-axis-color': `black`,
                }}

                formatter={d => d >= 0 ? (histoValue === "outDegree" ? String(d) : "100") : "None"}

                dataStep={1}
                accessor={accesorFunction}
                ref={histogramRef}
                minBarHeight={0}
                allowSelection
                labelSideMargin={0}

            />
            <svg width={375} height={20}>
                <g ref={axisRef} transform="translate(5, 0)" />
            </svg>

        </Box>
    );
};

export default Histogram;
