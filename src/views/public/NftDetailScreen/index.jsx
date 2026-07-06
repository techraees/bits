import { useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Row, Col, Popover, Avatar } from "antd";
import { FaCheckCircle } from "react-icons/fa";
import "./css/index.css";
import ReactPlayer from "react-player";
import {
  DETAILS_OF_A_NFT,
  GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
} from "../../../gql/queries";
import { trimWallet } from "../../../utills/trimWalletAddr";
import ShowTopNFTPopup from "../../../ShowTopNFTPopup";

const NftDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailsOfANft, { data }] = useLazyQuery(DETAILS_OF_A_NFT);
  // const [count, setCount] = useState(false);

  // const { userData } = useSelector((state) => state.address.userData);

  useEffect(() => {
    if (id !== undefined && id !== null) {
      try {
        detailsOfANft({
          variables: {
            id: id,
          },
        });
      } catch (error) {
        // console.log("The err", error);
      }
    }
  }, [id, detailsOfANft]);

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);

  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  // console.log(bgColor, "SDFSDFSDFSFS");
  const { contractData } = useSelector((state) => state.chain.contractData);

  const [isTopModalOpen, setIsTopModalOpen] = useState(false);
  const [fixedData, setFixedData] = useState([]);
  const [auctionData, setAuctionData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageAuction, setPageAuction] = useState(1);
  const limit = 1;
  const [auctionTotalPages, setAuctionTotalPages] = useState(null);
  const [totalPages, setTotalPages] = useState(null);

  const [fetchAuctionData] = useLazyQuery(
    GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
  );
  const [fetchFixedData] = useLazyQuery(
    GET_OWNERS_WHO_LISTED_THE_SAME_NFT_WITH_PRICE,
  );

  // Re-fetch fixed page when pagination changes while modal is open
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
                contractData?.chain === item?.nft_id?.chainId &&
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
  }, [page, isTopModalOpen, fetchFixedData, id, limit, contractData?.chain]);

  // Re-fetch auction page when pagination changes while modal is open
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
            .filter((item) => contractData?.chain === item?.nft_id?.chainId)
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
  }, [
    pageAuction,
    isTopModalOpen,
    fetchAuctionData,
    id,
    limit,
    contractData?.chain,
  ]);

  // const link = `https://${
  // 	contractData.chain == 1 ? "etherscan.io" : "polygonscan.com"
  // }/token/${contractData.mintContract.address}?a=${
  // 	data?.DetailsOfANft?.token_id
  // }`;

  // console.log(data?.DetailsOfANft, "SDFSDFSDFSFS");
  return (
    <div
      className={`${backgroundTheme} pb-2`}
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      <ShowTopNFTPopup
        isOpen={isTopModalOpen}
        onRequestClose={() => setIsTopModalOpen(false)}
        fixedData={fixedData}
        auctionData={auctionData}
        name={data?.DetailsOfANft?.name}
        page={page}
        setPage={setPage}
        pageAuction={pageAuction}
        auctionTotalPages={auctionTotalPages}
        totalPages={totalPages}
        setPageAuction={setPageAuction}
        marketplacecard={true}
      />
      <div className="container py-1">
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            {/* <img src={right_arrow} /> */}
            <span className={`${textColor2} fs-5 py-3 ms-2`}>NFT Details</span>
          </div>
        </div>
        <Row
          style={{ width: "100%" }}
          className={`d-flex searchStyle ${bgColor} my-4 p-5`}
        >
          <Col lg={14} sm={24} xs={24} className="borderBottom">
            <Row gutter={{ xs: 8, sm: 16, md: 30, lg: 50 }}>
              <Col lg={12} sm={24} md={12} xs={24}>
                <div
                  className="cardContainer mintCardContainer"
                  style={{ width: "100%" }}
                >
                  <ReactPlayer
                    controls={true}
                    width="100%"
                    height={220}
                    url={data?.DetailsOfANft?.video}
                  />
                </div>
                {/* <div className="mt-4 mb-2 d-flex justify-content-center w-100">
                  {!userData || !userData.address ? (
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
                  ) : (
                    <ButtonComponent
                      height={40}
                      text={isOwner ? "Sell NFT" : "Buy NFT"}
                      onClick={() => {
                        if (isOwner) {
                          navigate(`/list-nft/${id}`, {
                            state: {
                              name: data?.DetailsOfANft?.name,
                              royalty: data?.DetailsOfANft?.royalty,
                              artistName: data?.DetailsOfANft?.artist_name1,
                              tokenId: data?.DetailsOfANft?.token_id,
                              videoLink: data?.DetailsOfANft?.video,
                              nftId: id,
                            },
                          });
                        } else {
                          handleBuyBidClick();
                        }
                      }}
                    />
                  )}
                </div> */}
                <a
                  href={`https://${
                    contractData.chain === 1 ? "etherscan.io" : "polygonscan.com"
                  }/token/${contractData.mintContract.address}?a=${
                    data?.DetailsOfANft?.token_id
                  }`}
                  target="_blank"
                  className={`${textColor2}`}
                  rel="noreferrer"
                >
                  <div
                    style={{ border: "1px solid  #B23232" }}
                    className="p-1 mt-1 text-center rounded-3"
                  >
                    View on{" "}
                    {contractData.chain === 1 ? "Etherscan" : "Polygonscan"}
                    {/* <span className={`${textColor2}`} href="google.com" >View on Etherscan</span> */}
                  </div>
                </a>
              </Col>
              <Col lg={12} sm={24} md={12} xs={24}>
                <div>
                  <div className="my-3">
                    <p className={`${textColor} mb-1 fs-5`}>
                      {data?.DetailsOfANft?.name}
                    </p>

                    <p className={`${textColor2} m-0 fs-6`}>
                      {data?.DetailsOfANft?.wallet_address &&
                        trimWallet(data?.DetailsOfANft?.wallet_address)}
                    </p>
                    {/* <p className="red fs-6">
                  SB
                </p> */}
                  </div>
                  <div className="my-3">
                    <p className={`${textColor} m-0 fs-5`}>NFT ID</p>
                    <p className={`${textColor2} m-0 fs-6`}>
                      #{data?.DetailsOfANft?.token_id}
                    </p>
                  </div>
                  <div className="my-3">
                    <p className={`${textColor} m-0 fs-5`}>Artist Name</p>
                    <Popover
                      content={
                        <div style={{ width: "240px", position: "relative" }}>
                          <div className="artist-card-header" />
                          <div className="avatar-wrapper">
                            <Avatar
                              size={90}
                              src={
                                data?.DetailsOfANft?.user_id?.profileImg
                                  ? `${process.env.REACT_APP_BACKEND_BASE_URL}/${data?.DetailsOfANft?.user?.profileImg}`
                                  : null
                              }
                              style={{
                                backgroundColor: "#B23232",
                                border: `5px solid ${bgColor === "dark-grey-bg" ? "#1a1a1a" : "#ffffff"}`,
                                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                              }}
                            >
                              {data?.DetailsOfANft?.user_id?.user_name?.charAt(
                                0,
                              )}
                            </Avatar>
                          </div>

                          <div className="artist-details-body">
                            <div className="verified-tag">
                              <FaCheckCircle
                                size={10}
                                style={{ marginRight: "4px" }}
                              />
                              VERIFIED CREATOR
                            </div>

                            <h6
                              className="m-0 fw-bold"
                              style={{
                                fontSize: "18px",
                                letterSpacing: "0.2px",
                                color:
                                  bgColor === "dark-grey-bg"
                                    ? "white"
                                    : "black", // Absolute contrast
                              }}
                            >
                              {data?.DetailsOfANft?.user_id?.user_name ||
                                data?.DetailsOfANft?.artist_name1 ||
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
                                background:
                                  bgColor === "dark-grey-bg"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(178, 50, 50, 0.05)",
                                padding: "4px 0",
                                color:
                                  bgColor === "dark-grey-bg"
                                    ? "#b0b0b0"
                                    : "#666666", // Absolute contrast
                              }}
                            >
                              {data?.DetailsOfANft?.user_id?.user_address &&
                                trimWallet(
                                  data?.DetailsOfANft?.user_id?.user_address,
                                )}
                            </p>

                            {data?.DetailsOfANft?.user_id?.bio && (
                              <div
                                className="artist-bio-box"
                                style={{ width: "100%" }}
                              >
                                <p
                                  className="m-0"
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "1.5",
                                    fontStyle: "italic",
                                    textAlign: "left",
                                    opacity: 0.9,
                                    color:
                                      bgColor === "dark-grey-bg"
                                        ? "#e0e0e0"
                                        : "#444444", // Absolute contrast
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  "{data?.DetailsOfANft?.user_id?.bio}"
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
                              onClick={() =>
                                navigate(
                                  `/collections/${data?.DetailsOfANft?.user_id?.id}`,
                                )
                              }
                            >
                              VIEW FULL PROFILE
                            </button>
                          </div>
                        </div>
                      }
                      title={null}
                      trigger="hover"
                      placement="right"
                      color={bgColor === "dark-grey-bg" ? "#1a1a1a" : "#ffffff"} // ABSOLUTE THEME FORCE
                      overlayClassName={`artist-popover ${bgColor === "dark-grey-bg" ? "dark-grey-bg-popover" : "bg-white-popover"}`}
                    >
                      <p
                        className={`${textColor2} m-0 fs-6 cursor-pointer`}
                        style={{
                          borderBottom: "1px dotted #B23232",
                          display: "inline-block",
                          fontWeight: "600",
                        }}
                      >
                        {data?.DetailsOfANft?.artist_name1}
                      </p>
                    </Popover>
                  </div>
                  <div className="my-3">
                    <div className="d-flex label-input">
                      <p className={`${textColor} m-0 fs-5`}>
                        Royalty % : {data?.DetailsOfANft?.royalty / 100}{" "}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ borderRight: "1px solid #B23232" }} />
              </Col>
            </Row>
          </Col>
          <Col lg={10} sm={24} xs={24}>
            <div className="supplyView">
              <div className="my-3">
                <p className={`${textColor} mb-1 fs-6`}>Circulating Supply</p>
                <p className={`${textColor2} m-0 fs-6`}>
                  {data?.DetailsOfANft?.availableSupply}
                </p>
              </div>
              <div className="my-3">
                <p className={`${textColor} mb-1 fs-6`}>
                  Maximum Total Supply Supply
                </p>
                <p className={`${textColor2} m-0 fs-6`}>
                  {" "}
                  {data?.DetailsOfANft?.supply}{" "}
                </p>
              </div>
              <div className="my-3">
                <p className={`${textColor} mb-1 fs-6`}>Supply Type</p>
                <p className={`${textColor2} m-0 fs-7`}>Non Fungible Token</p>
              </div>
            </div>
          </Col>
          {/* <Col span={24} className="mt-4 pt-3">
            <div
              className="p-4 rounded-3 w-100"
              style={{
                border: "1px solid rgba(178, 50, 50, 0.2)",
                borderLeft: "4px solid #B23232",
                backgroundColor: "rgba(178, 50, 50, 0.03)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <p
                className={`${textColor} mb-2 fs-5 fw-bold`}
                style={{ letterSpacing: "0.5px" }}
              >
                Description
              </p>
              <div
                className={`${textColor2} m-0`}
                style={{
                  fontSize: "15px",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                  opacity: "0.9",
                }}
              >
                {data?.DetailsOfANft?.description || "No description provided."}
              </div>
            </div>
          </Col> */}
        </Row>
      </div>
    </div>
  );
};

export default NftDetailsScreen;
