// jshint esversion: 6
// https://bl.ocks.org/Jverma/076377dd0125b1a508621441752735fc
// https://peterbeshai.com/scatterplot-in-d3-with-voronoi-interaction.html

import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { Button, ButtonGroup } from "@blueprintjs/core";
import _regl from "regl";
import * as d3 from "d3";
import * as globals from "../../globals";

import _camera from "../../util/camera";

import setupScatterplot from "./setupScatterplot";
import styles from "./scatterplot.css";

import _drawPoints from "./drawPointsRegl";
import scaleLinear from "../../util/scaleLinear";

import { margin, width, height } from "./util";
import { kvCache } from "../../util/stateManager";
import finiteExtent from "../../util/finiteExtent";

@connect(state => {
  const {
    world,
    crossfilter,
    scatterplotXXaccessor,
    scatterplotYYaccessor
  } = state.controls;
  const expressionX =
    world && scatterplotXXaccessor
      ? kvCache.get(world.varDataCache, scatterplotXXaccessor)
      : null;
  const expressionY =
    world && scatterplotYYaccessor
      ? kvCache.get(world.varDataCache, scatterplotYYaccessor)
      : null;

  return {
    world,

    colorRGB: state.controls.colorRGB,
    colorAccessor: state.controls.colorAccessor,
    colorScale: state.controls.colorScale,

    // Accessors are var/gene names (strings)
    scatterplotXXaccessor,
    scatterplotYYaccessor,
    opacityForDeselectedCells: state.controls.opacityForDeselectedCells,

    differential: state.differential,

    expressionX,
    expressionY,

    crossfilter,
    // updated whenever the crossfilter selection is updated
    selectionUpdate: _.get(state.controls, "crossfilter.updateTime", null)
  };
})
class Scatterplot extends React.Component {
  constructor(props) {
    super(props);
    this.count = 0;
    this.axes = false;
    this.state = {
      svg: null,
      minimized: null,
      xScale: null,
      yScale: null
    };
  }

  componentDidMount() {
    const { svg } = setupScatterplot(width, height, margin);
    let scales;
    const { expressionX, expressionY } = this.props;

    if (svg && expressionX && expressionY) {
      scales = Scatterplot.setupScales(expressionX, expressionY);
      this.drawAxesSVG(scales.xScale, scales.yScale, svg);
    }

    const camera = _camera(this.reglCanvas, { scale: true, rotate: false });
    const regl = _regl(this.reglCanvas);

    const drawPoints = _drawPoints(regl);

    // preallocate buffers
    const pointBuffer = regl.buffer();
    const colorBuffer = regl.buffer();
    const sizeBuffer = regl.buffer();

    const reglRender = regl.frame(() => {
      this.reglDraw(
        regl,
        drawPoints,
        sizeBuffer,
        colorBuffer,
        pointBuffer,
        camera
      );
      camera.tick();
    });

    this.reglRenderState = "rendering";

    this.setState({
      regl,
      sizeBuffer,
      pointBuffer,
      colorBuffer,
      svg,
      xScale: scales ? scales.xScale : null,
      yScale: scales ? scales.yScale : null,
      reglRender,
      camera,
      drawPoints
    });
  }

  componentDidUpdate(prevProps) {
    const {
      world,
      crossfilter,
      scatterplotXXaccessor,
      scatterplotYYaccessor,
      expressionX,
      expressionY,
      colorRGB
    } = this.props;
    const {
      reglRender,
      xScale,
      yScale,
      regl,
      pointBuffer,
      colorBuffer,
      sizeBuffer,
      svg,
      drawPoints,
      camera
    } = this.state;

    if (
      world &&
      svg &&
      xScale &&
      yScale &&
      scatterplotXXaccessor &&
      scatterplotYYaccessor &&
      (scatterplotXXaccessor !== prevProps.scatterplotXXaccessor || // was CLU now FTH1 etc
      scatterplotYYaccessor !== prevProps.scatterplotYYaccessor || // was CLU now FTH1 etc
        !this.axes) // clicked off the tab and back again, rerender
    ) {
      this.drawAxesSVG(xScale, yScale, svg);
    }

    if (reglRender && this.reglRenderState === "rendering") {
      reglRender.cancel();
      this.reglRenderState = "paused";
    }

    if (
      world &&
      regl &&
      pointBuffer &&
      colorBuffer &&
      sizeBuffer &&
      expressionX &&
      expressionY &&
      scatterplotXXaccessor &&
      scatterplotYYaccessor &&
      xScale &&
      yScale
    ) {
      const cellCount = expressionX.length;
      const positionsBuf = new Float32Array(2 * cellCount);
      const colorsBuf = new Float32Array(3 * cellCount);
      const sizesBuf = new Float32Array(cellCount);

      const glScaleX = scaleLinear([0, width], [-0.95, 0.95]);
      const glScaleY = scaleLinear([0, height], [-1, 1]);

      /*
        Construct Vectors
      */
      for (let i = 0; i < cellCount; i += 1) {
        positionsBuf[2 * i] = glScaleX(xScale(expressionX[i]));
        positionsBuf[2 * i + 1] = glScaleY(yScale(expressionY[i]));
      }

      for (let i = 0; i < cellCount; i += 1) {
        colorsBuf.set(colorRGB[i], 3 * i);
      }

      crossfilter.fillByIsFiltered(sizesBuf, 4, 0.2);

      pointBuffer({ data: positionsBuf, dimension: 2 });
      colorBuffer({ data: colorsBuf, dimension: 3 });
      sizeBuffer({ data: sizesBuf, dimension: 1 });
      this.count = cellCount;

      regl._refresh();
      this.reglDraw(
        regl,
        drawPoints,
        sizeBuffer,
        colorBuffer,
        pointBuffer,
        camera
      );
    }

    if (
      expressionX &&
      expressionY &&
      (scatterplotXXaccessor !== prevProps.scatterplotXXaccessor || // was CLU now FTH1 etc
        scatterplotYYaccessor !== prevProps.scatterplotYYaccessor)
    ) {
      const scales = Scatterplot.setupScales(expressionX, expressionY);
      this.setState(scales);
    }
  }

  static setupScales(expressionX, expressionY) {
    const xScale = d3
      .scaleLinear()
      .domain(finiteExtent(expressionX))
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain(finiteExtent(expressionY))
      .range([height, 0]);

    return {
      xScale,
      yScale
    };
  }

  reglDraw(regl, drawPoints, sizeBuffer, colorBuffer, pointBuffer, camera) {
    regl.clear({
      depth: 1,
      color: [1, 1, 1, 1]
    });

    drawPoints({
      size: sizeBuffer,
      distance: camera.distance,
      color: colorBuffer,
      position: pointBuffer,
      count: this.count,
      view: camera.view()
    });
  }

  drawAxesSVG(xScale, yScale, svg) {
    const { scatterplotYYaccessor, scatterplotXXaccessor } = this.props;
    svg.selectAll("*").remove();

    // the axes are much cleaner and easier now. No need to rotate and orient
    // the axis, just call axisBottom, axisLeft etc.
    const xAxis = d3.axisBottom().scale(xScale);

    const yAxis = d3.axisLeft().scale(yScale);

    // adding axes is also simpler now, just translate x-axis to (0,height)
    // and it's alread defined to be a bottom axis.
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x axis")
      .call(xAxis);

    // y-axis is translated to (0,0)
    svg
      .append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "y axis")
      .call(yAxis);

    // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 10)
      .attr("class", "label")
      .style("font-style", "italic")
      .text(scatterplotYYaccessor);

    svg
      .append("text")
      .attr("x", width)
      .attr("y", height - 10)
      .attr("text-anchor", "end")
      .attr("class", "label")
      .style("font-style", "italic")
      .text(scatterplotXXaccessor);
  }

  render() {
    const { dispatch } = this.props;
    const { minimized } = this.state;

    return (
      <div
        style={{
          position: "fixed",
          bottom: minimized ? -height + -margin.top : 0,
          borderRadius: "3px 3px 0px 0px",
          left: globals.leftSidebarWidth + globals.scatterplotMarginLeft,
          padding: "0px 20px 20px 0px",
          backgroundColor: "white",
          /* x y blur spread color */
          boxShadow: "0px 0px 6px 2px rgba(153,153,153,0.4)"
        }}
        id="scatterplot_wrapper"
      >
        <ButtonGroup
          style={{
            position: "absolute",
            right: 5,
            top: 5
          }}
        >
          <Button
            type="button"
            minimal
            onClick={() => {
              this.setState({ minimized: !minimized });
            }}
          >
            {minimized ? "show scatterplot" : "hide"}
          </Button>
          <Button
            type="button"
            minimal
            onClick={() => {
              dispatch({
                type: "clear scatterplot"
              });
              dispatch({
                type: "reset colorscale"
              });
            }}
          >
            remove
          </Button>
        </ButtonGroup>
        <div
          className={styles.scatterplot}
          id="scatterplot"
          style={{
            width: `${width + margin.left + margin.right}px`,
            height: `${height + margin.top + margin.bottom}px`
          }}
        >
          <canvas
            width={width}
            height={height}
            style={{
              marginLeft: margin.left - 7,
              marginTop: margin.top
            }}
            ref={canvas => {
              this.reglCanvas = canvas;
            }}
          />
        </div>
      </div>
    );
  }
}

export default Scatterplot;
