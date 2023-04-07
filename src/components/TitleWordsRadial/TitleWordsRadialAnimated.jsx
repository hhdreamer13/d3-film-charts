import { useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import d3ColorExtractor from "../../utils/d3ColorExtractor";
import drawTitleWordsRadial from "./drawTitleWordsRadial";

const margin = { top: 5, right: 5, bottom: 20, left: 35 };
const width = 750 - margin.left - margin.right;
const height = 750 - margin.top - margin.bottom;
const innerRadius = 90;
const outerRadius = Math.min(width, height) / 2; // the outerRadius goes from the middle of the SVG area to the border

const TitleWordsRadialAnimated = ({ data }) => {
  const filteredData = data.filter((d) => d.season === 1);
  const svgRef = useRef(null);

  const techniques = _.uniqBy(data, "technique").map((film) => film.technique);

  // Color array based on techniques

  const colorRange = d3ColorExtractor(d3.interpolateInferno, 5);

  const techniColor = techniques.map((technique, i) => {
    return {
      technique: technique,
      color: colorRange[i],
    };
  });

  // Create Domains
  const titles = filteredData.map((d) => d.title);
  const words = filteredData.map((d) => d.words);
  const wordsExtent = [0, Math.max(...words) + 50];

  // Create Scales
  const xScale = d3
    .scaleBand()
    .align(0)
    .domain(titles)
    .range([0, 2 * Math.PI]); // X axis goes from 0 to 2pi = all around the circle

  const yScale = d3
    .scaleLinear()
    .domain(wordsExtent)
    .range([innerRadius, outerRadius]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    () =>
      drawTitleWordsRadial(
        svgRef,
        filteredData,
        xScale,
        yScale,
        techniColor,
        width,
        height,
        innerRadius
      ),
    [filteredData]
  );

  return (
    <div className="flex">
      <svg ref={svgRef} width={width} height={height}></svg>
      <div>
        {techniColor
          .slice() // create a copy of the array before reversing it, to avoid modifying the original array
          .reverse() // reverse the copy of the array
          .map((film) => (
            <div key={film.color}>
              <span
                className={"mr-1 inline-block h-3 w-3 rounded-xl"}
                style={{
                  backgroundColor: film.color,
                }}
              ></span>
              {film.technique}
            </div>
          ))}
      </div>
    </div>
  );
};

export default TitleWordsRadialAnimated;
