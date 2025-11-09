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
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

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
    removeStorage("walletconnect");
    removeStorage("WALLETCONNECT_DEEPLINK_CHOICE");
  }, []);

  store.dispatch(loadContractIns());

  return (
    <>
      <GoogleReCaptchaProvider
        reCaptchaKey={"6LeNeAIsAAAAADSjc8bO8iTGFPyoMJj8tATp5BnS"}
      >
        <Provider store={store}>
          <Layout />
          <ZendeskComp />
        </Provider>
      </GoogleReCaptchaProvider>
    </>
  );
}

export default App;
