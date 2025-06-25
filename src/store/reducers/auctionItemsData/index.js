const INITIAL_STATE = {
  auctionItemData: {},
};

const auctionItemDataReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "ETH_CHAIN_AUCTION":
      return {
        ...state,
        auctionItemData: action,
      };
    case "MATIC_CHAIN_AUCTION":
      return {
        ...state,
        auctionItemData: action,
      };
    default:
      return state;
  }
};

export default auctionItemDataReducer;
