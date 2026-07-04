import { useEffect } from "react";
import { Provider } from "react-redux";
import "../src/theme/theme.css";
import "./App.css";
import ZendeskComp from "./components/zendesk";
import { loadContractIns } from "./store/actions";
import store from "./store/index";
// import axios from "axios";
// import { useMutation } from "@apollo/client";
// import { RECORD_VISIT_MUTATION } from "./gql/mutations";
import Layout from "./layout/index";
import { removeStorage } from "./utills/localStorage";

import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, polygon } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";

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
  useEffect(() => {
    // Only clear stale legacy WalletConnect v1 keys once per browser tab
    // session. iOS Safari can remount the App component (fresh page load)
    // when the user switches back from the MetaMask app mid-transaction;
    // unconditionally wiping wallet storage on every mount would kill an
    // in-flight WalletConnect session right when it's needed to confirm a
    // mint/list/purchase transaction.
    if (!sessionStorage.getItem("legacyWalletStorageCleared")) {
      removeStorage("walletconnect");
      removeStorage("WALLETCONNECT_DEEPLINK_CHOICE");
      sessionStorage.setItem("legacyWalletStorageCleared", "true");
    }
    store.dispatch(loadContractIns());
  }, []);

  return (
    <>
      <Provider store={store}>
        <Layout />
        <ZendeskComp />
      </Provider>
    </>
  );
}

export default App;
