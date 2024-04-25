import React, { useEffect, useState } from "react";
import "./css/index.css";
import { NavbarComponent, CardCompnent } from "../../components";
import { Input, Select } from "antd";
import { search, AZ, grid, profile } from "../../assets";
import { useSelector } from "react-redux";
import { BsFilterLeft } from "react-icons/bs";
import { GET_ALL_NFTS_WITHOUT_ADDRESS } from "../../gql/queries";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

import { USDTOMATIC } from "../../utills/currencyConverter";

import "./css/index.css";

const environment = process.env;

const VideoGallery = () => {
  const { loading, error, data, refetch } = useQuery(
    GET_ALL_NFTS_WITHOUT_ADDRESS
  );

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
  );

  const [tokenData, setTokenData] = useState({});

  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState([]);
  const [quantityFilter, setQuantityFilter] = useState([]);
  const [allnfts, setAllNfts] = useState([]);
  const [fixedItemsDatas, setFixedItemsDatas] = useState([]);

  const { contractData } = useSelector((state) => state.chain.contractData);
  const { fixedItemData } = useSelector(
    (state) => state.fixedItemDatas.fixedItemData
  );

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
      })
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

  useEffect(() => {
    let filteredFixedItems;
    if (priceFilter && fixedItemData) {
      filteredFixedItems = fixedItemData
        .map((item) => ({
          ...item,
          owners: item.owners.filter((owner) => {
            const usdPrice = Number(owner.price);
            return (
              Number(usdPrice) >= Number(priceFilter[0]) &&
              Number(usdPrice) <= Number(priceFilter[1])
            );
          }),
        }))
        .filter((item) => item.owners.length > 0);
    }

    setFixedItemsDatas(filteredFixedItems);
  }, [priceFilter]);

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

  return (
    <div
      className={`${backgroundTheme} pb-2`}
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      <NavbarComponent
        toggleBtn={textColor === "white" ? true : false}
        selectedKey={"3"}
        headerText={"Emote Video Gallery"}
      />
      <div className="container">
        <div
          style={{ width: "100%" }}
          className={`d-flex searchStyle ${bgColor} my-4`}
        >
          <Input
            placeholder="Search Here..."
            className={`searchStyle ${bgColor}`}
          />
          <img className="me-3 cursor" style={{ width: 15 }} src={search} />
        </div>
        <div
          style={{ borderBottom: "0.5px solid #c23737", marginTop: "2.5rem" }}
        ></div>
        <div className="d-flex justify-content-between mt-5">
          <div className="d-flex gap-sm-5 parentFlexDivForGap">
            <div className={`filter-wrapper ${bgColor} svgConIconParent`}>
              <FontAwesomeIcon
                icon={faFilter}
                style={{ color: "#C93B3B", fontSize: "2rem" }}
                className="svgConIcon"
              />
              {/* <BsFilterLeft style={{ color: "#C93B3B", fontSize: "2rem" }} /> */}
            </div>
            <div className="marketplace-select-field d-flex gap-2 selectVideoGalleryOption">
              <div
                className={`marketplace-selct-div ${bgColor} selectVideoGalleryOptionSingle`}
              >
                <Select
                  defaultValue="Category"
                  style={{
                    width: 120,
                  }}
                  className={`${
                    textColor == "black" && "light"
                  } selectVideoGalleryOptionSingle_real`}
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
                className={`marketplace-selct-div ${bgColor} selectVideoGalleryOptionSingle`}
              >
                <Select
                  defaultValue="Price"
                  style={{
                    width: 120,
                  }}
                  className={`${
                    textColor == "black" && "light"
                  }  selectVideoGalleryOptionSingle_real`}
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
                className={`marketplace-selct-div ${bgColor} selectVideoGalleryOptionSingle`}
              >
                <Select
                  defaultValue="Quantity"
                  style={{
                    width: 120,
                  }}
                  onChange={handleQuantityChange}
                  className={`${
                    textColor == "black" && "light"
                  }  selectVideoGalleryOptionSingle_real`}
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
                className={`marketplace-selct-div ${bgColor} selectVideoGalleryOptionSingle`}
              >
                <Select
                  defaultValue="Ranking"
                  style={{
                    width: 120,
                  }}
                  className={`${
                    textColor == "black" && "light"
                  }  selectVideoGalleryOptionSingle_real`}
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
          <div className={`grid-wrapper ${bgColor} svgConIconParentWithNoWrap`}>
            <img
              src={AZ}
              className="me-2 svgConIconAZImage"
              style={{ width: "20px", height: "20px" }}
            />
            <span
              className="me-2 svgConIconParentSpanLine"
              style={{ border: "1px solid #D54343" }}
            ></span>
            <img
              src={grid}
              style={{ width: 20, height: 20 }}
              className="svgConIconAZImage"
            />
          </div>
        </div>
        <div
          style={{ borderBottom: "0.5px solid #c23737", marginTop: "3.5rem" }}
        ></div>
        <div className="row my-3">
          {(priceFilter.length > 0 || quantityFilter.length > 0
            ? fixedItemsDatas
            : fixedItemData
          )?.map((item) => {
            return (
              categoryFilter ? allnfts : data?.getAllNftsWithoutAddress
            )?.map((e, i) => {
              if (
                !e.is_blocked &&
                item.tokenid == e.token_id &&
                contractData.chain == e.chainId &&
                item.isSold == false
              ) {
                return (
                  <CardCompnent
                    key={i}
                    image={imgPaths + e?.user_id?.profileImg}
                    status={e.status}
                    name={e.name}
                    videoLink={e.video}
                    topName
                    collectionBtn
                    detailBtn
                    userProfile={userProfile ? true : false}
                    userId={e?.user_id?.id}
                    sellerUsername={e?.user_id?.user_name}
                    owners={item.owners}
                    fixtokenId={item.tokenid}
                    fixOwner={e.wallet_address}
                    fixRoyalty={e.royalty}
                    fixCopies={e.supply}
                    id={e._id}
                    likeCount={e.likeCount}
                    watchCount={e.watchCount}
                  />
                );
              }
            });
          })}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
