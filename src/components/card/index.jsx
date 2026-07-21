import "./css/index.css";
import { Card, Tooltip, Popover, Avatar } from "antd";
import { FaCheckCircle } from "react-icons/fa";
import {
  check,
  cross,
  marketcardimg,
  profile,
  thumb,
  watchedIcon,
  likedIcon,
  search,
} from "../../assets";
import { useMutation, useLazyQuery } from "@apollo/client";
import { UPDATE_NFT_LIKE, UPDATE_NFT_WATCH } from "../../gql/mutations";
import { GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE } from "../../gql/queries";
import { Button, Space } from "antd";
import ButtonComponent from "../button";
import ReactPlayer from "react-player/lazy";
import { OfferModal, StepperModal } from "../index";
import { Modal } from "antd";
import { NftDetailsModal } from "../index";
import React, { useEffect, useState } from "react";
import Timercomp from "../timerComp";
import { Link, useLocation, useNavigate } from "react-router-dom";
import profileimg from "../../assets/images/profile1.png";
import { ETHTOUSD, MATICTOUSD } from "../../utills/currencyConverter";
import { useSelector } from "react-redux";
import { ToastMessage } from "../../components";
import { getSession } from "../../config/deepmotion";
import { downloadVideo } from "../../config/deepmotion";
import { loadStripe } from "@stripe/stripe-js";
import DownloadModal from "../Modal/DownloadModal";
import PaymentConfirmation from "../Modal/PaymentConfirmation";
import ShowTopNFTPopup from "../../ShowTopNFTPopup";
import { trimWallet } from "../../utills/trimWalletAddr";
const env = process.env;
const CardCompnent = ({
  description,
  image,
  status,
  name,
  videoLink,
  topName,
  collectionBtn,
  detailBtn,
  marketplacecard,
  sellnft,
  artistName,
  userProfile,
  navigateTo,
  userId,
  isOwner,
  auctionStartTime,
  auctionEndTime,
  initialPrice,
  auctionid,
  numberofcopies,
  currentBidAmount,
  nftOwner,
  royalty,
  tokenId,
  fixtokenId,
  fixOwner,
  fixRoyalty,
  fixCopies,
  id,
  isAuction,
  isEmote,
  rid,
  likeCount,
  watchCount,
  isPaid,
  duration,
  sellerUsername,
  itemDbId,
  isTopNfts,
  userObj,
}) => {
  const isLight = useSelector((s) => s.app?.theme?.textColor === "black");
  const navigate = useNavigate();
  const ArtistPopoverWrapper = ({ displayName, children }) => (
    <Popover
      content={
        <div
          style={{
            width: "240px",
            position: "relative",
          }}
        >
          <div className="artist-card-header" />
          <div className="avatar-wrapper">
            <Avatar
              size={90}
              src={
                userObj?.profileImg
                  ? `${env.REACT_APP_BACKEND_BASE_URL}/${userObj?.profileImg}`
                  : null
              }
              style={{
                backgroundColor: "#B23232",
                border: `5px solid ${!isLight ? "#1a1a1a" : "#ffffff"}`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              }}
            >
              {userObj?.user_name?.charAt(0) || displayName?.charAt(0)}
            </Avatar>
          </div>

          <div className="artist-details-body">
            <div className="verified-tag">
              <FaCheckCircle
                size={10}
                style={{
                  marginRight: "4px",
                }}
              />
              VERIFIED CREATOR
            </div>

            <h6
              className="m-0 fw-bold"
              style={{
                fontSize: "18px",
                letterSpacing: "0.2px",
                color: !isLight ? "white" : "black",
              }}
            >
              {userObj?.full_name ||
                userObj?.user_name ||
                displayName ||
                "Artist"}
            </h6>

            <p
              className="m-0 mt-2"
              style={{
                fontSize: "11px",
                opacity: 0.8,
                letterSpacing: "1px",
                fontFamily: "monospace",
                borderRadius: "4px",
                background: !isLight
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(178, 50, 50, 0.05)",
                padding: "4px 0",
                color: !isLight ? "#b0b0b0" : "#666666",
              }}
            >
              {userObj?.user_address && trimWallet(userObj?.user_address)}
            </p>

            {userObj?.bio && (
              <div
                className="artist-bio-box"
                style={{
                  width: "100%",
                }}
              >
                <p
                  className="m-0"
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.5",
                    fontStyle: "italic",
                    textAlign: "left",
                    opacity: 0.9,
                    color: !isLight ? "#e0e0e0" : "#444444",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  "{userObj?.bio}"
                </p>
              </div>
            )}

            <button
              className="view-profile-btn"
              style={{
                color: "#b23232 !important",
                border: "1px solid #b23232",
                marginTop: "15px",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/collections/${userObj?._id || userId}`);
              }}
            >
              VIEW FULL PROFILE
            </button>
          </div>
        </div>
      }
      title={null}
      trigger="hover"
      placement="right"
      color={!isLight ? "#1a1a1a" : "#ffffff"}
      overlayClassName={`artist-popover ${!isLight ? "dark-grey-bg-popover" : "bg-white-popover"}`}
    >
      {children}
    </Popover>
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isNftModalOpen, setIsNftModalOpen] = useState(false);
  const [isTopModalOpen, setIsTopModalOpen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showpayment, setShowPayment] = useState(false);
  const [fixedData, setFixedData] = useState([]);
  const [auctionData, setAuctionData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageAuction, setPageAuction] = useState(1);
  const [limit, setLimit] = useState(1);
  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [updateNftLike, { data }] = useMutation(UPDATE_NFT_LIKE);
  const { userData } = useSelector((state) => state.address.userData);
  const [updateNftWatch] = useMutation(UPDATE_NFT_WATCH);
  const [fetchAuctionData] = useLazyQuery(
    GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
  );
  const [fetchFixedData] = useLazyQuery(
    GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
  );
  const [auctionTotalPages, setAuctionTotalPages] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  useEffect(() => {
    if (!isTopModalOpen) return;
    fetchFixedData({
      variables: {
        filterObj: `{"listingType":"fixed_price","page":${page}, "limit":${limit} }`,
        _id: id,
      },
    }).then(({ data }) => {
      if (data) {
        setFixedData(
          data.getOwnersWhoListedTheSameNftWithPrices?.data
            .filter(
              (item) =>
                contractData.chain == item?.nft_id?.chainId &&
                item?.numberOfCopies > 0,
            )
            .map((item) => ({
              owner: item?.seller?.user_address,
              copies: item?.numberOfCopies,
              price: item?.price,
              fixedid: item?.fixedid | item?.auctionId,
              dbid: item?._id,
              tokenId: item?.tokenId,
              nftId: item?.nft_id?._id,
              chainId: item?.nft_id?.chainId,
              currentBidAmount: item?.auction_highest_bid,
            })),
        );
        setTotalPages(data.getOwnersWhoListedTheSameNftWithPrices?.totalPages);
      }
    });
  }, [page]);
  useEffect(() => {
    if (!isTopModalOpen) return;
    fetchAuctionData({
      variables: {
        filterObj: `{"listingType":"auction","page":${pageAuction}, "limit":${limit} }`,
        _id: id,
      },
    }).then(({ data }) => {
      if (data) {
        setAuctionData(
          data.getOwnersWhoListedTheSameNftWithPrices?.data
            .filter((item) => contractData.chain == item?.nft_id?.chainId)
            .map((item) => ({
              owner: item?.seller?.user_address,
              copies: item?.numberOfCopies,
              price: item?.price,
              fixedid: item?.fixedid | item?.auctionId,
              dbid: item?._id,
              tokenId: item?.tokenId,
              nftId: item?.nft_id?._id,
              chainId: item?.nft_id?.chainId,
              currentBidAmount: item?.auction_highest_bid,
              auctionbids: item?.auction_bids,
            })),
        );
        setAuctionTotalPages(
          data.getOwnersWhoListedTheSameNftWithPrices?.totalPages,
        );
      }
    });
  }, [pageAuction]);
  ETHTOUSD(1).then((result) => {
    setEthBal(result);
  });
  MATICTOUSD(1).then((result) => {
    setMaticBal(result);
  });
  const showModal = () => {
    setIsModalOpen(true);
  };
  const showTopNftsModal = () => {
    setIsTopModalOpen(true);
  };
  const handleBuyBidClick = async () => {
    const [auctionResult, fixedResult] = await Promise.all([
      fetchAuctionData({
        variables: {
          filterObj: `{"listingType":"auction","page":${pageAuction}, "limit":${limit} }`,
          _id: id,
        },
      }),
      fetchFixedData({
        variables: {
          filterObj: `{"listingType":"fixed_price","page":${page}, "limit":${limit} }`,
          _id: id,
        },
      }),
    ]);
    if (auctionResult?.data) {
      setAuctionData(
        auctionResult.data.getOwnersWhoListedTheSameNftWithPrices?.data
          .filter((item) => contractData.chain == item?.nft_id?.chainId)
          .map((item) => ({
            owner: item?.seller?.user_address,
            copies: item?.numberOfCopies,
            price: item?.price,
            fixedid: item?.fixedid | item?.auctionId,
            dbid: item?._id,
            tokenId: item?.tokenId,
            nftId: item?.nft_id?._id,
            chainId: item?.nft_id?.chainId,
            currentBidAmount: item?.auction_highest_bid,
            auctionbids: item?.auction_bids,
          })),
      );
      setAuctionTotalPages(
        auctionResult.data.getOwnersWhoListedTheSameNftWithPrices?.totalPages,
      );
    }
    if (fixedResult?.data) {
      setFixedData(
        fixedResult.data.getOwnersWhoListedTheSameNftWithPrices?.data
          .filter(
            (item) =>
              contractData.chain == item?.nft_id?.chainId &&
              item?.numberOfCopies > 0,
          )
          .map((item) => ({
            owner: item?.seller?.user_address,
            copies: item?.numberOfCopies,
            price: item?.price,
            fixedid: item?.fixedid | item?.auctionId,
            dbid: item?._id,
            tokenId: item?.tokenId,
            nftId: item?.nft_id?._id,
            chainId: item?.nft_id?.chainId,
            currentBidAmount: item?.auction_highest_bid,
          })),
      );
      setTotalPages(
        fixedResult.data.getOwnersWhoListedTheSameNftWithPrices?.totalPages,
      );
    }
    showTopNftsModal();
  };
  const showOfferModal = () => {
    setIsOfferModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsOfferModalOpen(false);
    setIsNftModalOpen(false);
    setIsTopModalOpen(false);
  };
  const handleStripePayment = async () => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    const body = {
      product: {
        name: name,
        cost: Number(duration * 0.1).toFixed(2),
        userId: userData?.id,
        itemId: id,
      },
    };
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await fetch(
      `${env.REACT_APP_BACKEND_BASE_URL}/create-checkout-session`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      },
    );
    const session = await response.json();
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    if (result.error) {
    } else if (result.paymentIntent) {
    }
  };
  const handlePaypalPayment = async () => {
    const body = {
      product: {
        name: name,
        cost: `${(duration || 1) * 0.1}.00`,
        userId: userData?.id,
        itemId: id,
      },
    };
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await fetch(
      `${env.REACT_APP_BACKEND_BASE_URL}/handle-paypal`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      },
    );
    const data = await response.json();
    window.open(data.link);
  };
  const handleDownloadClick = async () => {
    const res = await getSession();
    if (res) {
      const response = await downloadVideo(rid);
      if (response) {
        window.location.href = response.fbx;
        setShowDownload(false);
        setShowPayment(false);
      } else {
        ToastMessage("There is some Error", "", "error");
      }
    }
  };
  const handleDownload = () => {
    setShowDownload(true);
    setShowPayment(true);
  };
  const handleLikeClick = async () => {
    if (isOwner) {
      ToastMessage("Error", "Owner can't like", "success");
    } else if (!userData) {
      ToastMessage("Error", "You need to sign in", "success");
    } else {
      await updateNftLike({
        variables: {
          id: id,
        },
      });
      if (data) {
        ToastMessage("NFT Liked", "", "success");
      }
    }
  };
  const handleWatchClick = async () => {
    await updateNftWatch({
      variables: {
        id: id,
      },
    });
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  useEffect(() => {
    if (searchParams.get("payment") && searchParams.get("itemId") == id) {
      setShowPayment(true);
    }
  }, [searchParams.get("payment")]);
  useEffect(() => {
    const searchParamsVideoLink = searchParams.get("videoLink");
    if (searchParamsVideoLink && searchParamsVideoLink === videoLink) {
      setIsVideoOpen(true);
    }
  }, [searchParams.get("videoLink")]);
  return (
    <div className="my-4 col-lg-3 col-md-6 col-sm-6 col-12 d-flex justify-content-center">
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        centered
        width={829}
        closable={false}
        className="stepperModal"
      >
        <StepperModal
          handleCancel={handleCancel}
          owners={fixedData}
          name={name}
          sellerUsername={sellerUsername}
        />
      </Modal>

      <Modal
        open={isOfferModalOpen}
        onCancel={handleCancel}
        footer={false}
        centered
        width={829}
      >
        <OfferModal
          handleCancel={handleCancel}
          name={name}
          price={
            contractData.chain === 1
              ? (initialPrice * ethBal).toFixed(4)
              : (initialPrice * maticBal).toFixed(4)
          }
          initialPrice={initialPrice}
          currentBidAmount={
            contractData.chain === 1
              ? (currentBidAmount * ethBal).toFixed(4)
              : (currentBidAmount * maticBal).toFixed(4)
          }
          nftOwner={nftOwner}
          auctionid={auctionid}
          itemDbId={itemDbId}
          nftId={id}
          tokenId={tokenId}
        />
      </Modal>

      <Modal
        open={isNftModalOpen}
        onCancel={handleCancel}
        footer={false}
        centered
        width={1000}
      >
        <NftDetailsModal
          handleCancel={handleCancel}
          video={videoLink}
          name={name}
          royalty={marketplacecard ? royalty : fixRoyalty}
          nftOwner={marketplacecard ? nftOwner : fixOwner}
          numberofcopies={marketplacecard ? numberofcopies : fixCopies}
          tokenId={marketplacecard ? tokenId : fixtokenId}
        />
      </Modal>

      <ShowTopNFTPopup
        isOpen={isTopModalOpen}
        onRequestClose={() => handleCancel()}
        fixedData={fixedData}
        auctionData={auctionData}
        name={name}
        page={page}
        setPage={setPage}
        pageAuction={pageAuction}
        auctionTotalPages={auctionTotalPages}
        totalPages={totalPages}
        setPageAuction={setPageAuction}
        marketplacecard={marketplacecard}
      />

      <Card
        hoverable
        className={`cardContainer ${isLight ? "card-light" : ""}`}
        cover={
          <div
            onClick={() => {
              setIsVideoOpen(true);
              const url = new URL(window.location.href);
              url.searchParams.set("videoLink", videoLink);
              window.history.replaceState(null, "", url);
            }}
            style={{
              position: "relative",
              cursor: "pointer",
            }}
          >
            <ReactPlayer
              className="card_video"
              controls={false}
              style={{
                objectFit: "cover",
              }}
              url={videoLink}
              onPlay={handleWatchClick}
            />
          </div>
        }
      >
        {}
        <Space
          direction="horizontal"
          style={{
            width: "100%",
            top: "10px",
            left: "10px",
            position: "absolute",
            background: "transparent",
            zIndex: 5,
          }}
        >
          {}
          <Space
            direction="vertical"
            align="center"
            style={{
              backdropFilter: "blur(6px)",
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.55)"
                : "rgba(0, 0, 0, 0.45)",
              borderRadius: "8px",
              padding: "4px 8px",
              color: isLight ? "#000" : "#fff",
              minWidth: "36px",
              boxShadow: isLight
                ? "0 0 4px rgba(0,0,0,0.1)"
                : "0 0 4px rgba(255,255,255,0.1)",
            }}
          >
            <img
              src={likedIcon}
              alt="Liked"
              width="16"
              height="16"
              style={{
                filter: isLight ? "brightness(0)" : "brightness(0) invert(1)",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginBottom: 0,
              }}
            >
              {likeCount}
            </p>
          </Space>

          {}
          <Space
            direction="vertical"
            align="center"
            style={{
              backdropFilter: "blur(6px)",
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.55)"
                : "rgba(0, 0, 0, 0.45)",
              borderRadius: "8px",
              padding: "4px 8px",
              color: isLight ? "#000" : "#fff",
              minWidth: "36px",
              boxShadow: isLight
                ? "0 0 4px rgba(0,0,0,0.1)"
                : "0 0 4px rgba(255,255,255,0.1)",
            }}
          >
            <img
              src={watchedIcon}
              alt="Watched"
              width="16"
              height="16"
              style={{
                filter: isLight ? "brightness(0)" : "brightness(0) invert(1)",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                marginBottom: 0,
              }}
            >
              {watchCount}
            </p>
          </Space>
        </Space>

        {marketplacecard ? (
          <>
            <div className="price-wrapper d-flex justify-content-between">
              <h5>Price</h5>
              <p>
                <span>$</span>{" "}
                {contractData.chain === 1
                  ? (initialPrice * ethBal).toFixed(4)
                  : (initialPrice * maticBal).toFixed(4)}
              </p>
            </div>
            {!userProfile ? (
              <>
                <Tooltip title="To Purchase NFT's Please Login">
                  <span>
                    <ButtonComponent
                      height={40}
                      text={"Sign in"}
                      onClick={() => {
                        navigate("/login");
                      }}
                    />
                  </span>
                </Tooltip>
              </>
            ) : (
              <button className="buybtn" onClick={handleBuyBidClick}>
                Bid Now
              </button>
            )}
            <button
              className="buybtn nft_details_button"
              onClick={() => {
                navigate(`/nft-detail/${id}`);
              }}
            >
              Nft Detail
            </button>
            {}
            <Link
              to={`/nft-detail/${id}`}
              className={`fw-semibold ${!isLight ? "nft_details_button" : "nft_details_button_dark"}`}
              style={{}}
            >
              Nft Detail
            </Link>
            <div>
              <img
                src={profile}
                style={{
                  width: 15,
                }}
                alt="profile"
              />
              <abbr
                title={name}
                className="light-grey2 mt-2 fs-5 d-inline-block text-truncate"
                style={{
                  maxWidth: "170px",
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {name}
              </abbr>
            </div>
            <div>
              <img
                src={cross}
                style={{
                  width: 15,
                }}
                alt="cross"
              />
              <span
                className="light-grey2 ms-2"
                style={{
                  fontSize: "1rem",
                }}
              >
                No copyright Transfer
              </span>
            </div>
            <div className="my-1">
              <img
                src={check}
                style={{
                  width: 15,
                }}
                alt="check"
              />
              <span
                className="light-grey2 ms-2"
                style={{
                  fontSize: "1rem",
                }}
              >
                First Gen Emote
              </span>
            </div>
            <div className="my-1">
              <img
                src={marketcardimg}
                style={{
                  width: 15,
                }}
                alt="marketing-card"
              />
              <span
                className="light-grey2 ms-2"
                style={{
                  fontSize: "1rem",
                }}
              >
                Supply :{" "}
                <span
                  style={{
                    color: "#AD2B2B",
                  }}
                >
                  {numberofcopies}
                </span>
              </span>
            </div>
            <Timercomp
              auctionStartTime={auctionStartTime}
              auctionEndTime={auctionEndTime}
            />
          </>
        ) : (
          <>
            {topName ? (
              <>
                <div className="d-flex justify-content-between align-items-center pb-2">
                  <div>
                    <div
                      className="d-flex gap-2"
                      style={{
                        alignItems: "center",
                        marginTop: "-1rem",
                      }}
                    >
                      <img
                        src={image}
                        style={{
                          width: 25,
                        }}
                        onError={(e) => {
                          e.target.src = profileimg;
                        }}
                        alt="profile"
                      />
                      {}
                      {}
                      <abbr
                        title={userObj?.full_name}
                        className="light-grey2 mt-2 fs-5 d-inline-block text-truncate"
                        style={{
                          maxWidth: "60px",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        {artistName}
                      </abbr>
                      {}
                    </div>
                  </div>

                  <div>
                    {detailBtn && (
                      <button
                        className="detail-btn"
                        onClick={() => {
                          navigate("/nft-detail/" + id);
                        }}
                      >
                        Nft Detail
                      </button>
                    )}
                    {}
                  </div>
                </div>
                <div>
                  <abbr
                    title={name}
                    className="light-grey2 mt-2 fs-5 d-inline-block text-truncate"
                    style={{
                      maxWidth: "170px",
                      textDecoration: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    {name}
                  </abbr>
                  {}
                </div>
              </>
            ) : (
              <>
                <div className="d-flex align-items-center gap-2 flex-wrap justify-content-between">
                  <div className="d-flex align-items-center">
                    <img
                      src={image}
                      alt="profile"
                      onError={(e) => {
                        e.target.src = profileimg;
                      }}
                      className="rounded-circle"
                      style={{
                        width: 24,
                        height: 24,
                        objectFit: "cover",
                      }}
                    />
                    {}
                    <abbr
                      title={userObj?.full_name}
                      className="light-grey2 fs-6 ms-2 text-truncate d-inline-block"
                      style={{
                        maxWidth: "80px",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      {artistName}
                    </abbr>
                    {}
                  </div>

                  {}

                  {}
                  <Link
                    to={`/nft-detail/${id}`}
                    className={`fw-semibold ${!isLight ? "nft_details_button" : "nft_details_button_dark"}`}
                    style={{}}
                  >
                    Nft Detail
                  </Link>
                </div>

                <abbr
                  title={name}
                  className="light-grey2 mt-2 fs-5 d-inline-block text-truncate"
                  style={{
                    maxWidth: "170px",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {name}
                </abbr>
              </>
            )}
            {sellnft ? (
              <>
                <div>
                  <img
                    src={cross}
                    style={{
                      width: 15,
                    }}
                    alt="cross"
                  />

                  <span
                    className="light-grey2 ms-2"
                    style={{
                      fontSize: "1rem",
                    }}
                  >
                    No copyright Transfer
                  </span>
                </div>
                <div className="my-1">
                  <img
                    src={check}
                    style={{
                      width: 15,
                    }}
                    alt="check"
                  />
                  <span
                    className="light-grey2 ms-2"
                    style={{
                      fontSize: "1rem",
                    }}
                  >
                    First Gen Emote
                  </span>
                </div>{" "}
                <div className="mt-4 mb-1 d-flex">
                  <ButtonComponent
                    height={40}
                    text={"Sell NFT"}
                    onClick={() => {
                      if (
                        location.pathname.includes("/collections") &&
                        isOwner
                      ) {
                        navigateTo();
                      }
                    }}
                  />
                  {userProfile && (
                    <div className="red-gradient ms-3 d-flex justify-content-center thumbView">
                      <img
                        style={{
                          width: 25,
                        }}
                        className="mb-1"
                        src={thumb}
                        alt="thumb"
                        onClick={handleLikeClick}
                      />
                    </div>
                  )}
                </div>
                {collectionBtn && (
                  <Button
                    className="mt-2 collectionBtn"
                    onClick={() => navigate(`/collections/${userId}`)}
                  >
                    Go to Collection
                  </Button>
                )}
              </>
            ) : (
              <>
                <div>
                  <img
                    src={cross}
                    style={{
                      width: 15,
                    }}
                  />

                  <span
                    className="light-grey2 ms-2"
                    style={{
                      fontSize: "0.85rem",
                    }}
                  >
                    No copyright Transfer
                  </span>
                </div>
                <div className="my-1">
                  <img
                    src={check}
                    style={{
                      width: 15,
                    }}
                  />
                  <span
                    className="light-grey2 ms-2"
                    style={{
                      fontSize: "0.85rem",
                    }}
                  >
                    First Gen Emote
                  </span>
                </div>

                <div className="mt-4 mb-1 d-flex">
                  {!userProfile ? (
                    <>
                      <Tooltip title="To Purchase NFT's Please Login">
                        <span>
                          <ButtonComponent
                            height={40}
                            text={"Sign in"}
                            onClick={() => {
                              navigate("/login");
                            }}
                          />
                        </span>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <ButtonComponent
                        height={40}
                        text={
                          location.pathname.includes("/collections") && isOwner
                            ? "Sell NFT"
                            : "Buy NFT"
                        }
                        onClick={() => {
                          const inCollections =
                            location.pathname.includes("/collections");
                          if (inCollections && isOwner) {
                            navigateTo();
                          } else if (inCollections && !isOwner) {
                            ToastMessage("Please contact owner", "", "error");
                          } else {
                            handleBuyBidClick();
                          }
                        }}
                      />
                    </>
                  )}
                  {userProfile && (
                    <div className="red-gradient ms-3 d-flex justify-content-center thumbView">
                      <img
                        style={{
                          width: 25,
                        }}
                        className="mb-1"
                        src={thumb}
                        onClick={handleLikeClick}
                      />
                    </div>
                  )}
                </div>

                <Button
                  className="mt-2 collectionBtn"
                  onClick={() => navigate(`/collections/${userId}`)}
                >
                  Go to Collection
                </Button>
                {isOwner && isEmote ? (
                  <button
                    type="button"
                    className="mt-2 collectionBtn"
                    onClick={() => handleDownload()}
                  >
                    Download File
                  </button>
                ) : (
                  ""
                )}
              </>
            )}
          </>
        )}
      </Card>
      {isPaid || false ? (
        <PaymentConfirmation
          setShow={setShowPayment}
          show={showpayment}
          paymentConfirm={true}
          handleDownloadClick={handleDownloadClick}
        />
      ) : (
        <DownloadModal
          setShow={setShowDownload}
          show={showDownload}
          duration={duration}
          handelStripe={handleStripePayment}
          handlePaypal={handlePaypalPayment}
        />
      )}

      <Modal
        open={isVideoOpen}
        footer={false}
        centered
        onCancel={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("videoLink");
          window.history.replaceState(null, "", url);
          setIsVideoOpen(false);
        }}
        width="auto"
        style={{
          maxWidth: "90vw",
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        {}
        <div
          style={{
            position: "relative",
            width: "90vw",
            maxWidth: 1000,
            aspectRatio: "16 / 9",
          }}
        >
          <ReactPlayer
            url={videoLink}
            className="card_video2"
            controls
            playing
            objec
            width="100%"
            height="100%"
            style={{
              objectFit: "cover",
            }}
            onStart={handleWatchClick}
          />
        </div>
      </Modal>

      {}
    </div>
  );
};
export default CardCompnent;
