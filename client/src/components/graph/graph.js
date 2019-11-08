// jshint esversion: 6
import React from "react";
import _ from "lodash";
import * as d3 from "d3";
import { connect } from "react-redux";
import mat4 from "gl-mat4";
import _regl from "regl";
import { Button, AnchorButton, Tooltip } from "@blueprintjs/core";
import * as globals from "../../globals";
import setupSVGandBrushElements from "./setupSVGandBrush";
import actions from "../../actions";
import _camera from "../../util/camera";
import _drawPoints from "./drawPointsRegl";
import scaleLinear from "../../util/scaleLinear";

/* https://bl.ocks.org/mbostock/9078690 - quadtree for onClick / hover selections */

@connect(state => ({
  world: state.controls.world,
  universe: state.controls.universe,
  crossfilter: state.controls.crossfilter,
  responsive: state.responsive,
  colorRGB: _.get(state.controls, "colorRGB", null),
  opacityForDeselectedCells: state.controls.opacityForDeselectedCells,
  selectionUpdate: _.get(state.controls, "crossfilter.updateTime", null),
  mode: state.toolBar.drawingMode,
  brush: state.toolBar.brush,
  svg: state.toolBar.svg,
}))
class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.count = 0;
    this.inverse = mat4.identity([]);
    this.graphPaddingBottom = 45;
    this.renderCache = {
      positions: null,
      colors: null
    };
  }

  componentDidMount() {
    // setup canvas and camera
    const camera = _camera(this.reglCanvas, { scale: true, rotate: false });
    const regl = _regl(this.reglCanvas);

    const drawPoints = _drawPoints(regl);

    // preallocate buffers
    const pointBuffer = regl.buffer();
    const colorBuffer = regl.buffer();
    const sizeBuffer = regl.buffer();

    /* first time, but this duplicates above function, should be possile to avoid this */
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
      drawPoints,
      pointBuffer,
      colorBuffer,
      sizeBuffer,
      camera,
      reglRender
    });
  }

  componentDidUpdate(prevProps) {
    const {
      dispatch,
      world,
      crossfilter,
      selectionUpdate,
      colorRGB,
      responsive,
      mode,
      svg,
    } = this.props;
    const {
      reglRender,
      regl,
      drawPoints,
      camera,
      pointBuffer,
      colorBuffer,
      sizeBuffer,
    } = this.state;

    if (reglRender && this.reglRenderState === "rendering" && mode !== "zoom") {
      reglRender.cancel();
      this.reglRenderState = "paused";
    }

    if (regl && world) {
      /* update the regl state */
      const { obsLayout } = world;
      const cellCount = crossfilter.size();

      // X/Y positions for each point - a cached value that only
      // changes if we have loaded entirely new cell data
      //
      if (
        !this.renderCache.positions ||
        selectionUpdate !== prevProps.selectionUpdate
      ) {
        if (!this.renderCache.positions) {
          this.renderCache.positions = new Float32Array(2 * cellCount);
        }

        const glScaleX = scaleLinear([0, 1], [-1, 1]);
        const glScaleY = scaleLinear([0, 1], [1, -1]);

        const offset = [d3.mean(obsLayout.X) - 0.5, d3.mean(obsLayout.Y) - 0.5];

        for (
          let i = 0, { positions } = this.renderCache;
          i < cellCount;
          i += 1
        ) {
          positions[2 * i] = glScaleX(obsLayout.X[i] - offset[0]);
          positions[2 * i + 1] = glScaleY(obsLayout.Y[i] - offset[1]);
        }
        pointBuffer({
          data: this.renderCache.positions,
          dimension: 2
        });

        this.setState({
          offset
        });
      }

      // Colors for each point - a cached value that only changes when
      // the cell metadata changes (done by updateCellColors middleware).
      // NOTE: this is a slightly pessimistic assumption, as the metadata
      // could have changed for some other reason, but for now color is
      // the only metadata that changes client-side.  If this is problematic,
      // we could add some sort of color-specific indicator to the app state.
      if (!this.renderCache.colors || colorRGB !== prevProps.colorRGB) {
        const rgb = colorRGB;
        if (!this.renderCache.colors) {
          this.renderCache.colors = new Float32Array(3 * rgb.length);
        }
        for (let i = 0, { colors } = this.renderCache; i < rgb.length; i += 1) {
          colors.set(rgb[i], 3 * i);
        }
        colorBuffer({ data: this.renderCache.colors, dimension: 3 });
      }

      // Sizes for each point - this is presumed to change each time the
      // component receives new props.   Almost always a true assumption, as
      // most property upates are due to changes driving a crossfilter
      // selection set change.
      //
      if (!this.renderCache.sizes) {
        this.renderCache.sizes = new Float32Array(cellCount);
      }

      crossfilter.fillByIsFiltered(this.renderCache.sizes, 4, 0.2);
      sizeBuffer({ data: this.renderCache.sizes, dimension: 1 });

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

    // If the viewport has changed size or this is the first time this
    // component has updated...
    if (
      prevProps.responsive.height !== responsive.height ||
      prevProps.responsive.graphWidth !== responsive.graphWidth ||
      /* first time */
      (responsive.height && responsive.graphWidth && !svg)
    ) {
      /* clear out whatever was on the div, even if nothing, but usually the brushes etc */
      d3.select("#graphAttachPoint")
        .selectAll("svg")
        .remove();
      const { svg: newSvg, brush } = setupSVGandBrushElements(
        this.handleBrushSelectAction.bind(this),
        this.handleBrushDeselectAction.bind(this),
        responsive,
      );
      dispatch({ type: 'toolBar.svg.resizeOrInit', value: newSvg })
      dispatch({ type: 'toolBar.brush.resizeOrInit', value: brush })
    }
    if (prevProps.mode !== mode && mode === 'zoom') {
      this.restartReglLoop();
    }
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

  restartReglLoop() {
    const {
      regl,
      drawPoints,
      sizeBuffer,
      colorBuffer,
      pointBuffer,
      camera
    } = this.state;
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
      reglRender
    });
  }

  handleBrushSelectAction() {
    /*
    This conditional handles procedural brush deselect. Brush emits
    an event on procedural deselect because it is move: null
    */

    const { camera, offset } = this.state;
    const { dispatch, responsive } = this.props;

    if (d3.event.sourceEvent !== null) {
      /*
      No idea why d3 event scope works like this
      but apparently
      it does
      https://bl.ocks.org/EfratVil/0e542f5fc426065dd1d4b6daaa345a9f
    */
      const s = d3.event.selection;
      const gl = this.state.regl._gl;
      /*
      event describing brush position:
      @-------|
      |       |
      |       |
      |-------@
    */

      // get aspect ratio
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

      // compute inverse view matrix
      const inverse = mat4.invert([], camera.view());

      // transform screen coordinates -> cell coordinates
      const invert = pin => {
        const x =
          (2 * pin[0]) / responsive.graphWidth - 1;
        const y =
          2 * (1 - pin[1] / responsive.height) - 1;
        const pout = [
          x * inverse[14] * aspect + inverse[12],
          y * inverse[14] + inverse[13]
        ];
        return [(pout[0] + 1) / 2 + offset[0], (pout[1] + 1) / 2 + offset[1]];
      };

      const brushCoords = {
        northwest: invert([s[0][0], s[0][1]]),
        southeast: invert([s[1][0], s[1][1]])
      };

      dispatch({
        type: "graph brush selection change",
        brushCoords
      });
    }
  }

  handleBrushDeselectAction() {
    const { dispatch } = this.props;
    if (!d3.event.selection) {
      dispatch({
        type: "graph brush deselect"
      });
    }
  }

  handleOpacityRangeChange(e) {
    const { dispatch } = this.props;
    dispatch({
      type: "change opacity deselected cells in 2d graph background",
      data: e.target.value
    });
  }

  render() {
    const { mode, responsive } = this.props;
    const comp =
      <div
        id="graphCanvasWrap"
        style={{width: responsive.graphWidth}}
      >
        <div
          id="graphAttachPoint"
          style={{
            display: mode === "brush" ? "inherit" : "none"
          }}
        />
        <canvas
          id="graphCanvas"
          width={responsive.graphWidth}
          height={responsive.height}
          ref={canvas => {
            this.reglCanvas = canvas;
          }}
        />
      </div>
    return comp
  }
}

export default Graph;
