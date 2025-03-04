import { gql } from "@apollo/client";

const GET_ALL_NFTS = gql`
  query getAllNfts($walletAddress: String!) {
    getAllNfts(walletAddress: $walletAddress) {
      _id
      artist_name1
      description
      metauri
      status
      isEmote
      rid
      video
      wallet_address
      token_id
      chainId
      supply
      royalty
      name
      isPaid
      video_duration
      category
      likeCount
      watchCount
      user_id {
        id
        user_name
        user_address
        profileImg
      }
    }
  }
`;

const LOGIN_USER = gql`
  query LoginUser($email: String!, $password: String!) {
    LoginUser(email: $email, password: $password) {
      token
      user_address
      full_name
      country
      bio
      profileImg
      id
    }
  }
`;

const GET_PROFILE = gql`
  query GetProfile($token: String!) {
    GetProfile(token: $token) {
      bio
      country
      id
      profileImg
      token
      user_address
      dob
      full_name
    }
  }
`;

const GET_PLAYER = gql`
  query Query($id: String!) {
    GetPlayer(id: $id) {
      createdAt
      id
      linkingInfo
      updatedAt
      wallet
      __typename
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateProfile(
    $updateProfileId: String!
    $full_name: String
    $country: String
    $userAddress: String
    $bio: String
    $profileImg: String
  ) {
    UpdateProfile(
      id: $updateProfileId
      full_name: $full_name
      user_address: $userAddress
      country: $country
      bio: $bio
      profileImg: $profileImg
    ) {
      full_name
      email
      full_name
      phone_number
      user_address
      country
      bio
      profileImg
    }
  }
`;

const GET_ALL_NFTS_WITHOUT_ADDRESS = gql`
  query GetAllNftsWithoutAddress {
    getAllNftsWithoutAddress {
      _id
      artist_name1
      description
      name
      royalty
      status
      isEmote
      rid
      token_id
      chainId
      video
      wallet_address
      supply
      is_blocked
      isPaid
      video_duration
      category
      likeCount
      watchCount
      user_id {
        id
        user_name
        user_address
        profileImg
      }
    }
  }
`;

const GET_PROFILE_DETAILS_QUERY = gql`
  query GetProfileDetails($getProfileDetailsId: String!) {
    GetProfileDetails(id: $getProfileDetailsId) {
      country
      id
      profileImg
      bio
      user_address
      user_name
      bio
      profileImg
      full_name
      createdAt
      email
      phone_number
      notes
    }
  }
`;

const GET_NFT_DETAIL_QUERY = gql`
  query GetNftDetails($id: ID!, $user_id: String) {
    getNftDetails(id: $id, user_id: $user_id) {
      _id
      artist_name1
      description
      metauri
      status
      isEmote
      rid
      video
      wallet_address
      token_id
      chainId
      supply
      royalty
      name
      isPaid
      video_duration
      category
      likeCount
      watchCount
      user_id {
        id
        user_name
        user_address
        profileImg
      }
    }
  }
`;

const DETAILS_OF_A_NFT = gql`
  query DetailsOfANft($id: ID!) {
    DetailsOfANft(id: $id) {
      _id
      artist_name1
      description
      metauri
      status
      isEmote
      rid
      video
      wallet_address
      token_id
      chainId
      supply
      royalty
      name
      isPaid
      video_duration
      category
      likeCount
      watchCount
      user_id {
        id
        user_name
        user_address
        profileImg
      }
    }
  }
`;

const GET_TOP_VIEW_NFTS = gql`
  query {
    getTopViewNfts {
      _id
      artist_name1
      description
      metauri
      status
      isEmote
      video
      wallet_address
      token_id
      chainId
      supply
      royalty
      name
      isPaid
      video_duration
      category
      likeCount
      watchCount
      view_count
      user_id {
        id
        user_name
        user_address
        profileImg
      }
    }
  }
`;

const GET_TOP_NFTS = gql`
  query GetTopNfts {
    GetTopNfts {
      id
      duration
      nft_link
      serial_number
      nft_id
      is_Published
    }
  }
`;

// Used to fetch my nfts that I owned
const Get_MY_NFTS_THAT_I_OWNED = gql`
  query GetMyNftsThatIOwned($token: String!, $wallet_address: String!) {
    getMyNftsThatIOwned(token: $token, wallet_address: $wallet_address)
  }
`;

// Used to fetch all nfts in market plance that support filters
const GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER = gql`
  query GetAllNftsInMarketPlaceAndSupportFilter($filterObj: JSON) {
    getAllNftsInMarketPlaceAndSupportFilter(filterObj: $filterObj)
  }
`;

// Used to get datails of single nft from nft market place
const GET_DETAILS_OF_SINGLE_NFT_FROM_MARKET_PLACE = gql`
  query GetDetailsOfSingleNftFromMarketPlace($_id: String!) {
    getDetailsOfSingleNftFromMarketPlace(_id: $_id)
  }
`;

// Used to get all my transactions
const GET_ALL_MY_TRANSACTION = gql`
  query GetAllMyTransaction($token: String!, $filterObj: JSON) {
    getAllMyTransaction(token: $token, filterObj: $filterObj)
  }
`;

//  Used to fetch transaction details of specific transaction
const GET_TRANSACTION_DETAILS_OF_SPECIFIC = gql`
  query GetTransactionDetailsOfSpecific($token: String!, $_id: String!) {
    getTransactionDetailsOfSpecific(token: $token, _id: $_id)
  }
`;

//  Used to fetch nfts that I sold
const GET_NFTS_THAT_I_SOLD = gql`
  query GetNftsThatISold($token: String!) {
    getNftsThatISold(token: $token)
  }
`;

//  Used to fetch nfts that I bought
const GET_NFTS_THAT_I_BOUGHT = gql`
  query GetNftsThatIBought($token: String!) {
    getNftsThatIBought(token: $token)
  }
`;

// //  Used to fetch secondary owner who bought my nfts
// const GET_SECONDARY_OWNER_WHO_BOUGHT_MY_NFTS = gql``;

// //  Used to fetch the ownership history of single nfts
// const GET_OWNERSHIP_HISTORY_OF_SINGLE_NFTS = gql``;

// //  Used to fetch all nfts as primary or secondary quantity
// const GET_ALL_NFTS_AS_PRIMARY_OR_SECONDARY_QUANTITY = gql``;

export {
  GET_ALL_NFTS,
  LOGIN_USER,
  GET_PLAYER,
  UPDATE_USER_PROFILE,
  GET_PROFILE,
  GET_ALL_NFTS_WITHOUT_ADDRESS,
  GET_PROFILE_DETAILS_QUERY,
  GET_NFT_DETAIL_QUERY,
  GET_TOP_VIEW_NFTS,
  DETAILS_OF_A_NFT,
  GET_TOP_NFTS,
  // ========================= Optimization Queries ======================
  Get_MY_NFTS_THAT_I_OWNED,
  GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER,
  GET_DETAILS_OF_SINGLE_NFT_FROM_MARKET_PLACE,
  GET_ALL_MY_TRANSACTION,
  GET_TRANSACTION_DETAILS_OF_SPECIFIC,
  GET_NFTS_THAT_I_SOLD,
  GET_NFTS_THAT_I_BOUGHT,
  // GET_SECONDARY_OWNER_WHO_BOUGHT_MY_NFTS,
  // GET_OWNERSHIP_HISTORY_OF_SINGLE_NFTS,
  // GET_ALL_NFTS_AS_PRIMARY_OR_SECONDARY_QUANTITY,
  // ========================= Optimization Queries ======================
};
