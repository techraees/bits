import React, { useEffect, useLayoutEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import logo from "../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import "./elements.css";
import { updateAccount } from "../store/actions";
import ActionTypes from "../store/contants/ActionTypes";
import PublicLayout from "../views/public";
import PrivateLayout from "../views/private";
import { NavbarComponent, Footer } from "../components";
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
const Layout = () => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const dispatch = useDispatch();
  const { web3, account } = useSelector((state) => state.web3.walletData);
  useEffect(() => {
    if (!web3 || !window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      dispatch(updateAccount(accounts[0]));
    };
    const handleChainChanged = async (chainIdHex) => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const chainId = parseInt(chainIdHex, 16);
        dispatch({
          type: ActionTypes.WEB3CONNECT,
          payload: {
            address,
            web3: provider,
            chainId,
            signer,
          },
        });
      } catch (error) {}
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [web3, account, dispatch]);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div
        style={{
          minHeight: "100vh",
        }}
        className={`${backgroundTheme}`}
      >
        <div className="footer-logo">
          <img src={logo} width={60} alt="logo" />
        </div>
        <NavbarComponent dashboardNav />
        <PublicLayout />
        <PrivateLayout />
        <Footer />
      </div>
    </BrowserRouter>
  );
};
export default Layout;
