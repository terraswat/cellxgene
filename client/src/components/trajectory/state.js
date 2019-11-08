// jshint esversion: 6
const Trajectory = (
    state = {
        viewSelected: "",
    }, action) => {
    switch (action.type) {
    case "trajectory.viewSelected.setUi":
        console.log('state:action.value:', action.value)
        return {
            ...state,
            viewSelected: action.value,
        }
    default:
        return state
    }
}

export default Trajectory
