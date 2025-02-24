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
              const response = await updateBiddingTime({
                variables: {
                  token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
                  nftDbMarketPlaceId: "67bc1d42c1b4f5df8e868209",
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
