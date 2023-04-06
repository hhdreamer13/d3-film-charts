import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import _ from "lodash";

const width = 800;
const height = 600;
const margin = { top: 50, right: 5, bottom: 20, left: 35 };
const colorRange = [
  "#6719a8",
  "#8519a8",
  "#9719a8",
  "#a8199b",
  "#141885",
  "#e54d52",
  "#e5674d",
  "#e5874d",
  "#e59a4d",
  "#e5ba4d",
  "#e5d94d",
  "#4a19a8",
  "#a8197d",
  "#148485",
  "#146d85",
  "#145585",
  "#144785",
  "#142f85",
];

const SchoolTechnique = ({ data }) => {
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const [tooltipData, setTooltipData] = useState(null);

  // get the data
  const seasons = _.uniqBy(data, "season").map((film) => film.season);
  const episodes = _.uniqBy(data, "episode").map((film) => film.episode);
  const schools = _.uniqBy(data, "school").map((film) => film.school);

  // create scales
  const xScale = d3
    .scaleBand()
    .domain(episodes)
    .range([margin.left, width - margin.right])
    .padding(0.05);

  const yScale = d3
    .scaleBand()
    .domain(seasons)
    .range([height - margin.bottom, margin.top])
    .padding(0.05);

  // create color palette
  const colorScale = d3.scaleOrdinal().domain(schools).range(colorRange);

  //tooltip

  const handleMouseOver = (event, d) => {
    setTooltipData(d);
  };

  const handleMouseMove = (event) => {
    // set tooltip position
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  const draw = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .selectAll("rect")
        .data(data, (d) => d.id)
        .join("rect")
        .attr("x", (d) => xScale(d.episode))
        .attr("y", (d) => yScale(d.season))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => colorScale(d["school"]))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8);
      // .on("mouseover", handleMouseOver)
      // .on("mousemove", handleMouseMove)
      // .on("mouseleave", handleMouseLeave);

      d3.select(svgRef.current)
        .selectAll("mydots")
        .data(schools)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => 50 + i * 40) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("cy", 35)
        .attr("r", 7)
        .style("fill", (d) => colorScale(d));

      d3.select(svgRef.current)
        .selectAll("myLabels")
        .data(schools)
        .enter()
        .append("text")
        .attr("x", (d, i) => 50 + i * 40) // Position the text to the right of the circle
        .attr("y", (d, i) => (i % 2 === 0 ? 25 : 15)) // Position the text above the circle
        .style("fill", (d) => colorScale(d))
        .text((d) => d)
        .attr("text-anchor", "center")
        .style("font-size", "12px");
    }
  };

  const tooltip = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");
    }
  };

  // Axes
  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      d3.select(xAxisRef.current)
        .call(xAxis)
        .select(".domain") // select the axis line
        .style("stroke", "none"); // hide the axis line

      d3.select(xAxisRef.current)
        .selectAll(".tick text")
        .attr("text-anchor", "center")
        .text((d) => `E ${d}`);
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale);
      d3.select(yAxisRef.current)
        .call(yAxis)
        .select(".domain")
        .style("stroke", "none");

      d3.select(yAxisRef.current)
        .selectAll(".tick text")
        .attr("text-anchor", "center")
        .text((d) => `S ${d}`);
    }
  });

  useEffect(() => draw(), [data]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g
        className=""
        ref={xAxisRef}
        transform={`translate(0, ${height - margin.bottom})`}
      />
      <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`} />
    </svg>
  );
};

export default SchoolTechnique;
