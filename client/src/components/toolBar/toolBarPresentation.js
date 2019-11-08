
// The tool bar component presentation.

import React from "react"
import { Button, AnchorButton, Tooltip } from "@blueprintjs/core";

const ShowSelectedOnly = ({ crossfilter, onShowSelectedOnlyClick }) => {
    const comp =
        <Tooltip
            content="Show only metadata and cells which are currently selected"
            position="left"
        >
            <AnchorButton
                type="button"
                disabled={crossfilter &&
                (crossfilter.countFiltered() === 0 ||
                crossfilter.countFiltered() === crossfilter.size())}
                style={{ marginRight: 10 }}
                onClick={onShowSelectedOnlyClick}
            >
                subset to current selection
            </AnchorButton>
        </Tooltip>
    return comp
}

const Reset = ({ resettingInterface, onResetClick }) => {
    const comp =
        <Tooltip
            content="Reset cellxgene, clearing all selections"
            position="left"
        >
            <AnchorButton
                disabled={false}
                type="button"
                loading={resettingInterface}
                intent="warning"
                style={{ marginRight: 10 }}
                onClick={onResetClick}
            >
                reset
            </AnchorButton>
        </Tooltip>
  return comp
}

const DrawingMode = ({ mode, onRectangleLassoClick, onPanZoomClick }) => {
    const comp =
        <div className="bp3-button-group">
            <Tooltip content="Lasso cells" position="left">
                <Button
                    className="bp3-button bp3-icon-select"
                    type="button"
                    active={mode === "brush"}
                    onClick={onRectangleLassoClick}
                />
            </Tooltip>
            <Tooltip content="Pan and zoom" position="left">
                <Button
                    type="button"
                    className="bp3-button bp3-icon-zoom-in"
                    active={mode === "zoom"}
                    onClick={onPanZoomClick}
                    style={{ cursor: "pointer" }}
                />
            </Tooltip>
        </div>
    return comp
}

const Presentation = props => {
    const {
        mode,
        crossfilter,
        resettingInterface,
        onShowSelectedOnlyClick,
        onResetClick,
        onRectangleLassoClick,
        onPanZoomClick,
    } = props

    return (
        <div
            style={{
                position: "fixed",
                right: 0,
                top: 0,
                padding: 10,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "baseline"
            }}
        >
            <ShowSelectedOnly
                crossfilter={crossfilter}
                onShowSelectedOnlyClick={onShowSelectedOnlyClick}
            />
            <Reset
                resettingInterface={props.resettingInterface}
                onResetClick={props.onResetClick}
            />
            <DrawingMode
                mode={mode}
                onRectangleLassoClick={onRectangleLassoClick}
                onPanZoomClick={onPanZoomClick}
            />
        </div>
    )
}

export default Presentation
