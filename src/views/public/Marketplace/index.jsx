import { useQuery } from "@apollo/client";
import { Input, Pagination, Select } from "antd";
import { useState } from "react";
import { BsFilterLeft } from "react-icons/bs";
import { useSelector } from "react-redux";
import { AZ, grid, search } from "../../../assets";
import { CardCompnent } from "../../../components";
import { GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER } from "../../../gql/queries";
import { USDTOMATIC } from "../../../utills/currencyConverter";
import { dbDateToTime } from "../../../utills/timeToTimestamp";
import "./css/index.css";
import CardSkeletal from "./Skeletal/CardSkeletal";

const environment = process.env;

const Marketplace = () => {
  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  const textColor = useSelector((state) => state.app.theme.textColor);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const [filterObj, setFilterObj] = useState(
    JSON.stringify({
      listingType: "auction",
      page: currentPage,
      limit: pageSize,
      available: true,
    }),
  );

  const {
    data: getAllNftsInMarketPlaceAndSupportFilter,
    loading: getAllNftsInMarketPlaceAndSupportFilterLoading,
  } = useQuery(GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER, {
    variables: {
      filterObj: filterObj,
      chainId: contractData.chain.toString(),
    },
  });

  const userProfile = userData?.full_name;
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

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

    console.log(convertedPrice);
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
    console.log("selected value", value);
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
        <div className="d-flex flex-column flex-sm-row justify-content-between gap-5 mt-5">
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
                      value: "010",
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
                      value: "10000 - 100000",
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
                      value: "10000 - 100000",
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
          ) : getAllNftsInMarketPlaceAndSupportFilter
              ?.getAllNftsInMarketPlaceAndSupportFilter?.data?.length > 0 ? (
            getAllNftsInMarketPlaceAndSupportFilter?.getAllNftsInMarketPlaceAndSupportFilter?.data.map(
              (item, i) => {
                if (
                  true
                  // !item?.nft_id?.is_blocked &&
                  // compareTime(item?.biddingEndTime) &&
                  // item.isSold === false
                ) {
                  return (
                    <CardCompnent
                      key={i}
                      image={imgPaths + item?.user_id?.profileImg}
                      status={item?.nft_id?.status}
                      name={item?.nft_id?.name}
                      videoLink={item?.nft_id?.video}
                      marketplacecard
                      collectionBtn
                      userProfile={!!userProfile}
                      auctionStartTime={dbDateToTime(item?.biddingStartTime)}
                      auctionEndTime={dbDateToTime(item?.biddingEndTime)}
                      initialPrice={Number(item?.price)}
                      auctionid={item?.listingID}
                      numberofcopies={item?.numberOfCopies}
                      currentBidAmount={item?.auction_highest_bid}
                      nftOwner={item?.seller?.user_address}
                      royalty={item?.nft_id?.royalty}
                      tokenId={item.tokenId}
                      id={item?.nft_id?._id}
                      itemDbId={item?._id}
                    />
                  );
                }
              },
            )
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
