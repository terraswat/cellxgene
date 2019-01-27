// jshint esversion: 6
const Responsive = (
  state = {
    graphWidth: null,
    height: null
  },
  action
) => {
  switch (action.type) {
    case "window resize":
      return {
        ...state,
        graphWidth: action.data.graphWidth,
        height: action.data.height
      };
    default:
      return state;
  }
};

export default Responsive;
