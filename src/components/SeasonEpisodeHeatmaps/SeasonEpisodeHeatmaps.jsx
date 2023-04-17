import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import _, { throttle } from "lodash";
import Legend from "../SeasonSchoolHeatmap/Legend";
import ToggleSwitch from "../ToggleSwitch";

const width = 600;
const height = 450;
const margin = { top: 5, right: 5, bottom: 20, left: 35 };
const technicolor = [
  { name: "Traditionnelle", color: "#1b0c41" },
  { name: "Numérique", color: "#721a6e" },
  { name: "Papiers découpés", color: "#c63d4d" },
  { name: "Volume", color: "#f8890c" },
  { name: "Variée", color: "#f1ef75" },
];
const schoColor = [
  { name: "La Poudrière", color: "#FF5733" },
  { name: "EMCA", color: "#FFC300" },
  { name: "ENSAD", color: "#DAF7A6" },
  { name: "Les Gobelins", color: "#4C4CFF" },
  { name: "Atelier de Sèvres", color: "#00CC99" },
  { name: "Rubika", color: "#454d66" },
  { name: "L'Atelier", color: "#B39CD0" },
  { name: "Émile Cohl", color: "#75448B" },
  { name: "ESAAT", color: "#DAD873" },
  { name: "Georges Méliès", color: "#FF6D00" },
  { name: "Ste Geneviève", color: "#8BC34A" },
  { name: "LISAA", color: "#AD1457" },
  { name: "Marie-Curie", color: "#0098C9" },
  { name: "Pivaut", color: "#6200EA" },
  { name: "Estienne", color: "#283593" },
  { name: "EESAB", color: "#A6A6A6" },
  { name: "ECV Bordeaux", color: "#391C77" },
];

const SeasonEpisodeHeatmaps = ({ data }) => {
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const tooltipRef = useRef(null);

  // Data change
  const [chartVar, setChartVar] = useState("school");

  // get the data
  const seasons = _.uniqBy(data, "season").map((film) => film.season);
  const episodes = _.uniqBy(data, "episode").map((film) => film.episode);

  const techniques = _.uniqBy(data, "technique").map((film) => film.technique);
  const schools = _.uniqBy(data, "school").map((film) => film.school);

  // Schools Objects
  const schoolCounts = _.countBy(data, "school");
  const schoolsObj = schools.map((school) => {
    return {
      name: school,
      count: schoolCounts[school] || 0,
      color: schoColor.find((s) => s.name === school).color,
    };
  });

  schoolsObj.sort((a, b) => b.count - a.count);

  // Technique Objects
  const techniquesCounts = _.countBy(data, "technique");
  const techniquesObj = techniques.map((technique) => {
    return {
      name: technique,
      count: techniquesCounts[technique] || 0,
      color: technicolor.find((t) => t.name === technique).color,
    };
  });

  techniquesObj.sort((a, b) => b.count - a.count);

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
    Technique: ${d.technique}
      École : ${d.school}
      Saison: ${d.season}, Episode: ${d.episode}`;
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
      // eslint-disable-next-line no-unused-vars
      const rects = d3
        .select(svgRef.current)
        .selectAll("rect")
        .data(data, (d) => d.id)
        .join(
          (enter) => {
            const rect = enter
              .append("rect")
              // attributes to transition from
              .attr("fill", "black")
              .attr("opacity", 0);

            return rect;
          },
          (update) => update,
          (exit) => {
            exit
              .transition()
              .duration(1500)
              // everything after here is transition TO
              .attr("opacity", 0)
              .attr("fill", (d) =>
                chartVar === "technique"
                  ? techniquesObj.find((item) => item.name === d.technique)
                      .color
                  : schoolsObj.find((item) => item.name === d.school).color
              );
          }
        )
        .attr("x", (d) => xScale(d.episode))
        .attr("y", (d) => yScale(d.season))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseleave", handleMouseLeave)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr("opacity", 1)
        .attr("fill", (d) =>
          chartVar === "technique"
            ? techniquesObj.find((item) => item.name === d.technique).color
            : schoolsObj.find((item) => item.name === d.school).color
        )
        .style("stroke-width", 4)
        .style("stroke", "none");
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
  useEffect(() => draw(), [data, chartVar]);

  return (
    <div>
      <div className="flex justify-end">
        <ToggleSwitch
          checked={chartVar === "school"}
          onChange={() => {
            setChartVar(chartVar === "school" ? "technique" : "school");
          }}
        />
      </div>
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
          className="absolute z-30 w-40 whitespace-pre-line rounded-md border border-slate-900 bg-white p-1 text-xs opacity-0 shadow-lg"
        ></div>
        <div id="legends-container" className="relative w-40">
          <div
            className={
              "absolute z-0 transition-all duration-1000 ease-in-out " +
              `${chartVar === "technique" ? "opacity-100" : "opacity-0"}`
            }
          >
            <Legend obj={techniquesObj} />
          </div>
          <div
            className={
              "absolute z-0 transition-all duration-1000 ease-in-out " +
              `${chartVar === "school" ? "opacity-100" : "opacity-0"}`
            }
          >
            <Legend obj={schoolsObj} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonEpisodeHeatmaps;
