import { useEffect } from "react";
import { Provider } from "react-redux";
import "../src/theme/theme.css";
import "./App.css";
import ZendeskComp from "./components/zendesk";
import { loadContractIns } from "./store/actions";
import store from "./store/index";
import Layout from "./layout/index";
import { removeStorage } from "./utills/localStorage";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, polygon } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
const projectId = process.env.REACT_APP_REOWN_ID;
const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY;
const customRpcUrls = infuraApiKey ? {
  "eip155:1": [{
    url: `https://mainnet.infura.io/v3/${infuraApiKey}`
  }],
  "eip155:137": [{
    url: `https://polygon-mainnet.infura.io/v3/${infuraApiKey}`
  }]
} : undefined;
const metadata = {
  name: "BITS",
  description: "A NFT Marketplace",
  url: "https://www.bitsnft.com",
  icons: ["https://www.bitsnft.com"]
};
createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [mainnet, polygon],
  projectId,
  ...(customRpcUrls ? {
    customRpcUrls
  } : {}),
  features: {
    analytics: false,
    email: false,
    socials: [],
    emailShowWallets: false
  }
});
function App() {
  useEffect(() => {
    if (!sessionStorage.getItem("legacyWalletStorageCleared")) {
      removeStorage("walletconnect");
      removeStorage("WALLETCONNECT_DEEPLINK_CHOICE");
      sessionStorage.setItem("legacyWalletStorageCleared", "true");
    }
    store.dispatch(loadContractIns());
  }, []);
  return <>
      <Provider store={store}>
        <Layout />
        <ZendeskComp />
      </Provider>
    </>;
}
export default App;
