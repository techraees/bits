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
import { Col, Modal } from "antd";
import LogoutModal from "../logoutModal";
import CookieConsent from "react-cookie-consent";
import NotificationModal from "../notificationModal";
import PrivacyModal from "../privacyModal";
import ManageCookiesModal from "../manageCookiesModal";
import { getStorage } from "../../utills/localStorage";
import routes from "../../route";
import { trimAfterFirstSlash } from "../../utills/reusableFunctions";

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

  const full_name = userData?.full_name;
  const userProfile = userData?.profileImg;
  const imgPath = environment.REACT_APP_BACKEND_BASE_URL + "/" + userProfile;

  const dispatch = useDispatch();

  const handleEthChain = () => {
    dispatch({
      type: "ETH_CHAIN",
      contractData: {
        marketContract: contracts.ethContractIns,
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
        marketContract: contracts.polygonContractIns,
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
    if (data) {
      const GetProfile = data?.GetProfile;

      const id = GetProfile?.id;
      const user_address = GetProfile?.user_address;
      const full_name = GetProfile?.full_name;
      const country = GetProfile?.country;
      const bio = GetProfile?.bio;
      const profileImg = GetProfile?.profileImg;
      const token = GetProfile?.token;

      dispatch({
        type: "NFT_ADDRESS",
        userData: {
          address: user_address,
          full_name: full_name,
          country: country,
          bio: bio,
          profileImg: profileImg,
          id,
          token,
          isLogged: true,
        },
      });
    }
  }, [data]);

  // console.log(menuBar, "menu");

  useEffect(() => {
    let token = getStorage("token");
    console.log("token", token);
    if (token) {
      profile({
        variables: {
          token: token,
        },
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (error?.message === "jwt expired") {
      // navigate("/login");
    }
  }, [error]);
  const [showRedImage, setShowRedImage] = useState(false);
  const [iconClicked, setIconClicked] = useState(false);

  useEffect(() => {
    if (contractData?.chain) {
      if (contractData.chain === 1) {
        setIconClicked(true);
        setShowRedImage(true);
      } else if (contractData.chain === 137) {
        setShowRedImage(false);
        setIconClicked(false);
      } else {
        setShowRedImage(false);
        setIconClicked(false);
      }
    }
  }, []);

  const toggleIconColor = () => {
    handleEthChain();
    setIconClicked(true);
    setShowRedImage(true);
  };

  const toggleImage = () => {
    handleMaticChain();
    setShowRedImage(false);
    setIconClicked(false);
  };

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
  if (nonNavbarRoutes?.includes(location?.pathname)) return null;

  return (
    <>
      <Navbar
        className={`${dashboardNav ? "dashboardNavBgColor" : "navbarBgColor"}`}
        expand="lg"
        sticky="top"
        style={{ zIndex: 1 }}
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
          >
            <LogoutModal handleOk={handleOk} />
          </Modal>
        )}

        <Navbar.Brand>
          <img
            onClick={toggleCollapsed}
            src={menu_icon}
            className="cursor ms-4 menuBarWebView"
            alt="menu-icon"
          />
        </Navbar.Brand>
        <Container>
          {full_name && (
            <img
              onClick={handleMenu}
              src={menu_icon}
              className="cursor ms-4 menuBarMobView"
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
                      Login
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
                    <span className="me-2 mt-1">{full_name}</span>
                    {userProfile ? (
                      <img
                        src={imgPath}
                        width={30}
                        className=""
                        style={{ borderRadius: "50%" }}
                        alt="imgPath"
                      />
                    ) : (
                      <img
                        src={profileimg}
                        width={30}
                        className=""
                        style={{ borderRadius: "50%" }}
                        alt="profileImg"
                      />
                    )}
                  </Nav.Link>
                  <Nav.Link className="white">
                    <SwitchBtn toggleBtn={textColor === "white"} />
                  </Nav.Link>
                </div>
              )}
            </div>
          </div>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="" />
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
                className="white mobile_navlink"
                onClick={() => navigate("/video-gallery")}
              >
                Emote/Video gallery
              </Nav.Link>
              <Nav.Link
                className="white mobile_navlink"
                onClick={() => navigate("/marketplace")}
              >
                NFT Marketplace
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
            <div className="chainDiv">
              <div className="leftChainDiv">Chains</div>
              <div className="rightChainDiv">
                {/* <FaEthereum cursor="pointer"  onClick={handleChain}/>
                <img className="ethIcon" src={polygon} /> */}
                <FaEthereum
                  cursor="pointer"
                  onClick={toggleIconColor}
                  className={iconClicked ? "red" : ""}
                />
                <img
                  className={`ethIcon ${showRedImage ? "" : "hidden"}`}
                  src={polygon}
                  alt="Polygon"
                  onClick={toggleImage}
                  width={15}
                  height={15}
                />
                <img
                  className={`ethIcon red ${showRedImage ? "hidden" : ""}`}
                  src={redPolygon}
                  alt="Red Polygon"
                  onClick={toggleImage}
                  width={15}
                  height={15}
                />
              </div>
            </div>
            <Nav className="ms-auto bottom-nav">
              {!full_name ? (
                <div className="d-flex align-items-center justify-content-center navbar-menu1">
                  <Nav.Link className="white mx-2" onClick={handleLogin}>
                    Login
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
                  <NotificationModal />
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

      <MenuComponent
        toggleCollapsed={toggleCollapsed}
        menuHandle={menuBar ? true : collapsed}
        className="menuBarWebView"
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
