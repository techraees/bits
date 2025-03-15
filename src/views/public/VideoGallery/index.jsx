import React, { useEffect, useState } from "react";
import "./css/index.css";
import { Input, Select } from "antd";
import { search, AZ, grid } from "../../../assets";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import {
  GET_ALL_NFTS_WITHOUT_ADDRESS,
  GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER,
} from "../../../gql/queries";
import { USDTOMATIC } from "../../../utills/currencyConverter";
import { CardCompnent } from "../../../components";
import { profile2 } from "../../../assets";

const environment = process.env;

const VideoGallery = () => {
  const { data, refetch } = useQuery(GET_ALL_NFTS_WITHOUT_ADDRESS);

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  // const [tokenData, setTokenData] = useState({});

  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState([]);
  const [quantityFilter, setQuantityFilter] = useState([]);
  const [allnfts, setAllNfts] = useState([]);
  const [fixedItemsDatas, setFixedItemsDatas] = useState([]);
  const [fixedItemData, setFixedItemData] = useState([]);

  const {
    data: getAllNftsInMarketPlaceAndSupportFilter,
    isLoading: getAllNftsInMarketPlaceAndSupportFilterLoading,
    isFetching: getAllNftsInMarketPlaceAndSupportFilterFetching,
  } = useQuery(GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER, {
    variables: {
      filterObj: '{"listingType":"fixed_price"}',
    },
  });

  useEffect(() => {
    if (getAllNftsInMarketPlaceAndSupportFilter) {
      setFixedItemData(
        getAllNftsInMarketPlaceAndSupportFilter
          ?.getAllNftsInMarketPlaceAndSupportFilter?.data,
      );
    }
  }, [getAllNftsInMarketPlaceAndSupportFilter]);

  const { contractData } = useSelector((state) => state.chain.contractData);
  // const { fixedItemData } = useSelector(
  //   (state) => state.fixedItemDatas.fixedItemData
  // );

  const textColor = useSelector((state) => state.app.theme.textColor);
  const bgColor = useSelector((state) => state.app.theme.bgColor);

  const { userData } = useSelector((state) => state.address.userData);
  const userProfile = userData?.full_name;
  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
  };

  const handlePriceChange = async (value) => {
    const data = value.split("-").map(Number);

    // Use Promise.all to wait for all promises to be resolved
    const convertedPrice = await Promise.all(
      data.map(async (val) => {
        return await USDTOMATIC(val);
      }),
    );

    setPriceFilter(convertedPrice);
  };

  const handleQuantityChange = (value) => {
    const data = value.split("-").map(Number);
    setQuantityFilter(data);
  };

  const handleRankingChange = (value) => {
    console.log("selected value", value);
  };

  // useEffect(() => {
  //   if (data) {
  //     setAllNfts(data?.getAllNftsWithoutAddress);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (fixedItemData) {
  //     setFixedItemsDatas(fixedItemData);
  //   }
  // }, [fixedItemData]);

  useEffect(() => {
    let filterdItems;
    if (categoryFilter && data?.getAllNftsWithoutAddress) {
      filterdItems = data?.getAllNftsWithoutAddress.filter((item) => {
        return item.category === categoryFilter;
      });
    }
    setAllNfts(filterdItems);
  }, [categoryFilter]);

  // useEffect(() => {
  //   let filteredFixedItems;
  //   if (priceFilter && fixedItemData) {
  //     filteredFixedItems = fixedItemData
  //       .map((item) => ({
  //         ...item,
  //         owners: item.owners.filter((owner) => {
  //           const usdPrice = Number(owner.price);
  //           return (
  //             Number(usdPrice) >= Number(priceFilter[0]) &&
  //             Number(usdPrice) <= Number(priceFilter[1])
  //           );
  //         }),
  //       }))
  //       .filter((item) => item.owners.length > 0);
  //   }

  //   setFixedItemsDatas(filteredFixedItems);
  // }, [priceFilter]);

  useEffect(() => {
    let filteredFixedItems;
    if (priceFilter && fixedItemData) {
      filteredFixedItems = fixedItemData
        .map((item) => ({
          ...item,
          owners: item.owners.filter((owner) => {
            const copies = Number(owner.copies);
            return (
              Number(copies) >= Number(quantityFilter[0]) &&
              Number(copies) <= Number(quantityFilter[1])
            );
          }),
        }))
        .filter((item) => item.owners.length > 0);
    }

    setFixedItemsDatas(filteredFixedItems);
  }, [quantityFilter]);

  useEffect(() => {
    refetch();
  }, []);

  console.log("All data", fixedItemData, fixedItemsDatas);

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
            className={`grid-wrapper ${bgColor} main_filter_parent__select_icons_single__icons`}
          >
            <img src={AZ} className="me-2" style={{ width: 20, height: 20 }} />
            <span
              className="me-2"
              style={{ border: "1px solid #D54343" }}
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
        <div className="row my-3">
          {(priceFilter.length > 0 ||
          quantityFilter.length > 0 ||
          categoryFilter
            ? fixedItemsDatas
            : fixedItemData
          )?.map((item, i) => {
            if (
              !item?.nft_id?.is_blocked &&
              contractData.chain == item?.nft_id?.chainId &&
              item.isSold == false
            ) {
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
          })}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
