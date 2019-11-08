
// Trajectory graph presentation as pure function with no internal state.

import React from "react";
import { connect } from 'react-redux'
import * as globals from "../../globals";

const Presentation = ({trajectoryId, responsive}) => {
    if (responsive.trajectoryWidth < 1) {
        return null
    }
    return (
        <div
            id="trajectory"
            style={{
                minWidth: 100,
                width: responsive.trajectoryWidth,
                height: responsive.height,
                backgroundColor: 'transparent',
                zIndex: 99999999,
                display: 'block',
                color: 'red',
                border: 'solid grey 1px',
            }}
        >
            {trajectoryId}
        </div>
    )
}

export default Presentation
