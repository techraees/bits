import "../src/theme/theme.css";
import { Provider } from "react-redux";
import store from "./store/index";
import "./App.css";
import ZendeskComp from "./components/zendesk";
import { useEffect, useState } from "react";
import { loadContractIns } from "./store/actions";
// import axios from "axios";
// import { useMutation } from "@apollo/client";
// import { RECORD_VISIT_MUTATION } from "./gql/mutations";
import { removeStorage } from "./utills/localStorage";
import Layout from "./layout/index";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  ADD_NFT_TO_NFT_MARKET_PLACE,
  REMOVE_NFT_NFT_MARKET_PLACE,
  UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST,
  CREATE_NEW_TRANSACTION,
  CREATE_BID_AGAINST_AUCTION_NFT_MARKET_PLACE,
  CREATE_NEW_OWNERSHIP_OF_NFT,
} from "./gql/mutations";

import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, polygon } from "@reown/appkit/networks";
import {
  GET_ALL_BIDS_OF_AUCTION_NFTS_MARKET_PLACE,
  GET_ALL_MY_TRANSACTION,
  GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER,
  GET_ALL_TOP_NFTS_FRO_ONE_CHAIN_FOR_WEBSITE,
  GET_DETAILS_OF_SINGLE_NFT_FROM_MARKET_PLACE,
  Get_MY_NFTS_THAT_I_OWNED,
  GET_NFTS_THAT_I_BOUGHT,
  GET_NFTS_THAT_I_SOLD,
  GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
  GET_OWNERSHIP_HISTORY_OF_SINGLE_NFTS,
  GET_TRANSACTION_DETAILS_OF_SPECIFIC,
} from "./gql/queries";
import { TopNftsPopup } from "./components";
import ShowTopNFTPopup from "./ShowTopNFTPopup";

const projectId = process.env.REACT_APP_REOWN_ID;

const metadata = {
  name: "BITS",
  description: "A NFT Marketplace",
  url: "https://www.bitsnft.com", // origin must match your domain & subdomain
  icons: ["https://www.bitsnft.com"],
};

createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [mainnet, polygon],
  projectId,
  features: {
    analytics: false,
    email: false,
    socials: [],
    emailShowWallets: false,
  },
});

function App() {
  // const [recordVisit] = useMutation(RECORD_VISIT_MUTATION);
  const [addNftToMarketPlace, { data, loading, error }] = useMutation(
    ADD_NFT_TO_NFT_MARKET_PLACE
  );
  const [removeNftFromMarketPlace] = useMutation(REMOVE_NFT_NFT_MARKET_PLACE);
  const [updateBiddingTime] = useMutation(
    UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST
  );
  const [createNewTransation] = useMutation(CREATE_NEW_TRANSACTION);
  const [createNewNftOwnership] = useMutation(CREATE_NEW_OWNERSHIP_OF_NFT);
  const [create_bid_against_auction] = useMutation(
    CREATE_BID_AGAINST_AUCTION_NFT_MARKET_PLACE
  );
  const {
    data: getMyNftsThatIOwned,
    isLoadin,
    isLoadinggetMyNftsThatIOwnedLoading,
    isFetching: getMyNftsThatIOwnedFetching,
  } = useQuery(Get_MY_NFTS_THAT_I_OWNED, {
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MTY4NTAwMCwiZXhwIjoxNzQxNzcxNDAwfQ.1fzFbNM4_lkXJ_x9RcKRDV3Eu2deoiCdY9Ei-LQNO0E",
      wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
      // ownership_type: "created",
      ownership_type: "owned",
    },
  });
  const {
    data: getAllNftsInMarketPlaceAndSupportFilter,
    isLoading: getAllNftsInMarketPlaceAndSupportFilterLoading,
    isFetching: getAllNftsInMarketPlaceAndSupportFilterFetching,
  } = useQuery(GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER, {
    variables: {
      filterObj: '{"listingType":"auction"}',
      chainId: "137",
    },
  });
  const {
    data: getOwnersWhoListedTheSameNftWithPrices,
    isLoading: getOwnersWhoListedTheSameNftWithPricesLoading,
    isFetching: getOwnersWhoListedTheSameNftWithPricesFetching,
    refetch,
  } = useQuery(GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE, {
    variables: {
      filterObj: '{"listingType":"auction"}',
      _id: "6658a5c0db40134913175c9a",
    },
  });
  const {
    data: getDetailsOfSingleNftFromMarketPlace,
    isLoading: getDetailsOfSingleNftFromMarketPlaceLoading,
    isFetching: getDetailsOfSingleNftFromMarketPlaceFetching,
  } = useQuery(GET_DETAILS_OF_SINGLE_NFT_FROM_MARKET_PLACE, {
    variables: {
      _id: "67bca4a0cc7a16835231eb20",
    },
  });
  const {
    data: getAllMyTransaction,
    isLoading: getAllMyTransactionLoading,
    isFetching: getAllMyTransactionFetching,
  } = useQuery(GET_ALL_MY_TRANSACTION, {
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MTA4MzM3OSwiZXhwIjoxNzQxMTY5Nzc5fQ.7-joPzTlNWBR7mOTff_YrmJxGinQ-5Lt5rUy278XxW0",
      filterObj: '{"listingType":"auction"}',
    },
  });
  const {
    data: getTransactionDetailsOfSpecific,
    isLoading: getTransactionDetailsOfSpecificLoading,
    isFetching: getTransactionDetailsOfSpecificFetching,
  } = useQuery(GET_TRANSACTION_DETAILS_OF_SPECIFIC, {
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MTA4MzM3OSwiZXhwIjoxNzQxMTY5Nzc5fQ.7-joPzTlNWBR7mOTff_YrmJxGinQ-5Lt5rUy278XxW0",
      _id: "67c3fba7ae1fe85f32d72ebb",
    },
  });
  const {
    data: getNftsThatISold,
    isLoading: getNftsThatISoldLoading,
    isFetching: getNftsThatISoldFetching,
  } = useQuery(GET_NFTS_THAT_I_SOLD, {
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MTA4MzM3OSwiZXhwIjoxNzQxMTY5Nzc5fQ.7-joPzTlNWBR7mOTff_YrmJxGinQ-5Lt5rUy278XxW0",
    },
  });
  const {
    data: getNftsThatIBought,
    isLoading: getNftsThatIBoughtLoading,
    isFetching: getNftsThatIBoughtFetching,
  } = useQuery(GET_NFTS_THAT_I_BOUGHT, {
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MTA4MzM3OSwiZXhwIjoxNzQxMTY5Nzc5fQ.7-joPzTlNWBR7mOTff_YrmJxGinQ-5Lt5rUy278XxW0",
    },
  });
  const {
    data: getOwnershipHistoryOfSingleNfts,
    isLoading: getOwnershipHistoryOfSingleNftsLoading,
    isFetching: getOwnershipHistoryOfSingleNftsFetching,
  } = useQuery(GET_OWNERSHIP_HISTORY_OF_SINGLE_NFTS, {
    variables: {
      _id: "662c321321570927266b46ec",
    },
  });
  const {
    data: getAllBidsOfAuctionNftMarketPlace,
    isLoading: getAllBidsOfAuctionNftMarketPlaceLoading,
    isFetching: getAllBidsOfAuctionNftMarketPlaceFetching,
  } = useQuery(GET_ALL_BIDS_OF_AUCTION_NFTS_MARKET_PLACE, {
    variables: {
      _id: "662c321321570927266b46ec",
    },
  });
  const {
    data: getAllTopNftsForOneChainForWebsite,
    isLoading: getAllTopNftsForOneChainForWebsiteLoading,
    isFetching: getAllTopNftsForOneChainForWebsiteFetching,
  } = useQuery(GET_ALL_TOP_NFTS_FRO_ONE_CHAIN_FOR_WEBSITE, {
    variables: {
      chainId: "137",
    },
  });

  useEffect(() => {
    removeStorage("walletconnect");
    removeStorage("WALLETCONNECT_DEEPLINK_CHOICE");
  }, []);

  store.dispatch(loadContractIns());
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await axios.get("https://geolocation-db.com/json/");
  //       if (res.data?.IPv4) {
  //         const { data } = await recordVisit({
  //           variables: {
  //             ip_adress: res.data?.IPv4,
  //           },
  //         });

  //         // Handle the response data
  //         const { id, ip_adress, timestamp } = data?.RecordVisit;
  //       }
  //     } catch (error) {
  //       console.log("error", error);
  //     }
  //   })();
  // }, []);

  console.log(
    // getMyNftsThatIOwned,
    // getAllNftsInMarketPlaceAndSupportFilter,
    getOwnersWhoListedTheSameNftWithPrices
    // getDetailsOfSingleNftFromMarketPlace,
    // getAllMyTransaction,
    // getTransactionDetailsOfSpecific,
    // getNftsThatISold,
    // getNftsThatIBought,
    // getOwnershipHistoryOfSingleNfts,
    // getAllBidsOfAuctionNftMarketPlace,
    // getAllTopNftsForOneChainForWebsite,
    // getAllTopNftsForOneChainForWebsite,
  );

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Provider store={store}>
        <h1 onClick={() => setIsOpen(true)}>Open Popup</h1>
        {/* <h1
          // style={{ background: "blue" }}
          // onClick={async () => {
            // try {
              // const response = await addNftToMarketPlace({
              //   variables: {
              //     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
              //     tokenId: "1",
              //     numberOfCopies: 1,
              //     price: 10.5,
              //     nftAddress: "0x123456789...",
              //     listingID: "listing_001",
              //     listingType: "auction",
              //     currency: "ETH",
              //     biddingStartTime:"2025-02-24T16:56:00.158+00:00",
              //     biddingEndTime:"2025-02-24T16:56:00.158+00:00"
              //   }
              // });

              //skip this one
              // const response = await removeNftFromMarketPlace({
              //   variables: {
              //     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
              //     nftDbMarketPlaceId: "67bc1d42c1b4f5df8e868209",
              //   }
              // });

              //skip this one too
              // const response = await updateBiddingTime({
              //   variables: {
              //     token:
              //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
              //     nftDbMarketPlaceId: "67bc1d42c1b4f5df8e868209",
              //   },
              // });

              // Used to make bidding transaction
              // Bidding Transaction
              // const BiddingTransaction = await createNewTransation({
              //   variables: {
              //     token:
              //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0Mjg4MzQ4NCwiZXhwIjoxNzQyOTY5ODg0fQ.q-oEQ55On8rwV82mISVFvkaZtdDUMg57RzrtjRoLOhE",
              //     first_person_wallet_address:
              //       "0x6588110c61280f68275bf852fC2C12CED740e8d9",
              //     nft_id: "6658c6badb40134913175fca",
              //     amount: 10.5,
              //     currency: "ETH",
              //     transaction_type: "bidding_transaction",
              //     token_id: "1",
              //     chain_id: "1",
              //     blockchain_listingID: "listing_001",
              //     listingID: "67bca4a0cc7a16835231eb20",
              //   },
              // });

              // Create new Bid
              // const createNewBid = await create_bid_against_auction({
              //   variables: {
              //     token:
              //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0Mjg4MzQ4NCwiZXhwIjoxNzQyOTY5ODg0fQ.q-oEQ55On8rwV82mISVFvkaZtdDUMg57RzrtjRoLOhE",
              //     _id: "67bca55dcc7a16835231eb26",
              //     price: 205,
              //   },
              // });

              // const response = await createNewNftOwnership({
              //   variables: {
              //     token:
              //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MjczNzEzNywiZXhwIjoxNzQyODIzNTM3fQ.vauUQK9Z_Sd1OGQ2bBuspGzmegY7n0i9qTUOMg1xjqI",
              //     total_price: 276,
              //     listingIDFromBlockChain: "listing_001",
              //     listingID: "67bca4a0cc7a16835231eb20",
              //     copies: 23,
              //     pricePerItem: 12,
              //     from_user_wallet:
              //       "0x6934b7875fEABE4FA129D4988ca6DEcD1Dca9C2B",
              //     to_user_wallet: "0xdaF60d937a200b36688e4BfBA68Ef026231570Ef",
              //   },
              // });

              // const response = await create_bid_against_auction({
              //   variables: {
              //     token:
              //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
              //     _id: 276,
              //     price: 120,
              //   },
              // });

            //   console.log("Mutation response:", createNewBid.data);
            // } catch (err) {
            //   console.error("Error adding NFT:", err);
            // }
          // }}
        // >
          // Hello World
        // </h1> */}
        <Layout />
        <ZendeskComp />
        <ShowTopNFTPopup
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(false)}
        />
      </Provider>
    </>
  );
}

export default App;
