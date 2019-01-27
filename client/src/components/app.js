// jshint esversion: 6
import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";

import * as globals from "../globals";
import Container from "./framework/container";
import LeftSideBar from "./leftsidebar";
import Legend from "./continuousLegend";
import Graph from "./graph/graph";
import actions from "../actions";

@connect(state => ({
  loading: state.controls.loading,
  error: state.controls.error,
  graphRenderCounter: state.controls.graphRenderCounter
}))
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  
  resized() {
    let graphWidth = window.innerWidth - globals.leftSidebarWidth
    this.props.dispatch({
      type: "window resize",
      data: {
        height: window.innerHeight,
        graphWidth,
      },
    });
  }
  
  componentDidMount() {
    const { dispatch } = this.props;

    /* listen for url changes, fire one when we start the app up */
    window.addEventListener("popstate", this._onURLChanged);
    this._onURLChanged();

    dispatch(actions.doInitialDataLoad(window.location.search));

    /* listen for resize events */
    window.addEventListener("resize", () => { this.resized() });
    this.resized()
  }

  _onURLChanged() {
    const { dispatch } = this.props;

    dispatch({ type: "url changed", url: document.location.href });
  }

  render() {
    const { loading, error, graphRenderCounter } = this.props;
    return (
      <Container>
        <Helmet title="cellxgene" />
        {loading ? (
          <div
            style={{
              position: "fixed",
              fontWeight: 500,
              top: window.innerHeight / 2,
              left: window.innerWidth / 2 - 50
            }}
          >
            loading cellxgene
          </div>
        ) : null}
        <div id="sidebarAndDrawingArea" style={{display:"flex"}}>
          {loading ? null : <LeftSideBar />}
          {loading ? null : <Graph key={graphRenderCounter} />}
        </div>
        <Legend />
      </Container>
    );
    // TODO do we need the key above? Seems to work without it.
  }
}

export default App;
