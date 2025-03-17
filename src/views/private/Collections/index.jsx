import React, { useEffect, useState } from "react";
import {
  location,
  upload,
  search,
  AZ,
  grid,
  ellipse,
  location_dark,
  upload_red,
} from "../../../assets";
import {
  ButtonComponent,
  CardCompnent,
  UploadVideoModal,
} from "../../../components";
import profileimg from "../../../assets/images/profile1.svg";
import "./css/index.css";
import { Col, Input, Pagination, Row, Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useLazyQuery } from "@apollo/client";
import {
  GET_ALL_NFTS,
  GET_PROFILE_DETAILS_QUERY,
  GET_ALL_NFTS_WITHOUT_ADDRESS,
  Get_MY_NFTS_THAT_I_OWNED,
} from "../../../gql/queries";
// import { MINT_ASSET_MUTATION } from "../../../gql/mutations";
// import { USDTOETH } from "../../../utills/currencyConverter";
import { getAllNftsByAddressAlchemy } from "../../../config/infura";
import { useAppKitAccount } from "@reown/appkit/react";
import { getStorage } from "../../../utills/localStorage";

const environment = process.env;

const Collections = () => {
  const { address } = useAppKitAccount();
  const pageSize = 20;
  // const [
  // 	mintAsset,
  // 	 { loading: mintingLoading, error: mintingError, data }
  // 	] =
  // 	useMutation(MINT_ASSET_MUTATION);
  const { userId } = useParams();

  const {
    // loading: nftLoading,
    // error: nftError,
    data: allNftsWithoutAddr,
    refetch: nftsRefetch,
  } = useQuery(GET_ALL_NFTS_WITHOUT_ADDRESS);

  // const handleMintAsset = async (walletAddress) => {
  // 	try {
  // 		const result = await mintAsset({
  // 			variables: { walletAddress },
  // 		});
  // 	} catch (error) {
  // 		console.log(error);
  // 	}
  // };

  // const [val, setVal] = useState(0);
  // USDTOETH(10).then(function (result) {
  // 	setVal(result);
  // });

  const [getNft, { data: allNfts, refetch: allNftRefetch }] = useLazyQuery(
    GET_ALL_NFTS,
    {
      fetchPolicy: "network-only",
    },
  );

  const [
    getProfile,
    {
      // loading: profileLoadeing,
      // error: profileError,
      data: profileData,
      // refetch,
    },
  ] = useLazyQuery(GET_PROFILE_DETAILS_QUERY, {
    variables: { getProfileDetailsId: userId },
  });

  let token = getStorage("token");

  const [getMyNftsThatIOwned, { data: ownedData, error }] = useLazyQuery(
    Get_MY_NFTS_THAT_I_OWNED,
    {
      fetchPolicy: "network-only",
    },
  );

  useEffect(() => {
    if (error) {
      console.error("GraphQL Error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (userId) {
      getProfile({ variables: userId });
    }
  }, [userId]);

  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const userProfile = profileData?.GetProfileDetails?.profileImg;

  const full_name = profileData?.GetProfileDetails?.full_name;
  const country = profileData?.GetProfileDetails?.country;
  const bio = profileData?.GetProfileDetails?.bio;

  useEffect(() => {
    if (profileData?.GetProfileDetails) {
      const variables = {
        walletAddress: profileData?.GetProfileDetails?.user_address,
      };

      getNft({ variables });
    }
  }, [profileData]);

  const [nfts, setNfts] = useState(null);
  const [nftsAll, setAllNfts] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isSorting, setIsSorting] = useState(false);

  const [tokenIdsByOwner, setTokenIdsByOwner] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [createdNfts, setCreatedNfts] = useState([]);
  const [ownedNfts, setOwnedNfts] = useState([]);

  // get owned nfts and created NFTs

  useEffect(() => {
    let isCurrent = true;

    const fetchNfts = async () => {
      if (profileData?.GetProfileDetails?.user_address) {
        const variables = {
          token: token,
          wallet_address: profileData.GetProfileDetails.user_address,
          ownership_type: activeTab === "1" ? "created" : "owned",
        };

        try {
          const { data } = await getMyNftsThatIOwned({ variables });
          if (isCurrent) {
            const nftss = data?.getMyNftsThatIOwned?.data || [];
            activeTab === "1" ? setCreatedNfts(nftss) : setOwnedNfts(nftss);
          }
        } catch (error) {
          console.error("Error fetching NFTs:", error);
        }
      }
    };

    fetchNfts();
    return () => {
      isCurrent = false;
    };
  }, [activeTab, profileData?.GetProfileDetails?.user_address]);

  console.log("all nfts", ownedNfts, createdNfts);

  //get all tokenIds by an address
  useEffect(() => {
    async function getTokenIds() {
      const tokens = await getAllNftsByAddressAlchemy(
        profileData?.GetProfileDetails?.user_address,
        contractData.chain,
        contractData.mintContract.address,
      );
      setTokenIdsByOwner(tokens);
    }
    getTokenIds();
  }, [profileData]);

  useEffect(() => {
    if (allNfts) {
      setNfts(allNfts.getAllNfts);
      setAllNfts(allNfts.getAllNfts);
    }
  }, [allNfts]);

  useEffect(() => {
    if (nftsAll) {
      const filteredNfts = nftsAll.filter((nft) =>
        nft.name.toLowerCase().startsWith(searchTerm.toLowerCase()),
      );
      setNfts(filteredNfts);
    }
  }, [nftsAll, searchTerm]);

  const sortingHandle = () => {
    if (isSorting) {
      if (searchTerm) {
        const reversed = [...nfts]?.reverse();
        setNfts(reversed);
      } else {
        const reversed = [...nfts]?.reverse();
        setAllNfts(reversed);
      }
    } else {
      let temp = nfts;
      if (searchTerm) {
        let data = nfts?.filter((item) =>
          item.name.toLowerCase().startsWith(searchTerm),
        );
        temp = data;
      }

      setAllNfts(temp);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setAllNfts(allNfts?.getAllNfts);
    }
  }, [searchTerm]);

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const textColor3 = useSelector((state) => state.app.theme.textColor3);
  const bgColor = useSelector((state) => state.app.theme.bgColor);

  const [uploadVideoModal, setUploadVideoModal] = useState(false);
  let navigate = useNavigate();
  // const handleChange = (value) => {};

  // const { web3, account } = useSelector((state) => state.web3.walletData);

  const imgPath = environment.REACT_APP_BACKEND_BASE_URL + "/" + userProfile;
  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  // pagination

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the index of the first item on the current page
  const startIndex = (currentPage - 1) * pageSize;

  // Slice the nfts array to show only  the items on the current page

  let currentNfts;
  currentNfts = nfts && nfts?.slice(startIndex, startIndex + pageSize);
  if (searchTerm) {
    currentNfts = nfts;
  } else {
    currentNfts = nfts && nfts?.slice(startIndex, startIndex + pageSize);
  }

  // Handle page change event
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Render pagination item
  const itemRender = (current, type, originalElement) => {
    if (type === "prev") {
      return <a>Prev</a>;
    }
    if (type === "next") {
      return <a>Next</a>;
    }
    return originalElement;
  };
  function extractIPFSHash(url) {
    const regex = /ipfs\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    if (match) {
      return match[1]; // Use match[1] to get the captured group (the IPFS hash).
    } else {
      return null;
    }
  }

  useEffect(() => {
    nftsRefetch();
  }, []);

  useEffect(() => {
    allNftRefetch();
  }, []);

  return (
    <div className={`${backgroundTheme}`} style={{ minHeight: "100vh" }}>
      <UploadVideoModal
        visible={uploadVideoModal}
        onClose={() => setUploadVideoModal(false)}
      />

      <div className="container">
        <Row className="my-5">
          <Col lg={12} md={24} sm={24} xs={24}>
            <div className="d-flex justify-content-center my-3 align-items-center flex-wrap">
              {userProfile ? (
                <img
                  alt="dp"
                  src={imgPath}
                  width={200}
                  onError={(e) => {
                    e.target.src = profileimg;
                  }}
                  style={{ borderRadius: "50%" }}
                  className="my-2 profile_icon_image"
                />
              ) : (
                <img
                  alt="dp"
                  src={profileimg}
                  style={{ borderRadius: "50%" }}
                  width={200}
                  className="my-2 profile_icon_image"
                />
              )}
              <div
                className="circle_ring_icon_abs"
                style={{ position: "absolute", width: 540 }}
              >
                <img
                  alt="ellipse"
                  src={ellipse}
                  style={{ borderRadius: "50%" }}
                  width={200}
                  className="my-2"
                />
              </div>
              <div className="ms-3 no_margin">
                <h3 className="red-gradient-color semi-bold">{full_name}</h3>
                {country && (
                  <div className="d-flex mb-1 ms-5">
                    <h5 className={`m-0 ${textColor}`}>{country}</h5>
                    <img
                      className="ms-2"
                      alt="location"
                      src={textColor === "white" ? location : location_dark}
                    />
                  </div>
                )}

                <span className={`ms-5 ${textColor2}`}>{bio}</span>
                <div className="ms-5 mt-4">
                  {profileData?.GetProfileDetails?.id === userData?.id && (
                    <ButtonComponent
                      onClick={() => navigate("/account-settings/edit-profile")}
                      simple
                      text={"Edit Profile"}
                      width={150}
                    />
                  )}
                </div>
              </div>
            </div>
          </Col>
          <Col lg={12} md={24} sm={24} xs={24}>
            <div className="d-flex justify-content-center my-3">
              <div
                className="uploadView"
                onClick={() => setUploadVideoModal(true)}
              >
                <img src={textColor === "white" ? upload : upload_red} />
                <p className={`${textColor3}`}>Upload Emote/Video</p>
              </div>
            </div>
          </Col>
        </Row>

        <div style={{ border: "1px solid #B23232" }}></div>
        <div className="my-4 d-flex justify-content-between">
          <div
            style={{ width: "100%" }}
            className={`d-flex searchStyle ${bgColor}`}
          >
            <Input
              placeholder="Search Here..."
              className={`searchStyle ${bgColor}`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* <Input
              placeholder="Search Here..."
              className={`searchStyle ${bgColor}`}
              onChange={(e) => {
                setIsSearching(e.target.value);
                console.log("edfdf", e.target.value);
                let data = nfts?.filter((item) =>
                  item.name.toLowerCase().startsWith(e.target.value)
                );
                console.log("data", data);

                setIsSearch(data);
              }}
            /> */}
            <img className="me-3 cursor" style={{ width: 15 }} src={search} />
          </div>
          <div
            className={`d-flex ms-3 p-2 ${bgColor}`}
            style={{ borderRadius: 20 }}
            onClick={() => {
              setIsSorting(!isSorting);
              sortingHandle();
            }}
          >
            <img src={AZ} className="me-2" style={{ width: 20, height: 20 }} />

            <span
              className="me-2"
              style={{ border: "1px solid #D54343" }}
            ></span>
            <img src={grid} style={{ width: 20, height: 20 }} />
          </div>
        </div>
        {/* <div className="tabsWrapper"> */}
        <div className="tabsWrapper">
          <Tabs defaultActiveKey="1" onChange={setActiveTab}>
            <Tabs.TabPane tab="NFT’s Created" key="1">
              <div className="row">
                {createdNfts?.length > 0 ? (
                  createdNfts?.map((e, i) =>
                    contractData.chain == e?.nft_id?.chainId ? (
                      <CardCompnent
                        key={i}
                        image={imgPaths + e?.nft_id?.user_id?.profileImg}
                        status={e?.nft_id?.status}
                        name={e?.nft_id?.name}
                        artistName={e?.nft_id?.artist_name1}
                        videoLink={e?.nft_id?.video}
                        isEmote={e?.nft_id?.isEmote}
                        rid={e?.nft_id?.rid}
                        bvh={e?.nft_id?.bvh}
                        fbx={e?.nft_id?.fbx}
                        topName
                        userProfile={full_name ? true : false}
                        likeCount={e?.nft_id?.likeCount}
                        watchCount={e?.nft_id?.watchCount}
                        isPaid={e?.nft_id?.isPaid}
                        duration={e?.nft_id?.video_duration}
                        id={e?.nft_id?._id}
                        navigateTo={() =>
                          navigate(`/list-nft/${e?.nft_id?._id}`, {
                            state: {
                              name: e?.nft_id?.name,
                              royalty: e?.nft_id?.royalty,
                              artistName: e?.nft_id?.artist_name1,
                              tokenId: e?.nft_id?.token_id,
                              videoLink: e?.nft_id?.video,
                              nftId: e?.nft_id?._id,
                            },
                          })
                        }
                        isOwner={
                          profileData?.GetProfileDetails?.id === userData?.id
                        }
                      />
                    ) : (
                      ""
                      // <p className="text-white">No results found</p>
                    ),
                  )
                ) : (
                  <p className="text-white">No results found</p>
                )}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="NFT’s Owned"
              key="2"
              className={textColor === "black" ? "ant-light" : ""}
            >
              <div className="row">
                {ownedNfts?.length > 0 ? (
                  ownedNfts
                    .filter(
                      (e) =>
                        !e?.nft_id?.is_blocked &&
                        contractData.chain == e?.nft_id?.chainId,
                    )
                    .map((e) => (
                      <CardCompnent
                        key={e?.nft_id?._id} // Use unique ID instead of index
                        image={`${imgPaths}${e?.nft_id?.user_id?.profileImg}`}
                        status={e?.nft_id?.status}
                        name={e?.nft_id?.name}
                        artistName={e?.nft_id?.artist_name1}
                        videoLink={e?.nft_id?.video}
                        topName
                        userProfile={!!full_name}
                        navigateTo={() =>
                          navigate(`/list-nft/${e?.nft_id?._id}`, {
                            state: {
                              name: e?.nft_id?.name,
                              royalty: e?.nft_id?.royalty,
                              artistName: e?.nft_id?.artist_name1,
                              tokenId: e?.nft_id?.token_id,
                              videoLink: e?.nft_id?.video,
                              nftId: e?.nft_id?._id,
                            },
                          })
                        }
                        isOwner={
                          profileData?.GetProfileDetails?.id === userData?.id
                        }
                      />
                    ))
                ) : (
                  <p className="text-white">No results found</p>
                )}
              </div>
            </Tabs.TabPane>
          </Tabs>
          <div
            className="d-flex gap-4 align-items-center"
            style={{ position: "absolute", left: 1100 }}
          >
            <div className="d-flex gap-2 align-items-center mb-5 pagination-wrapper">
              <Pagination
                total={nfts?.length}
                pageSize={pageSize}
                current={currentPage}
                onChange={handlePageChange}
                itemRender={itemRender}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;
