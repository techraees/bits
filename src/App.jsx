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

import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, polygon } from "@reown/appkit/networks";

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
    <Provider store={store}>
      <Layout />
      <ZendeskComp />
    </Provider>
  );
}

export default App;
