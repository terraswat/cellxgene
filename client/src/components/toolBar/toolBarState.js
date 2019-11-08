
// The tool bar component state.
// jshint esversion: 6
const State = (
    state = {
        brush: null,
        drawingMode: "brush",
        svg: null,
    }, action) => {
    switch (action.type) {
    case "toolBar.brush.resizeOrInit":
        return {
            ...state,
            brush: action.value,
        }
    case "toolBar.drawingMode.brush":
        return {
            ...state,
            drawingMode: "brush",
        }
    case "toolBar.drawingMode.zoom":
        return {
            ...state,
            drawingMode: "zoom",
        }
    case "toolBar.svg.resizeOrInit":
        return {
            ...state,
            svg: action.value,
        }
    default:
        return state
    }
}

export default State
