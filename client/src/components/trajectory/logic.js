
// TrajectoryGraph

import React from "react";
import { connect } from 'react-redux'
import * as globals from "../../globals";

const TrajectoryGraphPres = (height) => {
    return (
        <div
            id="trajectoryAttachPoint"
            style={{
                minWidth: 100,
                height: height,
                backgroundColor: 'red',
                zIndex: 99999999,
                display: 'block',
            }}
        />
    )
}

const mapStateToProps = (state) => {
    return {
        height: state.responsive.height,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: ev => {
            console.log('clicked')
            dispatch({ type: "trajectory view selected toggle" });
        },
    }
}

const TrajectoryGraph = connect(
    mapStateToProps, mapDispatchToProps
)(TrajectoryGraphPres)

export default TrajectoryGraph
