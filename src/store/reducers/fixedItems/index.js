const fixedItemReducer = (fixedItemIns = {}, action) => {
  switch (action.type) {
    case "LOAD_FIXED_ITEMS":
      return action.payload;
    default:
      return fixedItemIns;
  }
};

export default fixedItemReducer;
