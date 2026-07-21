import { useQuery } from "@apollo/client";
import { Input } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { profile2, search } from "../../../assets";
import { CardCompnent } from "../../../components";
import { ALLOWED_MARKET_PLACE_NFT_TYPE } from "../../../data/enums";
import { GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER } from "../../../gql/queries";
import "./css/index.css";
import CardSkeletal from "./Skeletal/CardSkeletal";
import MarketplacePagination from "./MarketplacePagination";
const environment = process.env;
const PAGE_SIZE_BY_TYPE = {
  [ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE]: 12,
  [ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION]: 4,
};
const MARKETPLACE_TAB_ITEMS = [
  {
    key: ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE,
    label: "Buy Now",
  },
  {
    key: ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION,
    label: "Auction",
  },
];
const resolveInitialTab = (requestedTab) => {
  if (requestedTab === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION) {
    return ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION;
  }
  return ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE;
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
  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const userProfile = userData?.full_name;
  const isLight = textColor === "black";
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = resolveInitialTab(requestedTab);
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
    fetchPolicy: "cache-and-network",
  });
  const isAuctionTab = activeTab === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION;
  const pageSize = PAGE_SIZE_BY_TYPE[activeTab];
  const totalItems =
    getAllNftsInMarketPlaceAndSupportFilter
      ?.getAllNftsInMarketPlaceAndSupportFilter?.totalItems || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1);
    setFilterObj(JSON.stringify(buildFilterObj(tab, 1)));
    setSearchParams({
      tab,
    });
  };
  const handlePageChange = (page) => {
    let filterObjCopy = JSON.parse(filterObj);
    filterObjCopy.page = page;
    setFilterObj(JSON.stringify(filterObjCopy));
    setCurrentPage(page);
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
        <div
          className={`search-wrapper ${isLight ? "search-wrapper--light" : ""}`}
        >
          <div className="marketplace-search-field">
            <img className="marketplace-search-icon" src={search} alt="" />
            <Input
              placeholder="Search Here . . ."
              className="marketplace-search-input"
              bordered={false}
              onChange={(e) => {
                let filterObjCopy = JSON.parse(filterObj);
                filterObjCopy.q = e.target.value;
                setFilterObj(JSON.stringify(filterObjCopy));
              }}
            />
          </div>
          <button type="button" className="search-btn">
            Search
          </button>
        </div>
        <div
          className={`marketplace-toolbar ${isLight ? "marketplace-toolbar--light" : ""}`}
        >
          <div className="marketplace-nav-tabs">
            {MARKETPLACE_TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`marketplace-nav-tabs__btn ${activeTab === tab.key ? "marketplace-nav-tabs__btn--active" : ""}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <MarketplacePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
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
            <div
              className={`marketplace-empty-state ${isLight ? "marketplace-empty-state--light" : ""}`}
            >
              There is no data found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Marketplace;
