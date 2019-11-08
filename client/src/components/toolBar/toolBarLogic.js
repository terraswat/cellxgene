
// The tool bar component logic.

import React from 'react'
import { connect } from 'react-redux'
import * as globals from '../../globals'
import actions from '../../actions';
import Presentation from './toolBarPresentation'
import store from '../../reducers/index'

let prevCrossfilter = null

const mapStateToProps = (state) => {
    return {
        mode: state.toolBar.drawingMode,
        crossfilter: state.controls.crossfilter,
        selectionUpdate: (state.controls.crossfilter ?
            state.controls.crossfilter.updateTime : null),
        resettingInterface: state.controls.resettingInterface,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onShowSelectedOnlyClick: ev => {
            //console.log('onShowSelectedOnlyClick()')
            dispatch(actions.regraph())
            dispatch({ type: 'increment graph render counter' })
        },
        onResetClick: ev => {
            //console.log('onResetClick()')
            dispatch({ type: 'interface reset started'  })
            dispatch(actions.resetInterface());
        },
        onRectangleLassoClick: ev => {
            //console.log('onRectangleLassoClick()')
            dispatch({ type: 'toolBar.drawingMode.brush' })
        },
        onPanZoomClick: ev => {
            //console.log('onPanZoomClick()')
            const s = store.getState()
            s.svg.select('.graph_brush').call(s.brush.move, null)
            dispatch({ type: 'graph brush deselect' })
            //this.restartReglLoop(); moved to graph.js: componentDidUpdate()
            dispatch({ type: 'toolBar.drawingMode.zoom' })
        },
    }
}

const Logic = connect(
    mapStateToProps, mapDispatchToProps
)(Presentation)

export default Logic
