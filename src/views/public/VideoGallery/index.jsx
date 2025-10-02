import { useQuery } from "@apollo/client";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, Pagination, Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AZ, grid, profile2, search } from "../../../assets";
import { CardCompnent } from "../../../components";
import { GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER } from "../../../gql/queries";
import { USDTOMATIC } from "../../../utills/currencyConverter";
import { getStorage } from "../../../utills/localStorage";
import "./css/index.css";
import CardSkeletal from "../Dashboard/Skeletal/CardSkeletal";

const environment = process.env;

const VideoGallery = () => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  // const [tokenData, setTokenData] = useState({});

  let token = getStorage("token");

  const { contractData } = useSelector((state) => state.chain.contractData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [filterObj, setFilterObj] = useState(
    JSON.stringify({
      listingType: "fixed_price",
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

  const textColor = useSelector((state) => state.app.theme.textColor);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  const isLight = textColor === "black";

  const { userData } = useSelector((state) => state.address.userData);
  const userProfile = userData?.full_name;
  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

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

  useEffect(() => {
    document.body.classList.remove("app-light", "app-dark");
    document.body.classList.add(isLight ? "app-light" : "app-dark");
  }, [isLight]);
  return (
    <div
      className={`${backgroundTheme} pb-2`}
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      <div className="container">
        <div
          style={{ width: "100%" }}
          className={`d-flex searchStyle ${bgColor} my-4 py-2`}
        >
          <Input
            placeholder="Search Here..."
            className={`searchStyle ${bgColor}`}
            onChange={(e) => {
              let filterObjCopy = JSON.parse(filterObj);
              filterObjCopy.q = e.target.value;
              setFilterObj(JSON.stringify(filterObjCopy));
            }}
          />
          <img className="me-3 cursor" style={{ width: 15 }} src={search} />
        </div>
        <div
          style={{
            borderBottom: "0.5px solid #c23737",
            marginTop: "2.5rem",
          }}
        ></div>
        <div className="d-flex justify-content-between mt-5 main_filter_parent">
          <div className="d-flex gap-5 main_filter_parent__child_filters_with_categorised">
            <div
              className={`filter-wrapper ${bgColor} main_filter_parent__filter_icon`}
            >
              <FontAwesomeIcon
                icon={faFilter}
                style={{ color: "#C93B3B", fontSize: "2rem" }}
              />
              {/* <BsFilterLeft style={{ color: "#C93B3B", fontSize: "2rem" }} /> */}
            </div>
            <div className="marketplace-select-field d-flex gap-2 main_filter_parent__select_icons">
              <div
                className={`marketplace-selct-div ${bgColor} main_filter_parent__select_icons_single`}
              >
                <Select
                  defaultValue="Category"
                  style={{
                    width: 120,
                  }}
                  className={`main_filter_parent__select_icons_single_sub_child ${textColor == "black" && "light"}`}
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

              <div
                className={`marketplace-selct-div ${bgColor} main_filter_parent__select_icons_single`}
              >
                <Select
                  defaultValue="Price"
                  style={{
                    width: 120,
                  }}
                  className={`main_filter_parent__select_icons_single_sub_child ${textColor == "black" && "light"}`}
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

              <div
                className={`marketplace-selct-div ${bgColor} main_filter_parent__select_icons_single`}
              >
                <Select
                  defaultValue="Quantity"
                  style={{
                    width: 120,
                  }}
                  onChange={handleQuantityChange}
                  className={`main_filter_parent__select_icons_single_sub_child ${textColor == "black" && "light"}`}
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

              <div
                className={`marketplace-selct-div ${bgColor} main_filter_parent__select_icons_single`}
              >
                <Select
                  defaultValue="Ranking"
                  style={{
                    width: 120,
                  }}
                  className={`main_filter_parent__select_icons_single_sub_child ${textColor == "black" && "light"}`}
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
        <div className="row my-3  p-4 p-md-0">
          {getAllNftsInMarketPlaceAndSupportFilterLoading ? (
            <CardSkeletal />
          ) : getAllNftsInMarketPlaceAndSupportFilter
              ?.getAllNftsInMarketPlaceAndSupportFilter?.data?.length > 0 ? (
            getAllNftsInMarketPlaceAndSupportFilter?.getAllNftsInMarketPlaceAndSupportFilter?.data?.map(
              (item, i) => {
                if (!item?.nft_id?.is_blocked && item.isSold == false) {
                  return (
                    <CardCompnent
                      key={i}
                      image={profile2}
                      status={item?.nft_id?.status}
                      name={item?.nft_id?.name}
                      videoLink={item?.nft_id?.video}
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
                      fixCopies={item?.nft_id?.supply}
                      id={item?.nft_id?._id}
                      likeCount={item?.nft_id?.likeCount}
                      watchCount={item?.nft_id?.watchCount}
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

export default VideoGallery;
