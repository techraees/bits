const web3Reducer = (state = { walletData: {} }, action) => {
  switch (action.type) {
    case "CONNECT_WEB3":
      return {
        walletData: action.payload,
      };
    default:
      return state;
  }
};

export default web3Reducer;
