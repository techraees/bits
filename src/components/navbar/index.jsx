import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  home,
  logo,
  search,
  polygon,
  redPolygon,
} from "../../assets/index";
import HeaderNotificationBell from "./HeaderNotificationBell";
import HeaderMenuIcon from "./icons/HeaderMenuIcon";
import SwitchBtn from "../switchBtn";
import "./css/index.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Col, Modal, Tooltip } from "antd";
import { FaEthereum } from "react-icons/fa";
import { useLazyQuery } from "@apollo/client";
import { GET_PROFILE } from "../../gql/queries";
import profileimg from "../../assets/images/profile1.svg";
import LogoutModal from "../logoutModal";
import CookieConsent from "react-cookie-consent";
import PrivacyModal from "../privacyModal";
import ManageCookiesModal from "../manageCookiesModal";
import routes from "../../route";
import { trimAfterFirstSlash } from "../../utills/reusableFunctions";
import {
  getCookieStorage,
  removeCookieStorage,
} from "../../utills/cookieStorage";
import {
  getWalletChainId,
  subscribeWalletChain,
} from "../../utills/walletChain";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useWalletGateFlow } from "../../hooks/useWalletGateFlow";
import { logoutWallet } from "../../store/actions";
import {
  profileToUserData,
  emptyUserData,
} from "../../utills/hydrateUserProfile";
import { openConnectWalletModal } from "../connectModal/openConnectWalletModal";

const environment = process.env;

const navLinks = [
  { label: "Home", path: "/", end: true },
  { label: "Marketplace", path: "/marketplace" },
  { label: "About", path: "/about-us" },
  { label: "Contact", path: "/contact" },
];

const buildMenuGroups = (isLogged) => {
  const topLevel = [];
  const groups = {};

  routes.forEach((route) => {
    if (!route.isNav) return;
    if (route.layout === "private" && !isLogged) return;

    const item = {
      key: route.key,
      name: route.name,
      path: route.path,
      icon: route.icon,
      isDisabled: route.isDisabled,
    };

    if (route.belongsTo) {
      if (!groups[route.belongsTo]) {
        groups[route.belongsTo] = {
          key: `group-${route.belongsTo}`,
          name: route.belongsTo,
          icon: route.belongsToIcon,
          children: [],
        };
        topLevel.push(groups[route.belongsTo]);
      }
      groups[route.belongsTo].children.push(item);
    } else {
      topLevel.push(item);
    }
  });

  return topLevel;
};

const NavbarComponent = ({ dashboardNav }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [manageCookies, setManageCookies] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const nonNavbarRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/reset-password/success",
    "/404",
  ];

  const textColor = useSelector((state) => state.app.theme.textColor);
  const headerTheme = useSelector((state) => state.app.theme.headerTheme);
  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const contracts = useSelector((state) => state.contract);
  const fixedItems = useSelector((state) => state.fixedItems);
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
  const isLight = textColor === "black";
  const full_name = userData?.full_name;
  const userProfile = userData?.profileImg;

  const [profile, { error, data }] = useLazyQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
  });

  const handleLogin = () => navigate("/login");
  const handleSearch = () => navigate("/marketplace");
  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);
  const openPrivacyModal = () => setPrivacyModal(true);
  const handleManageCookiesModal = () => setManageCookies(true);

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

  useEffect(() => {
    const handleStorageChange = () => {
      const token = getCookieStorage("access_token");
      if (token) {
        profile({});
      }
    };
    window.addEventListener("storageChange", handleStorageChange);
    handleStorageChange();
    return () => {
      window.removeEventListener("storageChange", handleStorageChange);
    };
  }, [profile]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", "0px");
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setOpenGroup(null);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setOpenGroup(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const menuGroups = useMemo(() => buildMenuGroups(isLoggedIn), [isLoggedIn]);

  const handleMenuNavigate = (item) => {
    if (item.isDisabled) return;
    if (item.key === 10) {
      navigate(`/collections/${userData?.id}`);
    } else if (item.path) {
      navigate(item.path);
    }
    setMenuOpen(false);
    setOpenGroup(null);
    setMobileNavOpen(false);
  };

  const handleMenuButtonClick = () => {
    if (width < 992) {
      setMobileNavOpen((prev) => !prev);
      setMenuOpen(false);
      setOpenGroup(null);
    }
  };

  const handleMenuMouseEnter = () => {
    if (width >= 992) {
      setMenuOpen(true);
    }
  };

  const handleMenuMouseLeave = () => {
    if (width >= 992) {
      setMenuOpen(false);
      setOpenGroup(null);
    }
  };

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
      if (cancelled) return;
      if (ok) {
        applyChainSelection(pendingTargetChain);
      }
      setPendingTargetChain(null);
    });
    return () => {
      cancelled = true;
    };
  }, [pendingTargetChain, isConnected]);

  const handleChainSelect = async (targetChain) => {
    if (!isLoggedIn) {
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
    img.onload = () => setValidImage(true);
    img.onerror = () => setValidImage(false);
  }, [userProfile]);

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const renderHeaderMenu = () => (
    <div
      className="bits-header__menu-wrap"
      ref={menuRef}
      onMouseEnter={handleMenuMouseEnter}
      onMouseLeave={handleMenuMouseLeave}
    >
      <button
        type="button"
        className={`bits-header__menu-btn ${menuOpen ? "is-open" : ""}`}
        onClick={handleMenuButtonClick}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <HeaderMenuIcon />
      </button>

      {menuOpen && (
        <div
          className={`bits-header__dropdown ${isLight ? "is-light" : "is-dark"}`}
          role="menu"
        >
          {menuGroups.map((item) => {
            if (item.children) {
              const expanded = openGroup === item.key;
              return (
                <div key={item.key} className="bits-header__dropdown-group">
                  <button
                    type="button"
                    className={`bits-header__dropdown-item bits-header__dropdown-parent ${
                      expanded ? "is-expanded" : ""
                    }`}
                    onClick={() =>
                      setOpenGroup((prev) =>
                        prev === item.key ? null : item.key,
                      )
                    }
                  >
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt=""
                        className="bits-header__dropdown-icon"
                      />
                    )}
                    <span>{item.name}</span>
                    <span className="bits-header__dropdown-caret">
                      {expanded ? "▴" : "▾"}
                    </span>
                  </button>
                  {expanded && (
                    <div className="bits-header__dropdown-children">
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          type="button"
                          className={`bits-header__dropdown-item ${
                            child.isDisabled ? "is-disabled" : ""
                          }`}
                          disabled={child.isDisabled}
                          onClick={() => handleMenuNavigate(child)}
                        >
                          {child.icon && (
                            <img
                              src={child.icon}
                              alt=""
                              className="bits-header__dropdown-icon"
                            />
                          )}
                          <span>{child.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                className={`bits-header__dropdown-item ${
                  isActiveLink(item.path) ? "is-active" : ""
                } ${item.isDisabled ? "is-disabled" : ""}`}
                disabled={item.isDisabled}
                onClick={() => handleMenuNavigate(item)}
              >
                {item.icon && (
                  <img
                    src={item.icon}
                    alt=""
                    className="bits-header__dropdown-icon"
                  />
                )}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (nonNavbarRoutes?.includes(location?.pathname)) return null;

  const headerClass = [
    "bits-header",
    dashboardNav
      ? headerTheme || "dashboardNavBgColor"
      : headerTheme || "navbarBgColor",
    isLight ? "bits-header--light" : "bits-header--dark",
    mobileNavOpen ? "bits-header--mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass}>
        {isModalOpen && (
          <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={false}
            className="logoutModal"
            width={300}
            centered={width < 992}
            zIndex={100000200}
            maskStyle={{ zIndex: 100000190 }}
            wrapClassName="logoutWrap"
          >
            <LogoutModal handleOk={handleOk} />
          </Modal>
        )}

        <div className="bits-header__inner">
          <div className="bits-header__brand">
            <NavLink
              to="/"
              className="bits-header__logo"
              aria-label="BITS NFT Home"
            >
              <img src={logo} alt="BITS NFT" />
            </NavLink>

            <nav className="bits-header__nav" aria-label="Primary">
              {navLinks.map((link) => {
                const active = isActiveLink(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={`bits-header__link ${active ? "is-active" : ""}`}
                  >
                    {link.path === "/" && (
                      <img
                        src={home}
                        alt=""
                        className="bits-header__home-icon"
                      />
                    )}
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div
            className={`bits-header__actions ${full_name ? "bits-header__actions--logged-in" : ""}`}
          >
            {!full_name && (
              <>
                <button
                  type="button"
                  className="bits-header__icon-btn"
                  onClick={handleSearch}
                  aria-label="Search marketplace"
                >
                  <img src={search} alt="" />
                </button>

                <div
                  className={`bits-header__chains ${isLight ? "is-light" : "is-dark"}`}
                >
                  <div className="bits-header__chains-label">
                    <span>Chains</span>
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
                  <div className="bits-header__chains-icons">
                    <FaEthereum
                      cursor="pointer"
                      onClick={() => handleChainSelect(1)}
                      className={`chainIcon ${iconClicked ? "red" : ""}`}
                      title="Ethereum"
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
                      alt="Polygon"
                      onClick={() => handleChainSelect(137)}
                      width={15}
                      height={15}
                    />
                  </div>
                </div>
              </>
            )}

            {!full_name ? (
              <>
                <button
                  type="button"
                  className="bits-header__wallet-btn"
                  onClick={handleLogin}
                >
                  Connect Wallet
                </button>
                <div className="bits-header__theme">
                  <SwitchBtn toggleBtn={textColor === "white"} />
                </div>
                <button
                  type="button"
                  className="bits-header__auth-link"
                  onClick={handleLogin}
                >
                  Sign up/Login
                </button>
                {renderHeaderMenu()}
              </>
            ) : (
              <>
                {!isConnected && (
                  <button
                    type="button"
                    className="bits-header__wallet-btn"
                    onClick={openConnectWalletModal}
                  >
                    Connect Wallet
                  </button>
                )}
                <HeaderNotificationBell isLight={isLight} />
                <div className="bits-header__theme">
                  <SwitchBtn toggleBtn={textColor === "white"} />
                </div>
                {renderHeaderMenu()}
                <button
                  type="button"
                  className="bits-header__profile"
                  onClick={showModal}
                >
                  <span className="nav-fullname-truncate">
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
                    height={30}
                    alt="profile"
                  />
                </button>
              </>
            )}
          </div>
        </div>

        {mobileNavOpen && width < 992 && (
          <div className="bits-header__mobile-panel">
            <nav className="bits-header__mobile-nav" aria-label="Mobile">
              {navLinks.map((link) => {
                const active = isActiveLink(link.path);
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={`bits-header__link ${active ? "is-active" : ""}`}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.path === "/" && (
                      <img
                        src={home}
                        alt=""
                        className="bits-header__home-icon"
                      />
                    )}
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div
              className={`bits-header__mobile-menu ${isLight ? "is-light" : "is-dark"}`}
            >
              {menuGroups.map((item) => {
                if (item.children) {
                  const expanded = openGroup === item.key;
                  return (
                    <div key={item.key} className="bits-header__dropdown-group">
                      <button
                        type="button"
                        className={`bits-header__dropdown-item bits-header__dropdown-parent ${
                          expanded ? "is-expanded" : ""
                        }`}
                        onClick={() =>
                          setOpenGroup((prev) =>
                            prev === item.key ? null : item.key,
                          )
                        }
                      >
                        {item.icon && (
                          <img
                            src={item.icon}
                            alt=""
                            className="bits-header__dropdown-icon"
                          />
                        )}
                        <span>{item.name}</span>
                        <span className="bits-header__dropdown-caret">
                          {expanded ? "▴" : "▾"}
                        </span>
                      </button>
                      {expanded && (
                        <div className="bits-header__dropdown-children">
                          {item.children.map((child) => (
                            <button
                              key={child.key}
                              type="button"
                              className="bits-header__dropdown-item"
                              disabled={child.isDisabled}
                              onClick={() => handleMenuNavigate(child)}
                            >
                              {child.icon && (
                                <img
                                  src={child.icon}
                                  alt=""
                                  className="bits-header__dropdown-icon"
                                />
                              )}
                              <span>{child.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`bits-header__dropdown-item ${
                      isActiveLink(item.path) ? "is-active" : ""
                    }`}
                    disabled={item.isDisabled}
                    onClick={() => handleMenuNavigate(item)}
                  >
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt=""
                        className="bits-header__dropdown-icon"
                      />
                    )}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="bits-header__mobile-extras">
              <div
                className={`bits-header__chains ${isLight ? "is-light" : "is-dark"}`}
              >
                <div className="bits-header__chains-label">
                  <span>Chains</span>
                </div>
                <div className="bits-header__chains-icons">
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
                    alt="Polygon"
                    onClick={() => handleChainSelect(137)}
                    width={15}
                    height={15}
                  />
                </div>
              </div>
              {!full_name ? (
                <>
                  <button
                    type="button"
                    className="bits-header__wallet-btn"
                    onClick={handleLogin}
                  >
                    Connect Wallet
                  </button>
                  <button
                    type="button"
                    className="bits-header__auth-link"
                    onClick={handleLogin}
                  >
                    Sign up/Login
                  </button>
                </>
              ) : (
                <>
                  {!isConnected && (
                    <button
                      type="button"
                      className="bits-header__wallet-btn"
                      onClick={openConnectWalletModal}
                    >
                      Connect Wallet
                    </button>
                  )}
                  <button
                    type="button"
                    className="bits-header__profile"
                    onClick={showModal}
                  >
                  <span className="nav-fullname-truncate">{full_name}</span>
                  <img
                    src={
                      validImage
                        ? `${environment.REACT_APP_BACKEND_BASE_URL}/${userProfile}`
                        : profileimg
                    }
                    width={30}
                    height={30}
                    alt="profile"
                  />
                </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

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
