import "./css/index.css";
import { Card, Tooltip } from "antd";
import {
  check,
  cross,
  marketcardimg,
  profile,
  thumb,
  watchedIcon,
  likedIcon,
} from "../../assets";

import { useMutation } from "@apollo/client";
import { useQuery } from "@apollo/client";
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
import { useLocation, useNavigate } from "react-router-dom";
import profileimg from "../../assets/images/profile1.png";
import { ETHTOUSD, MATICTOUSD } from "../../utills/currencyConverter";
import { useSelector } from "react-redux";
import { ToastMessage } from "../../components";
import { getSession } from "../../config/deepmotion";
import { downloadVideo } from "../../config/deepmotion";
import { loadStripe } from "@stripe/stripe-js";
import DownloadModal from "../Modal/DownloadModal";
import PaymentConfirmation from "../Modal/PaymentConfirmation";

const env = process.env;

const CardCompnent = ({
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
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isNftModalOpen, setIsNftModalOpen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showpayment, setShowPayment] = useState(false);
  const [owners, setOwners] = useState([]);
  // const [paymentStat, setPaymentStat] = useState(false);
  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);
  const { contractData } = useSelector((state) => state.chain.contractData);

  const [updateNftLike, { data }] = useMutation(UPDATE_NFT_LIKE);

  const { userData } = useSelector((state) => state.address.userData);

  const [updateNftWatch] = useMutation(UPDATE_NFT_WATCH);
  // const [updateNftPayment] = useMutation(UPDATE_NFT_PAYMENT);

  console.log("Item Id", itemDbId);

  const {
    data: getOwnersWhoListedTheSameNftWithPrices,
    isLoading: getOwnersWhoListedTheSameNftWithPricesLoading,
    isFetching: getOwnersWhoListedTheSameNftWithPricesFetching,
  } = useQuery(GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE, {
    variables: {
      // filterObj: '{"listingType":"auction"}',
      _id: id,
    },
  });

  console.log(
    "owner data",
    getOwnersWhoListedTheSameNftWithPrices
      ?.getOwnersWhoListedTheSameNftWithPrices?.data
  );

  useEffect(() => {
    if (getOwnersWhoListedTheSameNftWithPrices) {
      const newData =
        getOwnersWhoListedTheSameNftWithPrices?.getOwnersWhoListedTheSameNftWithPrices?.data.map(
          (item) => ({
            owner: item?.seller?.user_address,
            copies: item?.numberOfCopies,
            price: item?.price,
            fixedid: item?.fixedid,
            dbid: item?._id,
            tokenId: item?.tokenId,
            nftId: item?.nft_id?._id,
          })
        );
      setOwners(newData);
    }
  }, [getOwnersWhoListedTheSameNftWithPrices]);

  ETHTOUSD(1).then((result) => {
    setEthBal(result);
  });

  MATICTOUSD(1).then((result) => {
    setMaticBal(result);
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  // const showNftModal = () => {
  // 	setIsNftModalOpen(true);
  // };

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
  };

  // stripe payment
  const handleStripePayment = async () => {
    const stripe = await loadStripe(
      "pk_test_51ONY76DTnIk5XZdbssy5CY3IEHcocHc20X9xWh6rvoKGzjHVw3lBM7barlliBtOKgzQEU7XB61IWHsY0eLJBp18Q00e2dbR0gQ"
    );

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
      }
    );

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log(result.error);
    } else if (result.paymentIntent) {
      // Handle successful payment here (e.g., update UI or make further API calls).
      console.log("Payment succeeded:");
    }
  };

  //handle paypal
  const handlePaypalPayment = async () => {
    const body = {
      product: {
        name: name,
        cost: `${duration * 0.1}.00`,
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
      }
    );

    const data = await response.json();
    window.open(data.link);
  };

  //handle download
  const handleDownloadClick = async () => {
    const res = await getSession();
    if (res) {
      const response = await downloadVideo(rid);
      if (response) {
        window.location.href = response.fbx;
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

  // console.log("userProfile", userProfile, image);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // console.log("userId", userId, location.pathname);

  // console.log(fixOwner, fixRoyalty, fixCopies);

  useEffect(() => {
    if (searchParams.get("payment") && searchParams.get("itemId") == id) {
      setShowPayment(true);
      // handleDownload();
    }
  }, [searchParams.get("payment")]);

  return (
    <div className="my-4 col-lg-3 col-md-4 col-sm-6 col-12 d-flex justify-content-center">
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
          owners={owners}
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

      <Card
        hoverable
        className="cardContainer"
        cover={
          <ReactPlayer
            controls={true}
            width="260px"
            height="190px"
            url={videoLink}
            onPlay={handleWatchClick}
          />
        }
      >
        <Space
          direction="horizontal"
          style={{
            width: "100%",
            top: "10px",
            left: "10px",
            position: "absolute",
          }}
        >
          <Space direction="vertical">
            <img src={likedIcon} alt="Liked" style={{ color: "#756E6E" }} />
            <p style={{ fontSize: "0.75rem" }}>{likeCount}</p>
          </Space>
          <Space direction="vertical">
            <img src={watchedIcon} alt="Watched" style={{ color: "#756E6E" }} />
            <p style={{ fontSize: "0.75rem" }}>{watchCount}</p>
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
              <button className="buybtn" onClick={showOfferModal}>
                {location.pathname === "/marketplace" ? "Bid Now" : "Buy Now"}
              </button>
            )}
            <button
              className="buybtn"
              onClick={() => {
                navigate(`/nft-detail/${id}`);
              }}
            >
              Nft Detail
            </button>
            <div>
              <img src={profile} style={{ width: 15 }} alt="profile" />
              <span className="light-grey2 ms-2" style={{ fontSize: "1rem" }}>
                {name}
              </span>
            </div>
            <div>
              <img src={cross} style={{ width: 15 }} alt="cross" />
              <span className="light-grey2 ms-2" style={{ fontSize: "1rem" }}>
                No copyright Transfer
              </span>
            </div>
            <div className="my-1">
              <img src={check} style={{ width: 15 }} alt="check" />
              <span className="light-grey2 ms-2" style={{ fontSize: "1rem" }}>
                First Gen Emote
              </span>
            </div>
            <div className="my-1">
              <img
                src={marketcardimg}
                style={{ width: 15 }}
                alt="marketing-card"
              />
              <span className="light-grey2 ms-2" style={{ fontSize: "1rem" }}>
                Supply :{" "}
                <span style={{ color: "#AD2B2B" }}>{numberofcopies}</span>
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
                        style={{ width: 25 }}
                        onError={(e) => {
                          e.target.src = profileimg;
                        }}
                        alt="profile"
                      />
                      <span className="light-grey2 mt-2 fs-5">
                        {artistName}
                      </span>
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
                  </div>
                </div>
                <div>
                  <span className="light-grey2  fs-5">{name}</span>
                  {/* <div style={{ border: "1px solid #5e2a2a" }}></div> */}
                </div>
              </>
            ) : (
              <>
                <div className="d-flex">
                  <div className="top-btn-div">
                    <img
                      src={image}
                      alt="profile"
                      onError={(e) => {
                        e.target.src = profileimg;
                      }}
                    />

                    <button
                      className="buybtn"
                      style={{ width: "80px" }}
                      onClick={() => {
                        navigate(`/nft-detail/${id}`);
                      }}
                    >
                      Nft Detail
                    </button>
                  </div>
                  <span
                    className="ms-2 light-grey2"
                    style={{ fontSize: "0.80rem" }}
                  >
                    {status}
                  </span>
                </div>
                <h5 className="light-grey2 mt-2">{name}</h5>
              </>
            )}
            {sellnft ? (
              <>
                <div>
                  <img src={cross} style={{ width: 15 }} alt="cross" />

                  <span
                    className="light-grey2 ms-2"
                    style={{ fontSize: "1rem" }}
                  >
                    No copyright Transfer
                  </span>
                </div>
                <div className="my-1">
                  <img src={check} style={{ width: 15 }} alt="check" />
                  <span
                    className="light-grey2 ms-2"
                    style={{ fontSize: "1rem" }}
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
                  <div className="red-gradient ms-3 d-flex justify-content-center thumbView">
                    <img
                      style={{ width: 25 }}
                      className="mb-1"
                      src={thumb}
                      alt="thumb"
                      onClick={handleLikeClick}
                    />
                  </div>
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
                  <img src={cross} style={{ width: 15 }} />

                  <span
                    className="light-grey2 ms-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    No copyright Transfer
                  </span>
                </div>
                <div className="my-1">
                  <img src={check} style={{ width: 15 }} />
                  <span
                    className="light-grey2 ms-2"
                    style={{ fontSize: "0.85rem" }}
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
                          if (
                            location.pathname.includes("/collections") &&
                            isOwner
                          ) {
                            navigateTo();
                          } else if (
                            location.pathname.includes("/collections") &&
                            !isOwner
                          ) {
                            ToastMessage("Please contact owner", "", "error");
                          } else if (
                            location.pathname.includes("/video-gallery")
                          ) {
                            console.log("handle ok");
                            showModal();
                          } else if (
                            location.pathname.includes("/") &&
                            isAuction
                          ) {
                            showOfferModal();
                            // ToastMessage("Please contact owner", "", "error");
                          } else if (
                            location.pathname.includes("/") &&
                            !isAuction
                          ) {
                            showModal();
                          }
                        }}
                      />
                    </>
                  )}

                  <div className="red-gradient ms-3 d-flex justify-content-center thumbView">
                    <img
                      style={{ width: 25 }}
                      className="mb-1"
                      src={thumb}
                      onClick={handleLikeClick}
                    />
                  </div>
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
      {isPaid ? (
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

      {/* <PaymentConfirmation setShow={setShowPayment} show={showpayment} /> */}
    </div>
  );
};

export default CardCompnent;
