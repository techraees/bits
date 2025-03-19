import React, { useEffect, useState } from "react";
import "./css/index.css";
import { Button, Row, Col } from "antd";
import {
  discord_grey,
  left_arrow_red,
  meta,
  telegram_grey,
  twitter_grey,
} from "../../../assets";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  GET_ALL_NFTS_WITHOUT_ADDRESS,
  GET_ALL_TOP_NFTS_FRO_ONE_CHAIN_FOR_WEBSITE,
} from "../../../gql/queries";
import { WeiToETH } from "../../../utills/convertWeiAndBnb";
import { CardCompnent, Loader, UploadVideoModal } from "../../../components";

const Dashboard = () => {
  const [uploadVideoModal, setUploadVideoModal] = useState(false);
  const [topNfts, setTopNfts] = useState([]);
  let navigate = useNavigate();

  const [showChat, setShowChat] = useState(false);
  const { userData } = useSelector((state) => state.address.userData);
  const { fixedItemData } = useSelector(
    (state) => state.fixedItemDatas.fixedItemData
  );
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { auctionItemData } = useSelector(
    (state) => state.auctionItemDatas.auctionItemData
  );

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const isLogged = userData?.isLogged;
  const userProfile = userData?.full_name;

  const handleCreateNFT = () => {
    if (isLogged) {
      setUploadVideoModal(true);
    } else {
      navigate("/login");
    }
  };

  // getOwnersOfTokenId(0, 80001, contractData.mintContract.address);

  const { loading, data } = useQuery(GET_ALL_NFTS_WITHOUT_ADDRESS);
  const timenow = Math.floor(Date.now() / 1000);

  const {
    data: getAllTopNftsForOneChainForWebsite,
    isLoading: getAllTopNftsForOneChainForWebsiteLoading,
    isFetching: getAllTopNftsForOneChainForWebsiteFetching,
  } = useQuery(GET_ALL_TOP_NFTS_FRO_ONE_CHAIN_FOR_WEBSITE, {
    variables: {
      chainId: contractData.chain.toString(),
    },
  });

  console.log(
    "the top nfts",
    getAllTopNftsForOneChainForWebsite?.getAllTopNftsForOneChainForWebsite
  );

  useEffect(() => {
    if (getAllTopNftsForOneChainForWebsite) {
      setTopNfts(
        getAllTopNftsForOneChainForWebsite?.getAllTopNftsForOneChainForWebsite
      );
    }
  }, [getAllTopNftsForOneChainForWebsite]);

  // function getUniqueObjects(arr) {
  //   const uniqueObjects = [];
  //   const seenIds = new Set();

  //   for (const item of arr) {
  //     if (!seenIds.has(item._id)) {
  //       uniqueObjects.push(item);
  //       seenIds.add(item?._id);
  //     }
  //   }

  //   return uniqueObjects;
  // }

  // const topNfts = useMemo(() => {
  //   let arr = [];
  //   data?.getAllNftsWithoutAddress?.map((x) => {
  //     auctionItemData?.map((y) => {
  //       if (
  //         !x.is_blocked &&
  //         Number(y.tokenId) == x.token_id &&
  //         contractData.chain == x.chainId &&
  //         Number(y.auctionEndTime) > timenow &&
  //         y.isSold == false
  //       ) {
  //         arr.push({
  //           ...x,
  //           initialPrice: WeiToETH(`${Number(y.initialPrice)}`),
  //           auctionid: Number(y.auctionid),
  //           currentBidAmount: WeiToETH(`${Number(y.currentBidAmount)}`),
  //         });
  //       }
  //     });
  //   });

  //   data?.getAllNftsWithoutAddress?.map((x) => {
  //     fixedItemData?.map((y) => {
  //       if (
  //         !y.is_blocked &&
  //         Number(y.tokenid) == Number(x.token_id) &&
  //         contractData.chain == x.chainId &&
  //         y.isSold == false
  //       ) {
  //         arr.push({
  //           ...x,
  //           owners: y.owners,
  //           fixtokenId: y.tokenid,
  //           isFixedItem: true,
  //         });
  //       }
  //     });
  //   });

  //   const filterItem = arr?.filter((item) =>
  //     topnfts?.GetTopNfts?.some(
  //       (otherItem) =>
  //         otherItem.nft_id !== null &&
  //         item._id === otherItem.nft_id._id &&
  //         otherItem.is_Published
  //     )
  //   );

  //   // console.log("checking_arr", arr);
  //   // const uniqueObjects = getUniqueObjects(arr);
  //   return filterItem;
  // }, [auctionItemData, data, fixedItemData, topnfts]);

  // const topNfts1 = useMemo(() => {
  //   const filterItem = data?.getAllNftsWithoutAddress?.filter((item) =>
  //     topnfts?.GetTopNfts?.some(
  //       (otherItem) => item._id === otherItem.nft_id && otherItem.is_Published
  //     )
  //   );
  //   console.log("filtered item", filterItem);
  //   return filterItem;
  // }, [data?.getAllNftsWithoutAddress, topnfts]);

  // useEffect(() => {
  //   toprefetch();
  // }, []);

  return (
    <div className={backgroundTheme}>
      {loading && <Loader />}
      <UploadVideoModal
        visible={uploadVideoModal}
        onClose={() => setUploadVideoModal(false)}
      />
      <div className="container">
        <Row
          className="my-5 d-flex align-items-center"
          gutter={{ xs: 8, sm: 16, md: 20, lg: 32 }}
        >
          <Col lg={12} md={12} sm={24} xs={24} className="my-2">
            <div>
              <h1 className={textColor}>
                Welcome to <span className="red">BITS</span>{" "}
              </h1>
              <span className={textColor}>
                At BITS we will take your most iconic performances and
                immortalize them on the blockchain. First, you can provide us
                with a signature move/moment that you're proud of, then we will
                turn it into a potential in-game emote so that your fans can use
                it to express themselves. We'll mint it as an NFT so you can
                sell it or give it to your most valued supporters.
              </span>
              <div className="mt-3 ">
                <Link to="video-gallery">
                  <Button
                    className="red dashboardBtns px-5"
                    style={{
                      backgroundColor: "transparent",
                    }}
                  >
                    Explore
                  </Button>
                </Link>
                <Button
                  className="red-background white dashboardBtns px-5 ms-2"
                  onClick={() => handleCreateNFT()}
                >
                  Create NFT
                </Button>
              </div>
            </div>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24} className="my-2">
            <ReactPlayer
              width="100%"
              height="300px"
              url="https://www.youtube.com/watch?v=sXQH-R_0gtQ"
            />
          </Col>
        </Row>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <h3 className="red m-0">
            Top <span className={textColor}>NFTs</span>
          </h3>
          <div
            style={{ border: "1px solid #D54343", width: "80%" }}
            className="breakline"
          ></div>
          <img src={left_arrow_red} alt="lef-arrow" />
        </div>
        <div>
          <div className="row">
            {/* {auctionItemData?.map((item) => {
            return data?.getTopViewNfts?.map((e, i) => {
              if (
                !e.is_blocked &&
                Number(item.tokenId) == e.token_id &&
                contractData.chain == e.chainId &&
                Number(item.auctionEndTime) > timenow &&
                item.isSold == false
              ) {
                return (
                  <CardCompnent
                  key={i}
                  image={e?.user_id?.profileImg ? e.user_id.profileImg : ""}
                  status={e.status}
                  name={e.name}
                  videoLink={e.video}
                  userProfile={userProfile ? true : false}
                  id={e._id}
                  userId={e?.user_id?.id}
                  />
                );
              }
            });
          })} */}

            {topNfts?.map((e, i) => (
              <CardCompnent
                key={i}
                image={e?.user_id?.profileImg ? e.user_id.profileImg : ""}
                status={e?.nft_id?.status}
                name={e?.nft_id?.name}
                videoLink={e?.nft_id?.video}
                userProfile={userProfile ? true : false}
                id={e?.nft_id?._id}
                userId={e?.nft_id?.user_id}
                fixtokenId={e.fixtokenId}
                fixOwner={e?.nft_id?.wallet_address}
                fixRoyalty={e?.nft_id?.royalty}
                fixCopies={e?.nft_id?.supply}
                numberofcopies={e.supply}
                initialPrice={e.initialPrice}
                auctionid={e.auctionid}
                currentBidAmount={e.currentBidAmount}
                nftOwner={e?.nft_id?.wallet_address}
                isAuction={e?.nft_id?.isFixedItem ? false : true}
                likeCount={e?.nft_id?.likeCount}
                watchCount={e?.nft_id?.watchCount}
                isPaid={e?.nft_id?.isPaid}
                duration={e?.nft_id?.video_duration}
              />
            ))}

            {/* {fixedItemData?.map((item) => {
            return data?.getTopViewNfts?.map((e, i) => {
              if (
                !e.is_blocked &&
                item.tokenid == e.token_id &&
                contractData.chain == e.chainId &&
                
                item.isSold == false
              ) {
                return (
                  <CardCompnent
                  key={i}
                  image={e?.user_id?.profileImg ? e.user_id.profileImg : ""}
                  status={e.status}
                  name={e.name}
                  videoLink={e.video}
                  userProfile={userProfile ? true : false}
                  id={e._id}
                  userId={e?.user_id?.id}
                  />
                );
              }
            });
          })} */}
            {/* {data?.getTopViewNfts?.map((e, i) => {
              return (
                <CardCompnent
                  key={i}
                  image={e?.user_id?.profileImg ? e.user_id.profileImg : ""}
                  status={e.status}
                  name={e.name}
                  videoLink={e.video}
                  userProfile={userProfile ? true : false}
                  id={e._id}
                  userId={e?.user_id?.id}
                />
              );
            })} */}
          </div>
        </div>
      </div>
      <div className="dark-grey-bg d-flex justify-content-center">
        <div className="py-2" style={{ border: "1px" }}>
          <img src={discord_grey} className="mx-2" alt="discord" />
          <img src={telegram_grey} className="mx-2" alt="telegram" />
          <img src={twitter_grey} className="mx-2" alt="twitter" />
        </div>
      </div>
      <div className="red-background">
        <div className="container d-flex justify-content-between py-2 align-items-center">
          <p className="m-0 white">
            BITS NFT {new Date().getFullYear()} All Rights reserved{" "}
          </p>
          <img
            src={meta}
            className="mx-2"
            onClick={() => {
              setShowChat(!showChat);
            }}
            alt="meta"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
