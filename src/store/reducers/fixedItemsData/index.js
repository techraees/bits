const INITIAL_STATE = {
  fixedItemData: {},
};

const fixedItemDataReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "ETH_CHAIN_FIXED":
      return {
        ...state,
        fixedItemData: action,
      };
    case "MATIC_CHAIN_FIXED":
      return {
        ...state,
        fixedItemData: action,
      };
    default:
      return state;
  }
};

export default fixedItemDataReducer;
