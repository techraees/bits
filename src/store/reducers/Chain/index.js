const INITIAL_STATE = {
  contractData: {
    marketContract: {},
    mintContract: {},
    chain: 0,
  },
};

const chainReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "ETH_CHAIN":
      return {
        ...state,
        contractData: action,
      };
    case "MATIC_CHAIN":
      return {
        ...state,
        contractData: action,
      };
    default:
      return state;
  }
};

export default chainReducer;
