import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import _, { throttle } from "lodash";

const width = 600;
const height = 450;
const margin = { top: 5, right: 5, bottom: 20, left: 35 };
const colorRange = [
  "#FF5733",
  "#FFC300",
  "#DAF7A6",
  "#00CC99",
  "#4C4CFF",
  "#2F4F4F",
  "#006064",
  "#C51162",
  "#FFD600",
  "#FF6D00",
  "#8BC34A",
  "#AD1457",
  "#A83E6C",
  "#6200EA",
  "#283593",
  "#212121",
  "#00838F",
  "#FF4081",
];

const SeasonSchoolHeatmap = ({ data }) => {
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const tooltipRef = useRef(null);

  // get the data
  const seasons = _.uniqBy(data, "season").map((film) => film.season);
  const episodes = _.uniqBy(data, "episode").map((film) => film.episode);

  const schools = _.uniqBy(data, "school").map((film) => film.school);
  const schoolCounts = _.countBy(data, "school");

  // create scales
  const xScale = d3
    .scaleBand()
    .domain(episodes)
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const yScale = d3
    .scaleBand()
    .domain(seasons)
    .range([height - margin.bottom, margin.top])
    .padding(0.1);

  // create color palette

  const schoolObj = schools.map((school, i) => {
    return {
      name: school,
      count: schoolCounts[school] || 0,
      color: colorRange[i],
    };
  });

  schoolObj.sort((a, b) => b.count - a.count);

  // Tooltip
  const updateTooltip = (event, d) => {
    const xOffset = 15; // Adjust the offset to your preference
    const yOffset = 15;

    const [pointerX, pointerY] = d3.pointer(event, svgRef.current);

    const tooltipX = pointerX + xOffset;
    const tooltipY = pointerY + yOffset;

    tooltipRef.current.style.opacity = 1;
    tooltipRef.current.style.transform = `translate(${tooltipX}px, ${tooltipY}px)`;
    tooltipRef.current.textContent = `Titre: ${d.title}
      Réalisateur: ${d.director}
      Saison: ${d.season}, Episode: ${d.episode}
      École: ${d.school}`;
  };

  const handleMouseOver = useCallback((event, d) => {
    d3.select(event.target).style("stroke", "black");
    updateTooltip(event, d);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMouseMove = useCallback(
    throttle((event, d) => {
      updateTooltip(event, d);
    }, 10),
    []
  );

  const handleMouseLeave = useCallback(() => {
    d3.select(event.target).style("stroke", "none");
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
        .attr(
          "fill",
          (d) => schoolObj.find((school) => school.name === d.school).color
        )
        .style("stroke-width", 4)
        .style("stroke", "none")
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMouseLeave);
    }
  };

  // Axes
  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      d3.select(xAxisRef.current)
        .call(xAxis.tickSize(0))
        .select(".domain") // select the axis line
        .remove();

      d3.select(xAxisRef.current)
        .selectAll(".tick text")
        .attr("text-anchor", "center")
        .text((d) => `E ${d}`)
        .style("font-size", 12)
        .style("font-weight", "bold");
    }
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale);
      d3.select(yAxisRef.current)
        .call(yAxis.tickSize(0))
        .select(".domain")
        .remove();
      // .style("stroke", "none");

      d3.select(yAxisRef.current)
        .selectAll(".tick text")
        .attr("text-anchor", "center")
        .text((d) => `S ${d}`)
        .style("font-size", 12)
        .style("font-weight", "bold");
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => draw(), [data]);

  return (
    <div className="flex">
      <svg ref={svgRef} width={width} height={height}>
        <g
          ref={xAxisRef}
          transform={`translate(0, ${height - margin.bottom})`}
        />
        <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`} />
      </svg>
      <div
        ref={tooltipRef}
        className="absolute w-40 whitespace-pre-line rounded-md border border-slate-900 bg-white p-1 text-xs opacity-0 shadow-lg"
      ></div>
      <div className="mt-1">
        {schoolObj.map((school) => (
          <div key={school.name}>
            <span
              className={"mr-1 inline-block h-3 w-3 rounded-xl"}
              style={{
                backgroundColor: school.color,
              }}
            ></span>
            {school.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonSchoolHeatmap;
