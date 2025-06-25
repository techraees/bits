const INITIAL_STATE = {
  createNft: {
    name: "",
    artist_name1: "",
    description: "",
    video: "",
    meta: "",
    download: {},
    isEmote: false,
    video_duration: 0,
    category: "",
  },
};

const CreateNFtReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "CREATE_NFT":
      return {
        ...state,
        createNft: action,
      };
    default:
      return state;
  }
};

export default CreateNFtReducer;
