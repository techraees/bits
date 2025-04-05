import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { right_arrow } from "../../../assets";
import {
  ButtonComponent,
  LabelInput,
  Loader,
  ToastMessage,
} from "../../../components";
import "./css/index.css";
import { Row, Col, Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactPlayer from "react-player";
import {
  CREATE_NFT,
  // MINT_ASSET,
  SEND_EMAIL_MUTATION,
  CREATE_NEW_TRANSACTION,
} from "../../../gql/mutations";
import { GET_PROFILE_DETAILS_QUERY } from "../../../gql/queries";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useFormik } from "formik";
import { mintValidation } from "../../../components/validations";
import ErrorMessage from "../../../components/error";
import ConnectModal from "../../../components/connectModal";
import CreatorEarningModal from "../../../components/creatorEarningModal";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { mintMessage } from "../../../utills/emailMessages";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { getStorage } from "../../../utills/localStorage";

const environment = process.env;

const MintNft = () => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
  );
  const { web3, signer } = useSelector((state) => state.web3.walletData);
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [connectModal, setConnectModal] = useState(false);

  const [creatorEarningModal, setCreatorEarningModal] = useState(false);

  const [splitOwners, setSplitOwners] = useState([]);
  const [splitOwnersPercentage, setSplitOwnersPercentage] = useState([]);

  const { contractData } = useSelector((state) => state.chain.contractData);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  let token = getStorage("token");

  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  // const [mintQuantity, setMintQuantity] = useState(5);
  let navigate = useNavigate();

  const { createNft } = useSelector((state) => state.nft.createNft);

  const [CreateNft, { data, loading, error }] = useMutation(CREATE_NFT);
  const [
    createNewTransation,
    {
      data: transactionData,
      loading: transactionLoading,
      error: transactionError,
    },
  ] = useMutation(CREATE_NEW_TRANSACTION);

  // const [
  // 	mintAsset,
  // 	{ data: mintedData, loading: mintLoading, error: mintError },
  // ] = useMutation(MINT_ASSET);

  const [
    sendEmail,
    // { data: emailData, loading: emailLoading, error: emailError },
  ] = useMutation(SEND_EMAIL_MUTATION);

  const { userData } = useSelector((state) => state.address.userData);

  const [
    getProfile,
    {
      // loading: profileLoadeing,
      // error: profileError,
      data: profileData,
      // refetch,
    },
  ] = useLazyQuery(GET_PROFILE_DETAILS_QUERY, {
    variables: { getProfileDetailsId: userData?.id },
  });

  const address = userData?.address;
  const id = userData?.id;

  useEffect(() => {
    if (userData?.id) {
      getProfile({ variables: userData?.id });
    }
  }, [userData?.id]);

  useEffect(() => {
    const sendMsg = async () => {
      const msgData = mintMessage(
        createNft && createNft.artist_name1,
        createNft && createNft.name
      );

      try {
        const res = await sendEmail({
          variables: {
            to: profileData?.GetProfileDetails?.email,
            from: environment.REACT_APP_EMAIL_OWNER,
            subject: msgData.subject,
            text: msgData.message,
          },
        });

        if (res) {
          console.log("res");
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (data) {
      navigate(`/collections/${userData?.id}`);
      ToastMessage("Minted Successfully", "", "success");
      sendMsg();
    }
    if (error) {
      ToastMessage(error, "", "error");
    }
  }, [data, error]);

  const closeConnectModel = () => {
    setConnectModal(false);
  };
  const connectWalletHandle = () => {
    if (!isConnected) {
      setConnectModal(true);
    }
  };

  const closeCreatorEarningModel = () => {
    setCreatorEarningModal(false);
  };
  const handleSplitOwnership = () => {
    setCreatorEarningModal(true);
  };

  const mintCall = async (supply, royalty) => {
    const provider = new ethers.providers.Web3Provider(walletProvider);
    const signer = provider.getSigner();
    const contractWithsigner = contractData.mintContract.connect(signer);
    const prevTokenId = await contractWithsigner.mintedTokenId();
    try {
      const tx = await contractWithsigner.mint(
        address,
        supply,
        createNft.meta,
        royalty,
        splitOwners,
        splitOwnersPercentage,
        []
      );

      setLoadingStatus(true);
      setLoadingMessage("Minting...");

      const res = await tx.wait();
      if (res) {
        const token_ID = await contractWithsigner.mintedTokenId();
        setLoadingStatus(false);
        setLoadingMessage("");
        if (Number(prevTokenId) < Number(token_ID)) {
          return token_ID;
        } else {
          const newTkId = await contractWithsigner.mintedTokenId();
          return newTkId;
        }
      }
    } catch (error) {
      console.log(error);
      const parsedEthersError = getParsedEthersError(error);
      if (parsedEthersError.context == -32603) {
        ToastMessage("Error", "Insufficient Balance", "error");
      } else {
        ToastMessage("Error", `${parsedEthersError.context}`, "error");
      }
    }
  };

  const {
    handleSubmit,
    // handleChange,
    handleBlur,
    setFieldValue,
    values,
    touched,
    errors,
  } = useFormik({
    initialValues: {
      walletAddress: "",
      supply: 0,
      royalty: "",
      user_id: "",
      metauri: "",
      chainId: 0,
    },
    validate: mintValidation,
    onSubmit: async (values) => {
      connectWalletHandle();
      const tokenid = await mintCall(
        Number(values.supply),
        Number(values.royalty * 100)
      );

      if (Number(tokenid)) {
        CreateNft({
          variables: {
            name: createNft && createNft.name,
            artistName1: createNft && createNft.artist_name1,
            video: createNft && createNft.video,
            metauri: createNft && createNft.meta,
            description: createNft && createNft.description,
            tokenId: `${Number(tokenid)}`,
            chainId: Number(contractData.chain),
            supply: Number(values.supply),
            walletAddress: values.walletAddress,
            status: true,
            isEmote: createNft.isEmote,
            rid:
              createNft && createNft.download.rid
                ? createNft.download.rid
                : "rid",
            royalty: Number(values.royalty * 100),
            isPaid: false,
            video_duration: createNft && createNft.video_duration,
            category: createNft && createNft.category,
            likeCount: 0,
            watchCount: 0,
            user_id: values.id,
          },
        });

        //create transaction
        await createNewTransation({
          variables: {
            token: token,
            first_person_wallet_address: values.walletAddress.toString(),
            nft_id: "",
            amount: 0,
            currency:
              contractData.chain === process.env.REACT_ETH_CHAINID
                ? "ETH"
                : "MATIC",
            copies_transferred: Number(values.supply),
            transaction_type: "create_nft",
            token_id: tokenid.toString(),
            chain_id: contractData.chain.toString(),
          },
        });
      } else {
        console.log("Minting is not gone through");
      }
    },
  });

  useEffect(() => {
    if (address || id) {
      setFieldValue("walletAddress", address);
      setFieldValue("id", id);
    }
  }, [address, id]);

  useEffect(() => {
    if (isConnected) {
      setConnectModal(false);
    }
  }, [isConnected]);

  return (
    <div className={`${backgroundTheme}`} style={{ minHeight: "100vh" }}>
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      <CreatorEarningModal
        isOpen={creatorEarningModal}
        onRequestClose={closeCreatorEarningModel}
        setSplitOwners={setSplitOwners}
        setSplitOwnersPercentage={setSplitOwnersPercentage}
        address={address}
      />
      {loadingStatus && (
        <Loader content={loading ? "Uploading..." : loadingMessage} />
      )}

      <div className="container py-3">
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <img src={right_arrow} />
            <span className={`${textColor2} fs-5 py-3 ms-2`}>NFT Details</span>
          </div>
        </div>
        <Row
          style={{ width: "100%" }}
          className={`d-flex searchStyle ${bgColor} my-4 p-5`}
        >
          <Col lg={14} sm={24} xs={24} className="borderBottom">
            <Row gutter={{ xs: 8, sm: 16, md: 30, lg: 50 }}>
              <Col lg={12} sm={24} md={12} xs={24}>
                <div
                  className="cardContainer mintCardContainer"
                  style={{ width: "100%" }}
                >
                  <ReactPlayer
                    controls={true}
                    width="100%"
                    height={220}
                    url={createNft && createNft.video}
                  />
                </div>
                <div
                  style={{ border: "1px solid  #B23232" }}
                  className="p-1 mt-4 text-center rounded-3"
                >
                  <span className={`${textColor2}`}>
                    View on{" "}
                    {contractData.chain == 1 ? "Etherscan" : "Polygonscan"}
                  </span>
                </div>
              </Col>
              <Col lg={12} sm={24} md={12} xs={24}>
                <div>
                  <div className="my-3">
                    <p className={`${textColor} mb-1 fs-5`}>Name</p>

                    <p className={`${textColor2} m-0 fs-6`}>
                      {createNft && createNft.name}
                    </p>
                    <p className="red fs-6">
                      {createNft ? createNft.artist_name1 : "Snap Boogie"}
                    </p>
                  </div>
                  <div className="my-3">
                    <p className={`${textColor} m-0 fs-5`}>NFT ID</p>
                    <p className={`${textColor2} m-0 fs-6`}>#89832823289</p>
                  </div>
                  <div className="my-3">
                    <div className="d-flex label-input">
                      <p className={`${textColor} m-0 fs-5`}>Royalty%: </p>
                      <span
                        style={{
                          marginTop: "-2.3rem",
                          marginLeft: "1rem",
                        }}
                      >
                        <div>
                          <Input
                            name="royalty"
                            className={"royaltyInputField  me-5"}
                            placeholder={"royalty"}
                            onChange={(e) => {
                              if (e.target.value < 100) {
                                setFieldValue("royalty", e.target.value);
                              } else {
                                ToastMessage(
                                  "Error",
                                  "Royalty should be less than 100",
                                  "error"
                                );
                              }
                            }}
                            onKeyDown={(e) => {
                              if (
                                e.key === "-" ||
                                e.key === "+" ||
                                e.key === "*" ||
                                e.key === "/" ||
                                e.key === "e"
                              ) {
                                e.preventDefault();
                              }
                            }}
                            onWheel={(event) => event.currentTarget.blur()}
                            type="number"
                            value={values.royalty}
                            autoComplete="off"
                          />
                        </div>
                      </span>
                    </div>
                    <ErrorMessage
                      message={
                        touched.royalty && errors.royalty
                          ? errors.royalty
                          : null
                      }
                    />
                  </div>
                  <div
                    style={{
                      border: "1px solid  #B23232",
                      cursor: "pointer",
                    }}
                    className="p-1 mt-5 text-center rounded-3 red-background"
                  >
                    <span
                      className={`${textColor2}`}
                      onClick={handleSplitOwnership}
                    >
                      Split Ownership
                    </span>
                  </div>
                </div>
                <div style={{ borderRight: "1px solid #B23232" }} />
              </Col>
            </Row>
          </Col>
          <Col lg={10} sm={24} xs={24}>
            <div className="supplyView">
              <div className="my-3">
                <p className={`${textColor} mb-1 fs-5`}>Circulating Supply</p>
                <p className={`${textColor2} m-0 fs-6`}>{values.supply}</p>
              </div>
              <div className="my-3">
                <p className={`${textColor} mb-1 fs-5`}>
                  Maximum Total Supply Supply
                </p>
                <p className={`${textColor2} m-0 fs-6`}>{values.supply}</p>
              </div>
              <div className="my-3">
                <p className={`${textColor} mb-1 fs-5`}>Supply Type</p>
                <p className={`${textColor2} m-0 fs-6`}>Non Fungible Token</p>
              </div>
            </div>
            <div
              style={{ border: "1px solid  #B23232" }}
              className="p-1 mt-4 text-center rounded-3"
            >
              <span
                className={`${textColor2}`}
                onClick={() => navigate(`/collections/${userData?.id}`)}
              >
                Go to Collection
              </span>
            </div>
          </Col>
        </Row>
        <div className="d-flex align-items-center">
          <img src={right_arrow} />
          <span className={`${textColor2} fs-5 py-3 ms-2`}>Mint Details</span>
        </div>
        <div style={{ width: "100%" }} className={` ${bgColor} my-4 p-5`}>
          <span className={`${textColor} fs-6 mb-3`}>
            How many NFTs would you like to mint?
          </span>
          <Row>
            {/* <Col
              lg={4}
              md={10}
              sm={12}
              xs={24}
              className="d-flex align-items-center"
            >
              <div
                style={{ border: "1px solid  #B23232", width: 100 }}
                className="p-1 mt-4 text-center rounded-3 d-flex align-items-center justify-content-between"
              >
                <div style={{ width: 80 }}>
                  <span className={`${textColor2}`}>{mintQuantity}</span>
                </div>
                <div className="d-flex flex-column">
                  <img src={count_up_icon} className="mb-1" />
                  <img src={count_down_icon} />
                </div>
              </div>
              <span
                className={`${textColor2}  fs-6 mx-4`}
                style={{ marginBottom: -20 }}
              >
                OR
              </span>
            </Col> */}
            <Col lg={20} md={14} sm={12} xs={24}>
              <Input
                name="supply"
                className={"royaltyInputField  me-5"}
                placeholder={"Enter Quantity To Mint"}
                onChange={(e) => {
                  setFieldValue("supply", e.target.value);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "+" ||
                    e.key === "*" ||
                    e.key === "/" ||
                    e.key === "e"
                  ) {
                    e.preventDefault();
                  }
                }}
                onWheel={(event) => event.currentTarget.blur()}
                type="number"
                value={values.supply}
                autoComplete="off"
              />
              <ErrorMessage
                message={touched.supply && errors.supply ? errors.supply : null}
              />
            </Col>
          </Row>
          <form>
            <LabelInput
              borderColor={"#B23232"}
              placeholder={values?.walletAddress}
              name="walletAddress"
              value={values.walletAddress}
              onChange={(e) => {
                setFieldValue("walletAddress", e.target.value);
              }}
              disabled={true}
              onBlur={handleBlur}
            />
            {/* <ErrorMessage
              message={
                touched.walletAddress && errors.walletAddress
                  ? errors.walletAddress
                  : null
              }
            /> */}
          </form>
          <div className="mt-3">
            <div className="d-flex align-items-center">
              <p className={`${textColor} fs-6 m-0`}>
                Please make sure you have enough cryptocurrency in your wallet
                to cover the gas fees.{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <div className="me-3">
            <Button
              className="px-5 cancelBtn"
              style={{
                backgroundColor: "transparent",
                color: textColor,
              }}
            >
              Cancel
            </Button>
          </div>
          <div className="ms-3">
            <ButtonComponent
              onClick={handleSubmit}
              text={"Mint NFT"}
              width={150}
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNft;
