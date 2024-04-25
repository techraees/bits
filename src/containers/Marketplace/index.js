import React, { useEffect, useState } from "react";
import { CardCompnent, NavbarComponent } from "../../components";
import { useSelector } from "react-redux";
import { Input, Select } from "antd";
import { AZ, grid, profile, search } from "../../assets";
import { BsFilterLeft } from "react-icons/bs";
import { GET_ALL_NFTS_WITHOUT_ADDRESS } from "../../gql/queries";
import { useQuery } from "@apollo/client";
import "./css/index.css";
import { WeiToETH } from "../../utills/convertWeiAndBnb";
import { USDTOMATIC } from "../../utills/currencyConverter";

const environment = process.env;

const Marketplace = () => {
  const { loading, error, data, refetch } = useQuery(
    GET_ALL_NFTS_WITHOUT_ADDRESS
  );

  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState([]);
  const [quantityFilter, setQuantityFilter] = useState([]);
  const [allnfts, setAllNfts] = useState([]);
  const [auctionsDatas, setAuctionsDatas] = useState([]);

  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  const textColor = useSelector((state) => state.app.theme.textColor);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  const { userData } = useSelector((state) => state.address.userData);
  const { auctionItemData } = useSelector(
    (state) => state.auctionItemDatas.auctionItemData
  );
  const { contractData } = useSelector((state) => state.chain.contractData);

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

  useEffect(() => {
    let filteredAuctionItems;
    if (priceFilter && auctionItemData) {
      filteredAuctionItems = auctionItemData.filter((item) => {
        const price = WeiToETH(`${Number(item.initialPrice)}`);
        return (
          Number(price) >= Number(priceFilter[0]) &&
          Number(price) <= Number(priceFilter[1])
        );
      });
    }

    setAuctionsDatas(filteredAuctionItems);
  }, [priceFilter]);

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

  const timenow = Math.floor(Date.now() / 1000);

  return (
    <div
      className={`${backgroundTheme} main`}
      style={{
        minHeight: "100vh",
      }}
    >
      <NavbarComponent
        toggleBtn={textColor === "white" ? true : false}
        selectedKey={"4"}
        headerText={"Marketplace"}
      />
      <div className="container py-3">
        <div className="search-wrapper">
          <div
            style={{ width: "100%" }}
            className={`d-flex  searchStyle ${bgColor} `}
          >
            <img className=" cursor" style={{ width: 15 }} src={search} />
            <Input
              placeholder="Search Here..."
              className={`searchStyle ${bgColor}`}
            />
          </div>
          <button className="search-btn">Search</button>
        </div>
        <div
          style={{ borderBottom: "0.5px solid #c23737", marginTop: "2.5rem" }}
        ></div>
        <div className="d-flex justify-content-between mt-5">
          <div className="d-flex gap-5 ">
            <div className={`filter-wrapper ${bgColor} svgConIconParent`}>
              <BsFilterLeft
                style={{ color: "#C93B3B", fontSize: "2rem" }}
                className="svgConIcon"
              />
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
                  } selectVideoGalleryOptionSingle_real`}
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
              style={{ width: 20, height: 20 }}
            />
            <span
              className="me-2 svgConIconParentSpanLine"
              style={{ border: "1px solid #D54343" }}
            ></span>
            <img
              src={grid}
              style={{ width: 20, height: 20 }}
              className="me-2 svgConIconAZImage"
            />
          </div>
        </div>
        <div
          style={{ borderBottom: "0.5px solid #c23737", marginTop: "3.5rem" }}
        ></div>
        <div className="row my-3">
          {(priceFilter.length > 0 || quantityFilter.length > 0
            ? auctionsDatas
            : auctionItemData
          )?.map((item) => {
            return (
              categoryFilter ? allnfts : data?.getAllNftsWithoutAddress
            )?.map((e, i) => {
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
                    image={imgPaths + e?.user_id?.profileImg}
                    status={e.status}
                    name={e.name}
                    videoLink={e.video}
                    marketplacecard
                    collectionBtn
                    userProfile={userProfile ? true : false}
                    auctionStartTime={Number(item.auctionStartTime)}
                    auctionEndTime={Number(item.auctionEndTime)}
                    initialPrice={WeiToETH(`${Number(item.initialPrice)}`)}
                    auctionid={Number(item.auctionid)}
                    numberofcopies={e.supply}
                    currentBidAmount={WeiToETH(
                      `${Number(item.currentBidAmount)}`
                    )}
                    nftOwner={e.wallet_address}
                    royalty={e.royalty}
                    tokenId={Number(item.tokenId)}
                    id={e._id}
                  />
                );
              }
            });
          })}
          {/* {cardsData.map((e, i) => {
            console.log(e.videoLink);
            // const status = "First Gen Emote";
            return (
              <CardCompnent
                key={i}
                image={e.image}
                status="First Gen Emote"
                name={e.name}
                videoLink={e.videoLink}
                marketplacecard
                collectionBtn
                userProfile={userProfile ? true : false}
              />
            );
          })} */}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
