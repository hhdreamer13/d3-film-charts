import * as d3 from "d3";

const drawTitleWordsRadial = (
  svgRef,
  filteredData,
  xScale,
  yScale,
  techniColor,
  width,
  height,
  innerRadius
) => {
  if (svgRef.current) {
    d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("path")
      .data(filteredData)
      .enter()
      .append("path")
      .attr(
        "fill",
        (d) => techniColor.find((obj) => d.technique === obj.technique).color
      )
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(innerRadius)
          .outerRadius((d) => yScale(d.words))
          .startAngle((d) => xScale(d.title))
          .endAngle((d) => xScale(d.title) + xScale.bandwidth())
          .padAngle(0.01)
          .padRadius(innerRadius)
      );

    // Center text
    d3.select(svgRef.current)
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "15px")
      .text(`Saison : ${filteredData[0].season}`);

    const textArc = d3
      .arc()
      .innerRadius((d) => yScale(d.words) + 10)
      .outerRadius((d) => yScale(d.words) + 10)
      .startAngle((d) => xScale(d.title))
      .endAngle((d) => xScale(d.title) + xScale.bandwidth());

    const titlesGroup = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    titlesGroup
      .selectAll("path")
      .data(filteredData)
      .enter()
      .append("path")
      .attr("id", (d, i) => `titleArc_${i}`)
      .attr("d", textArc)
      .style("fill", "none");

    titlesGroup
      .selectAll("text")
      .data(filteredData)
      .enter()
      .append("text")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .append("textPath")
      .attr("xlink:href", (d, i) => `#titleArc_${i}`)
      .attr("startOffset", "20%")
      .text((d) => `E ${d.episode}`);

    // calculation of the center of each bar
    titlesGroup.selectAll("text").each(function (d) {
      const textNode = d3.select(this);
      const textPathNode = textNode.select("textPath");
      const textLength = textNode.node().getComputedTextLength();
      const startAngle = xScale(d.title);
      const endAngle = xScale(d.title) + xScale.bandwidth();
      const arcLength = (yScale(d.words) + 10) * (endAngle - startAngle);
      const offset = Math.max(0, (arcLength - textLength) / 4);
      textPathNode.attr(
        "startOffset",
        `${((offset + arcLength / 2) / arcLength) * 100 - 50}%`
      );
    });
  }
};

export default drawTitleWordsRadial;
