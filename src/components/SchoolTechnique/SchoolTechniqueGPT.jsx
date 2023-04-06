import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import _ from "lodash";

const width = 800;
const height = 600;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

const SchoolTechniqueGPT = ({ data }) => {
  const svgRef = useRef(null);

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
  const colorScale = d3
    .scaleOrdinal()
    .domain(schools)
    .range(d3.schemeCategory10);

  // create tooltip div
  const tooltipRef = useRef(null);

  // define event handlers for tooltip div
  // eslint-disable-next-line no-unused-vars
  const handleMouseOver = useCallback((event, d) => {
    tooltipRef.current.style.opacity = 1;
    tooltipRef.current.style.transform = `translate(${event.pageX}px, ${
      event.pageY - tooltipRef.current.clientHeight - 10
    }px)`;
  }, []);

  const handleMouseMove = useCallback((event, d) => {
    tooltipRef.current.innerHTML = `Season: ${d.season}, Episode: ${d.episode}, School: ${d.school}`;
    tooltipRef.current.style.transform = `translate(${event.pageX}px, ${
      event.pageY - tooltipRef.current.clientHeight - 10
    }px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    tooltipRef.current.style.opacity = 0;
  }, []);

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
        .attr("fill", (d) => colorScale(d.school))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMouseLeave);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => draw(), [data]);

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
      {data.map((d) => (
        <div
          key={d.id}
          ref={tooltipRef}
          style={{ position: "absolute", opacity: 0, background: "white" }}
        ></div>
      ))}
    </div>
  );
};

export default SchoolTechniqueGPT;
