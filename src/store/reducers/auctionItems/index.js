const auctionItemReducer = (auctionItemIns = {}, action) => {
  switch (action.type) {
    case "LOAD_AUCTION_ITEMS":
      return action.payload;
    default:
      return auctionItemIns;
  }
};

export default auctionItemReducer;
