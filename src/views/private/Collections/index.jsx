import { useQuery } from "@apollo/client";
import { Col, Input, Pagination, Row, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  AZ,
  ellipse,
  grid,
  location,
  location_dark,
  search,
  upload,
  upload_red,
} from "../../../assets";
import profileimg from "../../../assets/images/profile1.svg";
import {
  ButtonComponent,
  CardCompnent,
  UploadVideoModal,
} from "../../../components";
import {
  Get_MY_NFTS_THAT_I_OWNED,
  GET_PROFILE_DETAILS_QUERY,
} from "../../../gql/queries";
import "./css/index.css";
// import { MINT_ASSET_MUTATION } from "../../../gql/mutations";
// import { USDTOETH } from "../../../utills/currencyConverter";
import { getAllNftsByAddressAlchemy } from "../../../config/infura";
import { getCookieStorage } from "../../../utills/cookieStorage";
import CardSkeletal from "../../public/Dashboard/Skeletal/CardSkeletal";

const environment = process.env;

const Collections = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("1");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchString, setSearchString] = useState("");

  const { data: profileData, loading: profileLoading } = useQuery(
    GET_PROFILE_DETAILS_QUERY,
  );

  let token = getCookieStorage("access_token");
  const { contractData } = useSelector((state) => state.chain.contractData);

  const { data: getAllNftIOwnedData, loading: getAllNftIOwnedLoading } =
    useQuery(Get_MY_NFTS_THAT_I_OWNED, {
      variables: {
        ownership_type: activeTab === "1" ? "created" : "owned",
        page: currentPage,
        limit: pageSize,
        q: searchString,
        chainId: contractData?.chain?.toString(),
      },
    });

  console.log(getAllNftIOwnedData, "ASDASDADSASDASDASD");

  const { userData } = useSelector((state) => state.address.userData);
  const [tokenIdsByOwner, setTokenIdsByOwner] = useState([]);

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

  const { textColor, textColor2, textColor3, bgColor, backgroundTheme } =
    useSelector((state) => state.app.theme);

  const [uploadVideoModal, setUploadVideoModal] = useState(false);
  let navigate = useNavigate();

  const imgPath =
    environment.REACT_APP_BACKEND_BASE_URL +
    "/" +
    profileData?.GetProfileDetails?.profileImg;
  const imgPaths = environment.REACT_APP_BACKEND_BASE_URL + "/";

  const handlePageChange = (page) => {
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
    <div className={`${backgroundTheme}`} style={{ minHeight: "100vh" }}>
      <UploadVideoModal
        visible={uploadVideoModal}
        onClose={() => setUploadVideoModal(false)}
      />

      <div className="container ">
        <Row className="my-5">
          <Col lg={12} md={24} sm={24} xs={24}>
            <div className="d-flex justify-content-center my-3 align-items-center flex-wrap">
              <div
                className=" d-flex justify-content-center align-items-center"
                style={{
                  position: "relative",
                  width: "150px",
                  height: "150px",
                }}
              >
                {profileData?.GetProfileDetails?.profileImg ? (
                  <img
                    alt="dp"
                    src={imgPath}
                    width={150}
                    onError={(e) => {
                      e.target.src = profileimg;
                    }}
                    style={{ borderRadius: "50%" }}
                    className="my-2 mb-4 "
                  />
                ) : (
                  <img
                    alt="dp"
                    src={profileimg}
                    style={{ borderRadius: "50%" }}
                    width={150}
                    className="my-2 mb-4 "
                  />
                )}

                <div
                  className="circle_ring_icon_abs"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "150px",
                    height: "150px",
                  }}
                >
                  <img
                    alt="ellipse"
                    src={ellipse}
                    style={{
                      borderRadius: "50%",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              </div>

              <div className="ms-3 no_margin pt-2">
                <h3 className="red-gradient-color semi-bold">
                  {profileData?.GetProfileDetails?.full_name}
                </h3>
                {profileData?.GetProfileDetails?.country && (
                  <div className="d-flex mb-1 ms-5">
                    <h5 className={`m-0 ${textColor}`}>
                      {profileData?.GetProfileDetails?.country}
                    </h5>
                    <img
                      className="ms-2"
                      alt="location"
                      src={textColor === "white" ? location : location_dark}
                    />
                  </div>
                )}

                <span className={`ms-5 ${textColor2}`}>
                  {profileData?.GetProfileDetails?.bio}
                </span>
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
              onChange={(e) => {
                setSearchString(e.target.value);
              }}
            />

            <img className="me-3 cursor" style={{ width: 15 }} src={search} />
          </div>
          <div
            className={`d-flex ms-3 p-2 ${bgColor}`}
            style={{ borderRadius: 20 }}
            onClick={() => {}}
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
        <div className="" style={{ position: "relative" }}>
          <div className="tabsWrapper ">
            <Tabs defaultActiveKey="1" onChange={setActiveTab}>
              <Tabs.TabPane tab="NFT’s Created" key="1">
                <div className="row mt-5 mt-sm-5 p-4 p-md-0">
                  {getAllNftIOwnedLoading ? (
                    <CardSkeletal />
                  ) : getAllNftIOwnedData?.getMyNftsThatIOwned?.data?.length >
                    0 ? (
                    getAllNftIOwnedData?.getMyNftsThatIOwned?.data?.map(
                      (e, i) => (
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
                          detailBtn={true}
                          topName
                          userProfile={
                            profileData?.GetProfileDetails?.full_name
                              ? true
                              : false
                          }
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
                  {getAllNftIOwnedData?.getMyNftsThatIOwned?.data?.length >
                  0 ? (
                    getAllNftIOwnedData?.getMyNftsThatIOwned?.data?.map((e) => (
                      <CardCompnent
                        key={e?.nft_id?._id} // Use unique ID instead of index
                        image={`${imgPaths}${e?.nft_id?.user_id?.profileImg}`}
                        status={e?.nft_id?.status}
                        name={e?.nft_id?.name}
                        artistName={e?.nft_id?.artist_name1}
                        videoLink={e?.nft_id?.video}
                        topName
                        userProfile={
                          !!profileData?.GetProfileDetails?.full_name
                        }
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
              className="d-flex gap-4 align-items-center pagination-postion"
              style={{ position: "absolute", right: 0 }}
            >
              <div className="d-flex gap-2 align-items-center mb-5 pagination-wrapper">
                <Pagination
                  total={getAllNftIOwnedData?.getMyNftsThatIOwned?.totalItems}
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
    </div>
  );
};

export default Collections;
