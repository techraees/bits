import React, { useEffect, useLayoutEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import "./elements.css";
import { updateAccount } from "../store/actions";
import PublicLayout from "../views/public";
import PrivateLayout from "../views/private";
import { NavbarComponent } from "../components";

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
    web3 &&
      window.ethereum.on("accountsChanged", async (data) => {
        dispatch(updateAccount(data[0]));
      });
  }, [web3, account]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ minHeight: "100vh" }} className={`${backgroundTheme}`}>
        <div className="footer-logo">
          <img src={logo} width={60} alt="logo" />
        </div>
        <NavbarComponent dashboardNav />
        <PublicLayout />
        <PrivateLayout />
      </div>
    </BrowserRouter>
  );
};

export default Layout;
