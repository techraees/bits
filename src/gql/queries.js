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
  query LoginUser(
    $email: String!
    $password: String!
    $recaptchaToken: String!
  ) {
    LoginUser(
      email: $email
      password: $password
      recaptchaToken: $recaptchaToken
    ) {
      access_token
      refresh_token
    }
  }
`;

const GET_PROFILE = gql`
  query GetProfile {
    GetProfile {
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

const GET_GENERAL_USER_INFO = gql`
  query GetGeneralUserInfo($_id: String!) {
    GetGeneralUserInfo(_id: $_id) {
      _id
      full_name
      profileImg
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
      user {
        full_name
        user_address
        profileImg
      }
      status
      name
      video
      royalty
      artist_name1
      supply
      likeCount
      watchCount
    }
  }
`;

const GET_PROFILE_DETAILS_QUERY = gql`
  query GetProfileDetails {
    GetProfileDetails {
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
      video
      wallet_address
      token_id
      supply
      availableSupply
      royalty
      name
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
  query GetMyNftsThatIOwned(
    $ownership_type: String
    $page: Int
    $user_id: String!
    $limit: Int
    $q: String
    $chainId: String
  ) {
    getMyNftsThatIOwned(
      ownership_type: $ownership_type
      page: $page
      limit: $limit
      user_id: $user_id
      q: $q
      chainId: $chainId
    ) {
      totalItems
      totalPages
      currentPage
      currentCount
      data {
        nft_id {
          _id
          status
          name
          artist_name1
          video_duration
          video
          isEmote
          rid
          bvh
          fbx
          likeCount
          watchCount
          isPaid
          royalty
          token_id
          user_id {
            profileImg
          }
        }
        primary_owner
        listingIDFromBlockChain
        listing_id
        total_price
        copies
        pricePerItem
        from_user_wallet
        to_user_wallet
        createdAt
        updatedAt
      }
    }
  }
`;

// Used to fetch all nfts in market plance that support filters
const GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER = gql`
  query GetAllNftsInMarketPlaceAndSupportFilter(
    $filterObj: JSON
    $chainId: String!
  ) {
    getAllNftsInMarketPlaceAndSupportFilter(
      filterObj: $filterObj
      chainId: $chainId
    ) {
      totalItems
      totalPages
      currentPage
      currentCount
      data {
        _id
        biddingStartTime
        biddingEndTime
        price
        listingID
        numberOfCopies
        auction_highest_bid
        auction_highest_bid
        tokenId
        isSold
        id
        owners

        user {
          profileImg
        }

        nft_id {
          _id
          status
          video_duration
          name
          video
          royalty
          artist_name1
          supply
          likeCount
          is_blocked
          watchCount
        }

        seller {
          user_address
          _id
          user_name
        }
      }
    }
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
  query GetAllMyTransaction($filterObj: JSON) {
    getAllMyTransaction(filterObj: $filterObj)
  }
`;

//  Used to fetch transaction details of specific transaction
const GET_TRANSACTION_DETAILS_OF_SPECIFIC = gql`
  query GetTransactionDetailsOfSpecific($_id: String!) {
    getTransactionDetailsOfSpecific(_id: $_id)
  }
`;

//  Used to fetch nfts that I sold
const GET_NFTS_THAT_I_SOLD = gql`
  query GetNftsThatISold {
    getNftsThatISold
  }
`;

//  Used to fetch nfts that I bought
const GET_NFTS_THAT_I_BOUGHT = gql`
  query GetNftsThatIBought($token: String!) {
    getNftsThatIBought(token: $token)
  }
`;

//  Used to fetch the ownership history of single nfts
const GET_OWNERSHIP_HISTORY_OF_SINGLE_NFTS = gql`
  query GetOwnershipHistoryOfSingleNfts($_id: String!) {
    getOwnershipHistoryOfSingleNfts(_id: $_id)
  }
`;

// Used to get owners who listing the same nft with different price
const GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE = gql`
  query GetOwnersWhoListedTheSameNftWithPrices(
    $_id: String!
    $filterObj: JSON
  ) {
    getOwnersWhoListedTheSameNftWithPrices(_id: $_id, filterObj: $filterObj) {
      totalItems
      totalPages
      currentPage
      currentCount
      data {
        numberOfCopies
        price
        auctionId
        listingType
        _id
        tokenId
        chainId
        auction_highest_bid

        nft_id {
          _id
          chainId
          video_duration
        }

        auction_bids {
          bid_amount
          bidder
          _id
          bid_time
        }

        seller {
          user_address
        }
      }
    }
  }
`;

// Used to get all bids of auction nft market place
const GET_ALL_BIDS_OF_AUCTION_NFTS_MARKET_PLACE = gql`
  query GetAllBidsOfAuctionNftMarketPlace($_id: String!) {
    getAllBidsOfAuctionNftMarketPlace(_id: $_id)
  }
`;

// Used to get all top nfts
const GET_ALL_TOP_NFTS_FRO_ONE_CHAIN_FOR_WEBSITE = gql`
  query GetAllTopNftsForOneChainForWebsite($chainId: String!) {
    getAllTopNftsForOneChainForWebsite(chainId: $chainId)
  }
`;

export {
  GET_ALL_NFTS,
  LOGIN_USER,
  GET_PLAYER,
  UPDATE_USER_PROFILE,
  GET_PROFILE,
  GET_GENERAL_USER_INFO,
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
  GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
  GET_ALL_MY_TRANSACTION,
  GET_TRANSACTION_DETAILS_OF_SPECIFIC,
  GET_NFTS_THAT_I_SOLD,
  GET_NFTS_THAT_I_BOUGHT,
  GET_OWNERSHIP_HISTORY_OF_SINGLE_NFTS,
  GET_ALL_BIDS_OF_AUCTION_NFTS_MARKET_PLACE,
  GET_ALL_TOP_NFTS_FRO_ONE_CHAIN_FOR_WEBSITE,

  // ========================= Optimization Queries ======================
};
