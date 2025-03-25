import { gql } from "@apollo/client";

const CREATE_NFT = gql`
  mutation CreateNft(
    $name: String!
    $artistName1: String!
    $video: String!
    $metauri: String!
    $description: String!
    $tokenId: String!
    $chainId: Int!
    $supply: Int!
    $walletAddress: String!
    $status: Boolean!
    $isEmote: Boolean!
    $rid: String!
    $royalty: Int
    $isPaid: Boolean!
    $video_duration: Int
    $category: String!
    $likeCount: Int
    $watchCount: Int
    $user_id: String!
  ) {
    CreateNft(
      name: $name
      artist_name1: $artistName1
      video: $video
      metauri: $metauri
      description: $description
      token_id: $tokenId
      chainId: $chainId
      supply: $supply
      wallet_address: $walletAddress
      status: $status
      isEmote: $isEmote
      rid: $rid
      royalty: $royalty
      isPaid: $isPaid
      video_duration: $video_duration
      category: $category
      likeCount: $likeCount
      watchCount: $watchCount
      user_id: $user_id
    ) {
      _id
      description
      artist_name1
      name
      metauri
      supply
      token_id
      chainId
      status
      isEmote
      rid
      video
      royalty
      isPaid
      video_duration
      category
      likeCount
      watchCount
    }
  }
`;

const CREATE_SIGNED_URL_FOR_NFTS = gql`
  mutation CreateSignedUrlForNfts($key: String!) {
    CreateSignedUrlForNfts(key: $key) {
      url
    }
  }
`;

const CREATE_USER = gql`
  mutation Mutation(
    $userName: String!
    $email: String!
    $fullName: String!
    $password: String!
    $phoneNumber: String!
    $userAddress: String!
    $dob: String!
  ) {
    CreateUser(
      user_name: $userName
      email: $email
      full_name: $fullName
      password: $password
      phone_number: $phoneNumber
      user_address: $userAddress
      dob: $dob
    ) {
      _id
      email
      full_name
      password
      phone_number
      user_name
      user_address
      dob
      token
    }
  }
`;

const MINT_ASSET = gql`
  mutation MintAsset(
    $assetId: String!
    $mints: [MintInput!]!
    $wallet: EthAddress!
    $send: Boolean!
    $test: Boolean!
  ) {
    MintAsset(
      assetId: $assetId
      mints: $mints
      wallet: $wallet
      send: $send
      test: $test
    ) {
      id
      transactionId
      state
    }
  }
`;
const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($file: Upload!) {
    UploadFile(file: $file) {
      filename
    }
  }
`;

const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($password: String!, $newPassword: String!) {
    Update_password(password: $password, new_password: $newPassword) {
      updated
      updatedData
    }
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($newPassword: String!) {
    Reset_password(new_password: $newPassword) {
      updated
      updatedData
    }
  }
`;

const UPDATE_EMAIL = gql`
  mutation UpdateEmail($password: String!, $newEmail: String!) {
    UpdateEmail(password: $password, newEmail: $newEmail) {
      updated
      updatedData
    }
  }
`;

const ADD_CONTACT = gql`
  mutation AddContact(
    $fullName: String!
    $email: String!
    $phoneNumber: String!
    $message: String!
  ) {
    AddContact(
      full_name: $fullName
      email: $email
      phone_number: $phoneNumber
      message: $message
    ) {
      full_name
      email
      phone_number
      message
    }
  }
`;

const MINT_ASSET_MUTATION = gql`
  mutation MintAsset($walletAddress: String!) {
    MintAsset(walletAddress: $walletAddress) {
      status
    }
  }
`;

const SEND_EMAIL_MUTATION = gql`
  mutation SendEmail(
    $to: String!
    $from: String!
    $subject: String!
    $text: String!
  ) {
    SendEmail(to: $to, from: $from, subject: $subject, text: $text) {
      message
      status
    }
  }
`;

const RECORD_VISIT_MUTATION = gql`
  mutation RecordVisit($ip_adress: String!) {
    RecordVisit(ip_adress: $ip_adress) {
      id
      ip_adress
      timestamp
    }
  }
`;

const UPDATE_NFT_LIKE = gql`
  mutation UpdateNftLike($id: String!) {
    UpdateNftLike(id: $id) {
      likeCount
    }
  }
`;

const UPDATE_NFT_WATCH = gql`
  mutation UpdateNftWatch($id: String!) {
    UpdateNftWatch(id: $id) {
      watchCount
    }
  }
`;

const UPDATE_NFT_PAYMENT = gql`
  mutation UpdateNftWatch($id: String!) {
    UpdateNftWatch(id: $id) {
      isPaid
    }
  }
`;

// ============================ Optimization Mutations =====================
// Add Nft to Nft Market Place
const ADD_NFT_TO_NFT_MARKET_PLACE = gql`
  mutation AddNftToNftMarketPlace(
    $token: String!
    $tokenId: String!
    $numberOfCopies: Int!
    $price: Decimal!
    $nftAddress: String!
    $listingID: String!
    $listingType: String!
    $currency: String!
    $fixedid: String
    $auctionid: String
    $biddingStartTime: Date
    $biddingEndTime: Date
  ) {
    addNftToNftMarketPlace(
      token: $token
      tokenId: $tokenId
      numberOfCopies: $numberOfCopies
      price: $price
      nftAddress: $nftAddress
      listingID: $listingID
      listingType: $listingType
      fixedid: $fixedid
      auctionid: $auctionid
      currency: $currency
      biddingStartTime: $biddingStartTime
      biddingEndTime: $biddingEndTime
    ) {
      message
      _id
    }
  }
`;

// Remove Nft From Nft Market Place
const REMOVE_NFT_NFT_MARKET_PLACE = gql`
  mutation RemoveNftFromNftMarketPlace(
    $token: String!
    $nftDbMarketPlaceId: String!
  ) {
    removeNftFromNftMarketPlace(
      token: $token
      nftDbMarketPlaceId: $nftDbMarketPlaceId
    ) {
      message
      _id
    }
  }
`;

// Used to add the time by 5 mints
const UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST = gql`
  mutation UpdateNftMarketPlaceBiddingTimeByMintsForEachRequest(
    $token: String!
    $nftDbMarketPlaceId: String!
  ) {
    updateNftMarketPlaceBiddingTimeByMintsForEachRequest(
      token: $token
      nftDbMarketPlaceId: $nftDbMarketPlaceId
    ) {
      message
      _id
    }
  }
`;

// Used to create New Transaction

const CREATE_NEW_TRANSACTION = gql`
  mutation CreateNewTransaction(
    $token: String!
    $transaction_type: String!
    $nft_id: String
    $first_person_wallet_address: String
    $second_person_wallet_address: String
    $listingID: String
    $blockchain_listingID: String
    $token_id: String
    $chain_id: String
    $amount: Decimal
    $currency: String
    $copies_transferred: Int
  ) {
    createNewTransaction(
      token: $token
      nft_id: $nft_id
      first_person_wallet_address: $first_person_wallet_address
      second_person_wallet_address: $second_person_wallet_address
      listingID: $listingID
      blockchain_listingID: $blockchain_listingID
      token_id: $token_id
      chain_id: $chain_id
      amount: $amount
      currency: $currency
      transaction_type: $transaction_type
      copies_transferred: $copies_transferred
    ) {
      message
      _id
    }
  }
`;

// Used to create New ownership of nft
const CREATE_NEW_OWNERSHIP_OF_NFT = gql`
  mutation CreateNewOwnershipOfNft(
    $token: String!
    $total_price: Decimal!
    $listingIDFromBlockChain: String!
    $copies: Int!
    $listingID: String!
    $pricePerItem: Decimal!
    $from_user_wallet: String!
    $to_user_wallet: String!
  ) {
    createNewOwnershipOfNft(
      token: $token
      total_price: $total_price
      listingIDFromBlockChain: $listingIDFromBlockChain
      copies: $copies
      listingID: $listingID
      pricePerItem: $pricePerItem
      from_user_wallet: $from_user_wallet
      to_user_wallet: $to_user_wallet
    ) {
      message
      _id
    }
  }
`;

// Used to create New ownership of nft
const CREATE_BID_AGAINST_AUCTION_NFT_MARKET_PLACE = gql`
  mutation CreateBidAgainstAuctionNftMarketPlace(
    $token: String!
    $_id: String!
    $price: Decimal!
  ) {
    createBidAgainstAuctionNftMarketPlace(
      token: $token
      _id: $_id
      price: $price
    )
  }
`;

export {
  CREATE_NFT,
  CREATE_USER,
  UPLOAD_FILE_MUTATION,
  UPDATE_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION,
  UPDATE_EMAIL,
  ADD_CONTACT,
  MINT_ASSET_MUTATION,
  MINT_ASSET,
  SEND_EMAIL_MUTATION,
  RECORD_VISIT_MUTATION,
  UPDATE_NFT_LIKE,
  UPDATE_NFT_WATCH,
  UPDATE_NFT_PAYMENT,
  CREATE_SIGNED_URL_FOR_NFTS,

  // ========================= Optimization Mutations ======================
  // Nft Market Place
  ADD_NFT_TO_NFT_MARKET_PLACE,
  REMOVE_NFT_NFT_MARKET_PLACE,
  UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST,

  // Transaction
  CREATE_NEW_TRANSACTION,

  // Create New Nft Ownershsip
  CREATE_NEW_OWNERSHIP_OF_NFT,

  // Create Bid
  CREATE_BID_AGAINST_AUCTION_NFT_MARKET_PLACE,
  // ========================= Optimization Mutations ======================
};
