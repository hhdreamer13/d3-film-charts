import * as d3 from "d3";
import React, { useRef, useEffect } from "react";

const width = 800;
const height = 400;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

const EpisodeWordsBarChart = ({ data }) => {
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => draw(), [data]);

  const colorExtent = d3.extent(data, (d) => d.words).reverse();
  const colorScale = d3
    .scaleSequential()
    .domain(colorExtent)
    .interpolator(d3.interpolateInferno);

  // set domains on the scales
  const xDomain = data.map((d) => d.id);
  const yDomain = d3.extent(data, (d) => d.words + 30);

  // create scales
  const xScale = d3
    .scaleBand()
    .domain(xDomain)
    .range([margin.left, width - margin.right]);
  const yScale = d3
    .scaleLinear()
    .domain([0, Math.max(...yDomain)])
    .range([height - margin.bottom, 0]);

  const barWidth = (width - (margin.left + margin.right)) / data.length;

  const draw = () => {
    //grab elements and style/position
    if (svgRef.current) {
      d3.select(svgRef.current)
        .selectAll("rect")
        // helps D3.js to match the data elements by their index, and solve the problem with the transitions for the bars
        .data(data, (d, i) => i)
        .join(
          (enter) => {
            const rect = enter
              .append("rect")
              // attributes to transition FROM
              .attr("x", (d, i) => i * barWidth + margin.left)
              .attr("y", height - margin.bottom)
              .attr("height", 0);

            return rect;
          },
          (update) => {
            update
              .attr("stroke", "white") // Temporarily change the stroke color
              .attr("stroke-width", 4) // Increase the stroke width
              .transition()
              .duration(1000) // 1 second transition
              .attr("stroke", "black") // Revert the stroke color to black
              .attr("stroke-width", 2); // Revert the stroke width to 2

            return update;
          },
          (exit) => {
            exit
              .transition()
              .duration(1000)
              // everything after here is transition TO
              .attr("y", height - margin.bottom)
              // .attr("height", 0)
              .remove();
          }
        )
        .attr("width", xScale.bandwidth())
        .transition()
        .duration(1000)
        .attr("x", (d) => xScale(d.id))
        .attr("y", (d) => yScale(d.words))
        .attr("height", (d) => height - margin.bottom - yScale(d.words))
        .style("fill", (d) => colorScale(d.words))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    }
  };

  // Draw the axis
  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      d3.select(xAxisRef.current)
        .transition()
        .duration(1000)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "end")
        .style("font-size", "5px")
        .attr("dx", "4em")
        .attr("dy", "-1.5em");
    }

    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale);
      d3.select(yAxisRef.current).transition().duration(1000).call(yAxis);
    }
  }, [xScale, yScale]);

  //create elements (but without anything special)
  // const bars = filteredData.map((d) => <rect key={d.id} />);

  return (
    <svg width={width} height={height} ref={svgRef}>
      {/* {bars} */}
      <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
      <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`} />
    </svg>
  );
};

export default EpisodeWordsBarChart;
