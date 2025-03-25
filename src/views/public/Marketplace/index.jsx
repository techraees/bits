import React, { useEffect, useState } from "react";
import { CardCompnent } from "../../../components";
import { useSelector } from "react-redux";
import { Input, Select } from "antd";
import { AZ, grid, search } from "../../../assets";
import { BsFilterLeft } from "react-icons/bs";
import { useQuery } from "@apollo/client";
import {
  GET_ALL_NFTS_WITHOUT_ADDRESS,
  GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER,
} from "../../../gql/queries";
import "./css/index.css";
import { WeiToETH } from "../../../utills/convertWeiAndBnb";
import { USDTOMATIC } from "../../../utills/currencyConverter";
import { getStorage } from "../../../utills/localStorage";
import { dbDateToTime } from "../../../utills/timeToTimestamp";

const environment = process.env;

const Marketplace = () => {
  const { data, refetch } = useQuery(GET_ALL_NFTS_WITHOUT_ADDRESS);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState([]);
  const [quantityFilter, setQuantityFilter] = useState([]);
  const [allnfts, setAllNfts] = useState([]);
  const [auctionsDatas, setAuctionsDatas] = useState([]);
  const [auctionItemData, setAuctionItemData] = useState([]);

  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  const textColor = useSelector((state) => state.app.theme.textColor);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  const { userData } = useSelector((state) => state.address.userData);
  // const { auctionItemData } = useSelector(
  //   (state) => state.auctionItemDatas.auctionItemData
  // );
  const { contractData } = useSelector((state) => state.chain.contractData);

  console.log("contract chain", contractData.chain.toString());
  const {
    data: getAllNftsInMarketPlaceAndSupportFilter,
    isLoading: getAllNftsInMarketPlaceAndSupportFilterLoading,
    isFetching: getAllNftsInMarketPlaceAndSupportFilterFetching,
  } = useQuery(GET_ALL_NFTS_IN_MARKET_PLACE_AND_SUPPORT_FILTER, {
    variables: {
      filterObj: '{"listingType":"auction"}',
      chainId: contractData.chain.toString(),
    },
  });

  useEffect(() => {
    if (getAllNftsInMarketPlaceAndSupportFilter) {
      setAuctionItemData(
        getAllNftsInMarketPlaceAndSupportFilter
          ?.getAllNftsInMarketPlaceAndSupportFilter?.data
      );
    }
  }, [getAllNftsInMarketPlaceAndSupportFilter]);

  const userProfile = userData?.full_name;
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
  );

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
  //   let filteredAuctionItems;
  //   if (priceFilter && auctionItemData) {
  //     filteredAuctionItems = auctionItemData.filter((item) => {
  //       const price = WeiToETH(`${Number(item.initialPrice)}`);
  //       return (
  //         Number(price) >= Number(priceFilter[0]) &&
  //         Number(price) <= Number(priceFilter[1])
  //       );
  //     });
  //   }

  //   setAuctionsDatas(filteredAuctionItems);
  // }, [priceFilter]);

  useEffect(() => {
    let filteredAuctionItems;
    if (auctionItemData) {
      filteredAuctionItems = auctionItemData.filter((item) => {
        let copies = Number(item.numberofcopies);
        return (
          Number(copies) >= Number(quantityFilter[0]) &&
          Number(copies) <= Number(quantityFilter[1])
        );
      });
    }

    setAuctionsDatas(filteredAuctionItems);
  }, [quantityFilter]);

  useEffect(() => {
    refetch();
  }, []);

  const compareTime = (time) => {
    const givenTime = new Date(time);
    const currentTime = new Date();

    if (currentTime > givenTime) {
      return false;
    }

    return true;
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
        <div className="d-flex justify-content-between mt-5">
          <div className="d-flex gap-5 ">
            <div className={`filter-wrapper ${bgColor}`}>
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
          <div className={`grid-wrapper ${bgColor}`}>
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
            ? auctionsDatas
            : auctionItemData
          )?.map((item, i) => {
            if (
              !item?.nft_id?.is_blocked &&
              compareTime(item?.biddingEndTime) &&
              item.isSold === false
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
                  auctionid={Number(item?.listingID)}
                  numberofcopies={item?.numberOfCopies}
                  currentBidAmount={item?.auction_highest_bid}
                  nftOwner={item?.seller?.user_address}
                  royalty={item?.nft_id?.royalty}
                  tokenId={Number(item.tokenId)}
                  id={item?.nft_id?._id}
                  itemDbId={item?._id}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
