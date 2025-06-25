const contractReducer = (contractIns = {}, action) => {
  switch (action.type) {
    case "LOAD_CONTRACT":
      return action.payload;
    default:
      return contractIns;
  }
};

export default contractReducer;
