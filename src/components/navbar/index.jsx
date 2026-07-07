import React, { useEffect, useState } from "react";
import {
  home,
  logo,
  menu_icon,
  search,
  polygon,
  redPolygon,
} from "../../assets/index";
import MenuComponent from "../menu";
import SwitchBtn from "../switchBtn";
import "./css/index.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FaEthereum } from "react-icons/fa";
import { useLazyQuery } from "@apollo/client";
import { GET_PROFILE } from "../../gql/queries";
import profileimg from "../../assets/images/profile1.svg";
import { Col, Modal, Tooltip } from "antd";
import LogoutModal from "../logoutModal";
import CookieConsent from "react-cookie-consent";
// import NotificationModal from "../notificationModal";
import PrivacyModal from "../privacyModal";
import ManageCookiesModal from "../manageCookiesModal";
import routes from "../../route";
import { trimAfterFirstSlash } from "../../utills/reusableFunctions";
import { getCookieStorage, removeCookieStorage } from "../../utills/cookieStorage";
import {
  getWalletChainId,
  subscribeWalletChain,
} from "../../utills/walletChain";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useWalletGateFlow } from "../../hooks/useWalletGateFlow";
import { logoutWallet } from "../../store/actions";
import { profileToUserData, emptyUserData } from "../../utills/hydrateUserProfile";

const environment = process.env;

const NavbarComponent = ({ dashboardNav }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [menuBar, setMenuBar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [manageCookies, setManageCookies] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const nonNavbarRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/reset-password/success",
    "/404",
  ];

  const handleMenu = () => {
    setMenuBar(!menuBar);
  };

  const textColor = useSelector((state) => state.app.theme.textColor);

  const headerTheme = useSelector((state) => state.app.theme.headerTheme);
  const handleLogin = () => {
    navigate("/login");
  };

  const [profile, { error, data }] = useLazyQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const contracts = useSelector((state) => state.contract);
  const fixedItems = useSelector((state) => state.fixedItems);

  // Gates all wallet connect/switch prompts AND passive wallet reads below -
  // logged-out visitors are just browsing by chain, so the site shouldn't
  // talk to the wallet (or show wallet-derived UI) until they're logged in.
  const isLoggedIn = Boolean(userData?.isLogged);

  const { isConnected } = useAppKitAccount();
  const { chainId: walletChainId } = useAppKitNetwork();
  const [liveWalletChainId, setLiveWalletChainId] = useState(null);
  const {
    openAppKitConnect,
    ensureWalletOnChain,
    pendingTargetChain,
    setPendingTargetChain,
  } = useWalletGateFlow();

  const effectiveWalletChainId =
    liveWalletChainId ?? (walletChainId != null ? Number(walletChainId) : null);

  useEffect(() => {
    if (!isConnected || !isLoggedIn) {
      setLiveWalletChainId(null);
      return;
    }

    let cancelled = false;

    getWalletChainId().then((chainId) => {
      if (!cancelled && chainId != null) {
        setLiveWalletChainId(chainId);
      }
    });

    const unsubscribe = subscribeWalletChain((chainId) => {
      setLiveWalletChainId(chainId);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isConnected, isLoggedIn]);

  const isLight = textColor === "black";

  const full_name = userData?.full_name;
  const userProfile = userData?.profileImg;
  const imgPath = environment.REACT_APP_BACKEND_BASE_URL + "/" + userProfile;

  const dispatch = useDispatch();

  const handleEthChain = () => {
    dispatch({
      type: "ETH_CHAIN",
      contractData: {
        marketContract: contracts.ethMarketContractIns,
        mintContract: contracts.ethMintingContractIns,
        chain: 1,
      },
    });

    dispatch({
      type: "ETH_CHAIN_FIXED",
      fixedItemData: fixedItems.ethList,
    });
  };

  const handleMaticChain = () => {
    dispatch({
      type: "MATIC_CHAIN",
      contractData: {
        marketContract: contracts.polygonMarketContractIns,
        mintContract: contracts.polygonMintingContractIns,
        chain: 137,
      },
    });
    dispatch({
      type: "MATIC_CHAIN_FIXED",
      fixedItemData: fixedItems.maticList,
    });
  };

  useEffect(() => {
    if (data?.GetProfile) {
      dispatch({
        type: "NFT_ADDRESS",
        userData: profileToUserData(data.GetProfile),
      });
    }
  }, [data, dispatch]);

  // console.log(menuBar, "menu");

  useEffect(() => {
    const handleStorageChange = () => {
      const token = getCookieStorage("access_token");
      if (token) {
        profile({});
      }
    };

    window.addEventListener("storageChange", handleStorageChange);

    // Call once on mount too
    handleStorageChange();

    return () => {
      window.removeEventListener("storageChange", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "80px" : "256px",
    );
  }, [collapsed]);

  useEffect(() => {
    if (error?.message === "jwt expired") {
      dispatch({
        type: "USER_AUTH_RESET",
        userData: emptyUserData,
      });
      removeCookieStorage("access_token");
      removeCookieStorage("refresh_token");
      dispatch(logoutWallet());
      navigate("/login");
    }
  }, [error, dispatch, navigate]);
  const [showRedImage, setShowRedImage] = useState(false);
  const [iconClicked, setIconClicked] = useState(false);

  // Was `[]` before, so the icons only ever reflected contractData.chain at
  // mount time and never updated if the chain changed elsewhere (e.g. after
  // a guided network switch completes).
  useEffect(() => {
    if (!contractData?.chain) return;

    if (contractData.chain === 1) {
      setIconClicked(true);
      setShowRedImage(true);
    } else {
      setShowRedImage(false);
      setIconClicked(false);
    }
  }, [contractData?.chain]);

  const applyChainSelection = (targetChain) => {
    if (targetChain === 1) {
      handleEthChain();
    } else {
      handleMaticChain();
    }
  };

  useEffect(() => {
    if (!pendingTargetChain || !isConnected) {
      return;
    }

    let cancelled = false;

    ensureWalletOnChain(pendingTargetChain).then((ok) => {
      if (cancelled) {
        return;
      }

      if (ok) {
        applyChainSelection(pendingTargetChain);
      }

      setPendingTargetChain(null);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTargetChain, isConnected]);

  // If the wallet is connected on a different chain than the one the user
  // just picked, guide them through switching it instead of only letting
  // them find out via a toast at mint/list/bid/purchase time.
  const handleChainSelect = async (targetChain) => {
    if (!isLoggedIn) {
      // Logged-out users are just browsing by chain (e.g. the Marketplace
      // filter) - don't force a wallet connect/switch prompt for that.
      applyChainSelection(targetChain);
      return;
    }

    if (!isConnected) {
      setPendingTargetChain(targetChain);
      await openAppKitConnect();
      return;
    }

    const isMismatched =
      effectiveWalletChainId != null && effectiveWalletChainId !== targetChain;

    if (isMismatched) {
      const ok = await ensureWalletOnChain(targetChain);
      if (ok) {
        applyChainSelection(targetChain);
      }
      return;
    }

    applyChainSelection(targetChain);
  };

  const isChainMismatched =
    isLoggedIn &&
    isConnected &&
    effectiveWalletChainId != null &&
    effectiveWalletChainId !== Number(contractData?.chain);

  const openPrivacyModal = () => {
    setPrivacyModal(true);
  };

  const handleManageCookiesModal = () => {
    setManageCookies(true);
  };

  const getPageName = (pathName) => {
    const pageName = routes?.find(
      (route) =>
        trimAfterFirstSlash(route?.path) === trimAfterFirstSlash(pathName),
    )?.name;
    return pageName === "Home" ? "" : pageName;
  };

  const [validImage, setValidImage] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    const img = new Image();
    img.src = `${environment.REACT_APP_BACKEND_BASE_URL}/${userProfile}`;

    img.onload = () => setValidImage(true); // image exists
    img.onerror = () => setValidImage(false); // not found
  }, [userProfile]);

  if (nonNavbarRoutes?.includes(location?.pathname)) return null;

  return (
    <>
      <Navbar
        className={`dashboardNavBgColor ${
          dashboardNav
            ? headerTheme || "dashboardNavBgColor"
            : headerTheme || "navbarBgColor"
        }`}
        expand="lg"
        sticky="top"
        style={{ zIndex: 100000000 }}
      >
        {isModalOpen && (
          <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={false}
            className="logoutModal"
            width={300}
            centered={width < 992 && true}
            zIndex={100000200}
            maskStyle={{ zIndex: 100000190 }}
            wrapClassName="logoutWrap"
          >
            <LogoutModal handleOk={handleOk} />
          </Modal>
        )}

        <Navbar.Brand className="web-nav-brand">
          <img
            onClick={toggleCollapsed}
            src={menu_icon}
            className="cursor ms-4 menuBarWebView web-nav"
            alt="menu-icon"
          />
        </Navbar.Brand>
        <Container>
          {full_name && (
            <img
              onClick={handleMenu}
              src={menu_icon}
              className="cursor ms-4 mob-nav "
              alt="icon"
            />
          )}
          <Navbar.Brand>
            <div className="nav-logo">
              <NavLink to="/" className="white d-flex">
                <img
                  src={logo}
                  className="cursor"
                  style={{ width: 50, height: 50 }}
                  alt="logo"
                />
              </NavLink>
            </div>
          </Navbar.Brand>
          <div className="topmenu">
            <div className="d-flex align-items-center justify-content-center loginbtn">
              {!full_name ? (
                <>
                  <div className="connentbtn">
                    <Nav.Link className="white mx-2 " onClick={handleLogin}>
                      Login
                    </Nav.Link>
                    <Nav.Link
                      className="white mx-2  walletBtn d-flex justify-content-center align-items-center"
                      onClick={handleLogin}
                    >
                      <span>
                        {/* {width < 575 ? <CiWallet /> : "Connect Wallet"} */}
                      </span>
                    </Nav.Link>
                  </div>
                  <div className="connectIcon d-flex align-items-center">
                    <Nav.Link className="white" onClick={handleLogin}>
                      Sign up/Login
                    </Nav.Link>
                    <Nav.Link
                      className="white mx-2 walletBtn d-flex justify-content-center align-items-center"
                      onClick={handleLogin}
                    >
                      <span>
                        {/* {width < 575 ? <CiWallet /> : "Connect Wallet"} */}
                        Connect Wallet
                      </span>
                    </Nav.Link>
                    <div style={{ margin: "5px 0 0 1rem" }}>
                      <SwitchBtn toggleBtn={textColor === "white"} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center">
                  <Nav.Link
                    className="white mx-1 d-flex"
                    onClick={() => showModal()}
                  >
                    <span className="me-2 mt-1 nav-fullname-truncate">
                      <abbr title={full_name} className="nav-fullname-abbr">
                        {full_name}
                      </abbr>
                    </span>
                    <img
                      src={
                        validImage
                          ? `${environment.REACT_APP_BACKEND_BASE_URL}/${userProfile}`
                          : profileimg
                      }
                      width={30}
                      style={{ borderRadius: "50%" }}
                      alt="profile"
                    />
                  </Nav.Link>
                  <Nav.Link className="white">
                    <SwitchBtn toggleBtn={textColor === "white"} />
                  </Nav.Link>
                </div>
              )}
            </div>
          </div>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className={
              headerTheme === "white-navbar" ? "toggle-light" : "toggle-dark"
            }
          />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav
              className={
                "d-flex align-items-center justify-content-between first-nav navBarPadding"
              }
            >
              <NavLink
                to="/"
                className="white d-flex  mobile_navlink no_padding_top"
              >
                <img
                  src={home}
                  className="mx-2"
                  style={{ width: "16px", height: "22px" }}
                  alt="home"
                />
                <span>Home</span>
              </NavLink>
              <Nav.Link
                className="white mobile_navlink text-nowrap"
                onClick={() => navigate("/marketplace")}
              >
                Marketplace
              </Nav.Link>
              <Nav.Link
                className="white mobile_navlink"
                onClick={() => navigate("/about-us")}
              >
                About
              </Nav.Link>
              <NavLink to="/contact" className="white mobile_navlink">
                Contact
              </NavLink>
            </Nav>
            <div
              className={`chainDiv ${isLight ? "chain-light" : "chain-dark"}`}
            >
              <div className="leftChainDiv">
                <span>
                  {contractData?.chain === 1 ? "Ethereum" : "Polygon"}
                </span>
                {isChainMismatched && (
                  <Tooltip
                    title={`Your wallet is on a different network. Click ${
                      contractData?.chain === 1 ? "ETH" : "Polygon"
                    } to switch it.`}
                  >
                    <span className="chain-mismatch-dot" />
                  </Tooltip>
                )}
              </div>
              <div className="rightChainDiv">
                <FaEthereum
                  cursor="pointer"
                  onClick={() => handleChainSelect(1)}
                  className={`chainIcon ${iconClicked ? "red" : ""}`}
                />
                <img
                  className={`ethIcon ${showRedImage ? "" : "hidden"}`}
                  src={polygon}
                  alt="Polygon"
                  onClick={() => handleChainSelect(137)}
                  width={15}
                  height={15}
                />
                <img
                  className={`ethIcon red ${showRedImage ? "hidden" : ""}`}
                  src={redPolygon}
                  alt="Red Polygon"
                  onClick={() => handleChainSelect(137)}
                  width={15}
                  height={15}
                />
              </div>
            </div>
            <Nav className="ms-auto bottom-nav">
              {!full_name ? (
                <div className="d-flex align-items-center justify-content-center navbar-menu1">
                  <Nav.Link className="white mx-2" onClick={handleLogin}>
                    Sign up/Login
                  </Nav.Link>
                  <Nav.Link
                    className="white mx-2 walletBtn d-flex justify-content-center align-items-center"
                    onClick={handleLogin}
                  >
                    <span>Connect Wallet</span>
                  </Nav.Link>
                  <SwitchBtn toggleBtn={textColor === "white"} />
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center">
                  <Nav.Link className="white mx-1">
                    <img src={search} className="" alt="search" />
                  </Nav.Link>
                  {/* <NotificationModal /> */}
                  <Nav.Link
                    className="white mx-1 d-flex"
                    onClick={() => showModal()}
                  >
                    <span className="me-2 mt-1">{full_name}</span>
                    {profileimg ? (
                      <img
                        src={imgPath}
                        width={30}
                        className=""
                        style={{ borderRadius: "50%" }}
                        alt="profile"
                        onError={(e) => {
                          e.target.src = profileimg;
                        }}
                      />
                    ) : (
                      <img
                        src={profileimg}
                        width={30}
                        className=""
                        style={{ borderRadius: "50%" }}
                        alt="profile"
                      />
                    )}
                  </Nav.Link>
                  <Nav.Link className="white">
                    <SwitchBtn toggleBtn={textColor === "white"} />
                  </Nav.Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {menuBar && (
        <MenuComponent
          toggleCollapsed={toggleCollapsed}
          menuHandle={menuBar ? true : collapsed}
          className=" menuBarWebView   mobile-slide-menu"
        />
      )}

      <MenuComponent
        toggleCollapsed={toggleCollapsed}
        menuHandle={collapsed}
        className="menuBarWebView mobile-slide-menu web-nav"
      />

      {getPageName(location?.pathname) && (
        <div className={`${headerTheme} p-2`} style={{ textAlign: "center" }}>
          <span className="light-grey fs-5">
            {getPageName(location?.pathname)}
          </span>
        </div>
      )}
      <div>
        <CookieConsent
          location="bottom"
          buttonText="Accept Cookies"
          cookieName="cookieConsentCookie"
          style={{ background: "#F3F3F3", alignItems: "center" }}
          buttonStyle={{
            color: "#ffffff",
            backgroundColor: "#9f2323",
            fontSize: "13px",
            padding: "10px 40px",
            borderRadius: "40px",
          }}
          expires={365}
        >
          <Container className="py-4">
            <Col span={18}>
              <h3 className="ms-0 fw-bold">We respect your privacy</h3>
              <p className="text-black">
                We use cookies to operate this website, improve usability,
                personalize your experience, and improve our marketing. Your
                privacy is important to us, and we will never sell your data.
                For more information see our{" "}
                <span
                  style={{
                    color: "#B83131",
                    fontWeight: "600",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={openPrivacyModal}
                >
                  Privacy Policy
                </span>
              </p>
              {/* 
            <p  style={{color: '#B83131', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', position: 'absolute', right: '-60%', top: '75px'}}>Manage Cookies</p> */}
            </Col>
          </Container>
          <p
            style={{
              color: "#B83131",
              fontWeight: "600",
              textDecoration: "underline",
              cursor: "pointer",
              position: "absolute",
              right: "45px",
              top: "120px",
            }}
            onClick={handleManageCookiesModal}
          >
            Manage Cookies
          </p>
        </CookieConsent>

        {privacyModal && (
          <PrivacyModal
            privacyModal={privacyModal}
            setPrivacyModal={setPrivacyModal}
          />
        )}
        {manageCookies && (
          <ManageCookiesModal
            manageCookies={manageCookies}
            setManageCookies={setManageCookies}
          />
        )}
      </div>
    </>
  );
};

export default NavbarComponent;
