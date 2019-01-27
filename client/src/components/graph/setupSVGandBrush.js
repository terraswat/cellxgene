// jshint esversion: 6
import * as d3 from "d3";
import styles from "./graph.css";

/******************************************
*******************************************
          put svg & brush in DOM
*******************************************
******************************************/

export default (
  handleBrushSelectAction,
  handleBrushDeselectAction,
  responsive,
) => {
  const svg = d3
    .select("#graphAttachPoint")
    .append("svg")
    .attr("width", responsive.graphWidth)
    .attr("height", responsive.height)
    .attr("class", `${styles.graphSVG}`);

  const brush = d3
    .brush()
    .extent([[0, 0], [responsive.graphWidth, responsive.height]])
    .on("brush", handleBrushSelectAction)
    .on("end", handleBrushDeselectAction);

  const brushContainer = svg
    .append("g")
    .attr("class", "graph_brush")
    .call(brush);

  return {
    svg,
    brushContainer,
    brush
  };
};
