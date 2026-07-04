import { useQuery } from "@apollo/client";
import { Input, Pagination, Select } from "antd";
import { useState } from "react";
import { BsFilterLeft } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AZ, grid, profile2, search } from "../../../assets";
import { CardCompnent } from "../../../components";
import { ALLOWED_MARKET_PLACE_NFT_TYPE } from "../../../data/enums";
import { GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER } from "../../../gql/queries";
import { USDTOMATIC } from "../../../utills/currencyConverter";
import "./css/index.css";
import CardSkeletal from "./Skeletal/CardSkeletal";

const environment = process.env;

// Fixed-price and auction listings previously lived on two separate pages
// (Marketplace and Emote-Video Gallery) that called the same backend query
// with a different `listingType`. They are consolidated here into tabs so
// there is a single, unambiguous "Marketplace" entry point in navigation.
const PAGE_SIZE_BY_TYPE = {
  [ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE]: 12,
  [ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION]: 4,
};

const buildFilterObj = (listingType, page) => ({
  listingType,
  page,
  limit: PAGE_SIZE_BY_TYPE[listingType],
  available: true,
});

const Marketplace = () => {
  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  const textColor = useSelector((state) => state.app.theme.textColor);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const userProfile = userData?.full_name;

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION
      ? ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION
      : ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterObj, setFilterObj] = useState(
    JSON.stringify(buildFilterObj(initialTab, 1)),
  );

  const {
    data: getAllNftsInMarketPlaceAndSupportFilter,
    loading: getAllNftsInMarketPlaceAndSupportFilterLoading,
  } = useQuery(GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER, {
    variables: {
      filterObj: filterObj,
      chainId: contractData.chain.toString(),
    },
    // Default cache-first served a stale list when navigating here right
    // after listing an NFT. cache-and-network shows the cached list
    // immediately, then updates it with a fresh network response.
    fetchPolicy: "cache-and-network",
  });

  const isAuctionTab = activeTab === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION;
  const pageSize = PAGE_SIZE_BY_TYPE[activeTab];

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1);
    setFilterObj(JSON.stringify(buildFilterObj(tab, 1)));
    setSearchParams({ tab });
  };

  const handleCategoryChange = (value) => {
    let filterObjCopy = JSON.parse(filterObj);
    filterObjCopy.category = value;
    setFilterObj(JSON.stringify(filterObjCopy));
  };

  const handlePriceChange = async (value) => {
    const data = value.split("-").map(Number);

    // Use Promise.all to wait for all promises to be resolved
    const convertedPrice = await Promise.all(
      data.map(async (val) => {
        return await USDTOMATIC(val);
      }),
    );

    let filterObjCopy = JSON.parse(filterObj);
    filterObjCopy.price =
      convertedPrice?.length === 1 ? [0, convertedPrice[0]] : convertedPrice;
    setFilterObj(JSON.stringify(filterObjCopy));
  };

  const handleQuantityChange = (value) => {
    const data = value.split("-").map(Number);
    let filterObjCopy = JSON.parse(filterObj);
    filterObjCopy.quantity = data;
    setFilterObj(JSON.stringify(filterObjCopy));
  };

  const handleRankingChange = (value) => {
    // console.log("selected value", value);
  };

  const handlePageChange = (page) => {
    let filterObjCopy = JSON.parse(filterObj);
    filterObjCopy.page = page;
    setFilterObj(JSON.stringify(filterObjCopy));
    setCurrentPage(page);
  };

  const itemRender = (current, type, originalElement) => {
    if (type === "prev") {
      return <a>Prev</a>;
    }
    if (type === "next") {
      return <a>Next</a>;
    }
    return originalElement;
  };

  const listings =
    getAllNftsInMarketPlaceAndSupportFilter
      ?.getAllNftsInMarketPlaceAndSupportFilter?.data || [];

  return (
    <div
      className={`${backgroundTheme} main`}
      style={{
        minHeight: "100vh",
      }}
    >
      <div className="container py-3">
        <div className="search-wrapper">
          <div
            style={{ width: "100%" }}
            className={`d-flex  searchStyle ${bgColor} `}
          >
            <img className="cursor" style={{ width: 15 }} src={search} />
            <Input
              placeholder="Search Here..."
              className={`searchStyle ${bgColor}`}
              onChange={(e) => {
                let filterObjCopy = JSON.parse(filterObj);
                filterObjCopy.q = e.target.value;
                setFilterObj(JSON.stringify(filterObjCopy));
              }}
            />
          </div>
          <button className="search-btn">Search</button>
        </div>
        <div
          style={{
            borderBottom: "0.5px solid #c23737",
            marginTop: "2.5rem",
          }}
        ></div>

        <div className="d-flex justify-content-center marketplace-tabs">
          <div
            className={`marketplace-tabs__group ${
              textColor == "black" ? "marketplace-tabs__group--light" : ""
            }`}
          >
            <button
              type="button"
              className={`marketplace-tabs__btn ${
                !isAuctionTab ? "marketplace-tabs__btn--active" : ""
              }`}
              onClick={() =>
                handleTabChange(ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE)
              }
            >
              Fixed-Price
            </button>
            <button
              type="button"
              className={`marketplace-tabs__btn ${
                isAuctionTab ? "marketplace-tabs__btn--active" : ""
              }`}
              onClick={() =>
                handleTabChange(ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION)
              }
            >
              Auction
            </button>
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-between gap-5 mt-4">
          <div className="d-flex gap-5 flex-column flex-sm-row  ">
            <div
              className={`filter-wrapper ${bgColor}`}
              style={{ width: "fit-content" }}
            >
              <BsFilterLeft style={{ color: "#C93B3B", fontSize: "2rem" }} />
            </div>
            <div className="marketplace-select-field d-flex gap-2">
              <div className={`marketplace-selct-div ${bgColor}`}>
                <Select
                  defaultValue="Category"
                  style={{
                    width: 120,
                  }}
                  className={textColor == "black" && "light"}
                  onChange={handleCategoryChange}
                  options={[
                    {
                      value: "Dance",
                      label: "Dance",
                    },
                    {
                      value: "Emote",
                      label: "Emote",
                    },
                    {
                      value: "Moments",
                      label: "Moments",
                    },
                    {
                      value: "Other",
                      label: "Other",
                    },
                  ]}
                />
              </div>

              <div className={`marketplace-selct-div ${bgColor}`}>
                <Select
                  defaultValue="Price"
                  style={{
                    width: 120,
                  }}
                  className={textColor == "black" && "light"}
                  onChange={handlePriceChange}
                  options={[
                    {
                      value: "0-10",
                      label: "$0-$10",
                    },
                    {
                      value: "10-100",
                      label: "$10-$100",
                    },
                    {
                      value: "100-1000",
                      label: "$100-$1000",
                    },
                    {
                      value: "1000-10000",
                      label: "$1000-$10000",
                    },
                    {
                      value: "10000-100000",
                      label: "$10000+",
                    },
                  ]}
                />
              </div>

              <div className={`marketplace-selct-div ${bgColor}`}>
                <Select
                  defaultValue="Quantity"
                  style={{
                    width: 120,
                  }}
                  onChange={handleQuantityChange}
                  className={textColor == "black" && "light"}
                  options={[
                    {
                      value: "0-10",
                      label: "0-10",
                    },
                    {
                      value: "10-100",
                      label: "10-100",
                    },
                    {
                      value: "100-1000",
                      label: "100-1000",
                    },
                    {
                      value: "1000-10000",
                      label: "1000-10000",
                    },
                    {
                      value: "10000-100000",
                      label: "10000+",
                    },
                  ]}
                />
              </div>

              <div className={`marketplace-selct-div ${bgColor}`}>
                <Select
                  defaultValue="Ranking"
                  style={{
                    width: 120,
                  }}
                  className={textColor == "black" && "light"}
                  onChange={handleRankingChange}
                  options={[
                    {
                      value: "Coming Soon",
                      label: "Coming Soon",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <div
            className={`grid-wrapper d-flex align-items-center ${bgColor}`}
            style={{ width: "fit-content" }}
          >
            <img src={AZ} className="me-2" style={{ width: 20, height: 20 }} />
            <span
              className="me-2"
              style={{ border: "1px solid #D54343", width: 1, height: 20 }}
            ></span>
            <img src={grid} style={{ width: 20, height: 20 }} />
          </div>
        </div>
        <div
          style={{
            borderBottom: "0.5px solid #c23737",
            marginTop: "3.5rem",
          }}
        ></div>

        <div className="d-flex gap-2 align-items-center justify-content-end mb-1 my-3 pagination-wrapper">
          <Pagination
            total={
              getAllNftsInMarketPlaceAndSupportFilter
                ?.getAllNftsInMarketPlaceAndSupportFilter?.totalItems
            }
            pageSize={pageSize}
            current={currentPage}
            onChange={handlePageChange}
            itemRender={itemRender}
          />
        </div>
        <div className="row my-3 p-4 p-md-0">
          {getAllNftsInMarketPlaceAndSupportFilterLoading ? (
            <CardSkeletal />
          ) : listings.length > 0 ? (
            listings.map((item, i) => {
              if (isAuctionTab) {
                return (
                  <CardCompnent
                    key={i}
                    image={imgPaths + item?.user_id?.profileImg}
                    status={item?.nft_id?.status}
                    duration={item?.nft_id?.video_duration}
                    name={item?.nft_id?.name}
                    videoLink={item?.nft_id?.video}
                    marketplacecard
                    collectionBtn
                    userProfile={!!userProfile}
                    auctionStartTime={item?.biddingStartTime}
                    auctionEndTime={item?.biddingEndTime}
                    initialPrice={Number(item?.price)}
                    auctionid={item?.listingID}
                    numberofcopies={item?.numberOfCopies}
                    currentBidAmount={item?.auction_highest_bid}
                    nftOwner={item?.seller?.user_address}
                    royalty={item?.nft_id?.royalty}
                    tokenId={item.tokenId}
                    id={item?.nft_id?._id}
                    itemDbId={item?._id}
                    userObj={item?.seller}
                  />
                );
              }

              if (item?.nft_id?.is_blocked || item?.isSold) {
                return null;
              }

              return (
                <CardCompnent
                  key={i}
                  image={profile2}
                  status={item?.nft_id?.status}
                  name={item?.nft_id?.name}
                  videoLink={item?.nft_id?.video}
                  duration={item?.nft_id?.video_duration}
                  topName
                  collectionBtn
                  detailBtn
                  userProfile={userProfile ? true : false}
                  userId={item?.seller?._id}
                  sellerUsername={item?.seller?.user_name}
                  owners={item?.owners}
                  fixtokenId={item?.tokenid}
                  fixOwner={item?.seller?.user_address}
                  fixRoyalty={item?.nft_id?.royalty}
                  artistName={item?.nft_id?.artist_name1}
                  fixCopies={item?.nft_id?.supply}
                  id={item?.nft_id?._id}
                  likeCount={item?.nft_id?.likeCount}
                  watchCount={item?.nft_id?.watchCount}
                  userObj={item?.seller}
                />
              );
            })
          ) : (
            <div style={{ color: "#fff", margin: "1rem 0rem 3rem 0rem" }}>
              There is no data found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
