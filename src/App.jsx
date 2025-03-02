import "../src/theme/theme.css";
import { Provider } from "react-redux";
import store from "./store/index";
import "./App.css";
import ZendeskComp from "./components/zendesk";
import { useEffect } from "react";
import { loadContractIns } from "./store/actions";
// import axios from "axios";
// import { useMutation } from "@apollo/client";
// import { RECORD_VISIT_MUTATION } from "./gql/mutations";
import { removeStorage } from "./utills/localStorage";
import Layout from "./layout/index";
import { gql, useMutation } from "@apollo/client";
import {
  ADD_NFT_TO_NFT_MARKET_PLACE,
  REMOVE_NFT_NFT_MARKET_PLACE,
  UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST,
  CREATE_NEW_TRANSACTION,
  CREATE_NEW_OWNERSHIP_OF_NFT,
} from "./gql/mutations";

function App() {
  // const [recordVisit] = useMutation(RECORD_VISIT_MUTATION);
  const [addNftToMarketPlace, { data, loading, error }] = useMutation(
    ADD_NFT_TO_NFT_MARKET_PLACE,
  );
  const [removeNftFromMarketPlace] = useMutation(REMOVE_NFT_NFT_MARKET_PLACE);
  const [updateBiddingTime] = useMutation(
    UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST,
  );
  const [createNewTransaction] = useMutation(CREATE_NEW_TRANSACTION);
  const [createNewNftOwnership] = useMutation(CREATE_NEW_OWNERSHIP_OF_NFT);

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

  return (
    <>
      <Provider store={store}>
        <h1
          style={{ background: "blue" }}
          onClick={async () => {
            try {
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
              // const response = await removeNftFromMarketPlace({
              //   variables: {
              //     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
              //     nftDbMarketPlaceId: "67bc1d42c1b4f5df8e868209",
              //   }
              // });
              // const response = await updateBiddingTime({
              //   variables: {
              //     token:
              //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
              //     nftDbMarketPlaceId: "67bc1d42c1b4f5df8e868209",
              //   },
              // });

              // const response = await createNewTransaction({
              //   variables: {
              //     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
              //     nft_id: "67bc1d42c1b4f5df8e868209",
              //     first_person: "aasdad",
              //     second_person: "wsdfsdf",
              //     listingID: "67bc1d42c1b4f5df8e868209",
              //     blockchain_listingID: "00xpsi",
              //     token_id: "1",
              //     price: "23.34",
              //     currency: "ETH",
              //     transaction_type: "create_nft",
              //     copies_transferred: 12
              //   },
              // });

              const response = await createNewNftOwnership({
                variables: {
                  token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
                  total_price: "120",
                  listingIDFromBlockChain: "asdasda",
                  copies: 23,
                  pricePerItem: "12",
                  from_user_wallet: "0x8769",
                  to_user_wallet: "0x95",
                },
              });

              console.log("Mutation response:", response.data);
            } catch (err) {
              console.error("Error adding NFT:", err);
            }
          }}
        >
          Hello World
        </h1>
        <Layout />
        <ZendeskComp />
      </Provider>
    </>
  );
}

export default App;
