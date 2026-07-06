import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { right_arrow } from "../../../assets";
import {
  ButtonComponent,
  LabelInput,
  Loader,
  ToastMessage,
} from "../../../components";
import "./css/index.css";
import { Row, Col, Button, Input, Tooltip } from "antd";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
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
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import { getCookieStorage } from "../../../utills/cookieStorage";
import ReCAPTCHA from "react-google-recaptcha";

const environment = process.env;

// Reads the minted token id straight from the transaction receipt instead of
// issuing an extra `mintedTokenId()` RPC call after `tx.wait()`. That second
// call went through the WalletConnect-backed signer provider, which iOS
// Safari can suspend/kill when the user switches back from the MetaMask app,
// causing the mint to succeed on-chain while the backend registration step
// never runs.
const getMintedTokenIdFromReceipt = (receipt, contract) => {
  const contractAddress = contract.address?.toLowerCase();
  const logsForContract = receipt.logs.filter(
    (log) => log.address?.toLowerCase() === contractAddress,
  );

  for (const eventName of ["Mint", "TransferSingle"]) {
    for (const log of logsForContract) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === eventName) {
          return eventName === "Mint"
            ? parsedLog.args.tokenId
            : parsedLog.args.id;
        }
      } catch (err) {
        // Log does not match this contract's ABI (e.g. an approval event
        // from another contract in the same tx) - safe to ignore.
      }
    }
  }

  return null;
};

const MintNft = () => {
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const { web3, signer } = useSelector((state) => state.web3.walletData);
  const { chainId } = useAppKitNetwork();
  const { isConnected, address: metamaskAddress } = useAppKitAccount();

  const { walletProvider } = useAppKitProvider("eip155");

  const [connectModal, setConnectModal] = useState(false);

  const [creatorEarningModal, setCreatorEarningModal] = useState(false);

  const [splitOwners, setSplitOwners] = useState([]);
  const [splitOwnersPercentage, setSplitOwnersPercentage] = useState([]);

  const { contractData } = useSelector((state) => state.chain.contractData);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  let token = getCookieStorage("access_token");

  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const bgColor = useSelector((state) => state.app.theme.bgColor);
  // const [mintQuantity, setMintQuantity] = useState(5);
  let navigate = useNavigate();

  const { createNft } = useSelector((state) => state.nft.createNft);
  // console.log(createNft, "Creating the New NFT");
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
  ] = useLazyQuery(GET_PROFILE_DETAILS_QUERY, {});

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
        createNft && createNft.name,
      );

      try {
        const toEmail = profileData?.GetProfileDetails?.email;
        const fromEmail = environment.REACT_APP_EMAIL_OWNER;
        const subject = msgData.subject;
        const text = msgData.message;

        if (!toEmail || !fromEmail || !subject || !text || !recaptchaToken) {
          return;
        }

        const res = await sendEmail({
          variables: {
            to: toEmail,
            from: fromEmail,
            subject: subject,
            text: text,
            recaptchaToken: recaptchaToken,
          },
        });

        if (res) {
          // console.log("res");
        }
      } catch (error) {
        // console.log(error);
      }
    };

    if (data) {
      navigate(`/collections/${userData?.id}`);
      ToastMessage("Minted Successfully", "", "success");
      sendMsg();
    }
    if (error) {
      ToastMessage("Error", error.message || "Failed to save NFT", "error");
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
    if (!isConnected) {
      ToastMessage(
        "Error",
        `Please Connect Meta mask with site first`,
        "error",
      );
      return;
    }

    if (!metamaskAddress) {
      ToastMessage(
        "Error",
        `AppKitAccount Wallet Address Not Found` + (metamaskAddress || "."),
        "error",
      );
      return;
    }

    if (metamaskAddress?.toLowerCase() !== userData?.address?.toLowerCase()) {
      ToastMessage(
        "Error",
        `Profile Wallet Address(${userData?.address}) mismatch with metamask wallet address(${metamaskAddress})`,
        "error",
      );
      return;
    }

    if (contractData.chain != chainId) {
      const network = contractData?.chain == 137 ? "polygon" : "ethereum";
      ToastMessage(`Please select ${network} network`, "", "error");
      return;
    }

    const walletSignerProvider = new ethers.providers.Web3Provider(
      walletProvider,
    );
    const signer = walletSignerProvider.getSigner();
    const contractWithsigner = contractData.mintContract.connect(signer);

    // Stable, Infura-backed provider (created in loadContractIns) used only
    // to wait for and read the transaction receipt. Signing still happens
    // through WalletConnect, but confirmation no longer depends on that
    // session staying alive after the user returns from the MetaMask app.
    const readOnlyProvider = contractData.mintContract.provider;

    let tx;
    try {
      tx = await contractWithsigner.mint(
        address,
        supply,
        createNft.meta,
        royalty,
        splitOwners,
        splitOwnersPercentage,
        [],
      );
    } catch (error) {
      const parsedEthersError = getParsedEthersError(error);
      ToastMessage(
        "Error",
        parsedEthersError.context == -32603
          ? "Insufficient Balance"
          : `${parsedEthersError.errorCode || parsedEthersError.context || "Transaction was not signed"}`,
        "error",
      );
      throw error;
    }

    setLoadingStatus(true);
    setLoadingMessage("Minting...");

    try {
      // 5 minute timeout so the UI never hangs indefinitely if something
      // goes wrong on the RPC side - the user still gets the tx hash in the
      // error message and can check it on the explorer.
      const receipt = await readOnlyProvider.waitForTransaction(
        tx.hash,
        1,
        5 * 60 * 1000,
      );

      if (receipt.status === 0) {
        throw new Error(`Transaction ${receipt.transactionHash} was reverted`);
      }

      const transactionHash = receipt.transactionHash;
      const newTkId = getMintedTokenIdFromReceipt(receipt, contractWithsigner);

      if (!newTkId) {
        throw new Error(
          `Mint transaction confirmed (${transactionHash}) but token id could not be read from the receipt`,
        );
      }

      return { newTkId, transactionHash };
    } catch (error) {
      const parsedEthersError = getParsedEthersError(error);
      ToastMessage(
        "Error",
        parsedEthersError.context == -32603
          ? "Insufficient Balance"
          : `${parsedEthersError.errorCode || parsedEthersError.context || error.message}`,
        "error",
      );
      throw error;
    } finally {
      setLoadingStatus(false);
      setLoadingMessage("");
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

      if (!isConnected) {
        return;
      }

      let mintResult;
      try {
        mintResult = await mintCall(
          Number(values.supply),
          Number(values.royalty * 100),
        );
      } catch (error) {
        // Toast already shown inside mintCall - stop here so a failed or
        // unconfirmed transaction never silently falls through to the
        // backend registration step below.
        return;
      }

      const { newTkId, transactionHash } = mintResult || {};

      if (!Number(newTkId)) {
        return;
      }

      try {
        const nftResponse = await CreateNft({
          variables: {
            name: createNft && createNft.name,
            artistName1: createNft && createNft.artist_name1,
            video: createNft && createNft.video,
            metauri: createNft && createNft.meta,
            description: createNft && createNft.description,
            tokenId: `${Number(newTkId)}`,
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
          },
        });

        const createdNftId = nftResponse?.data?.CreateNft?._id || "";

        //create transaction
        await createNewTransation({
          variables: {
            first_person_wallet_address: values.walletAddress.toString(),
            nft_id: createdNftId,
            amount: 0,
            currency:
              contractData.chain === process.env.REACT_ETH_CHAINID
                ? "ETH"
                : "MATIC",
            copies_transferred: Number(values.supply),
            transaction_type: "create_nft",
            token_id: newTkId.toString(),
            chain_id: contractData.chain.toString(),
            hash_field: transactionHash,
          },
        });
      } catch (error) {
        // The NFT was minted on-chain successfully, but saving it to the
        // backend failed. Surface the transaction hash so the user (or
        // support) can reconcile it instead of the mint appearing to
        // silently disappear.
        ToastMessage(
          "Error",
          `Your NFT was minted on-chain, but we couldn't save it to your account. Please contact support with this transaction hash: ${transactionHash}`,
          "error",
        );
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

  // Pre-mint completion checklist - lets the user see at a glance what's
  // still missing instead of only finding out after clicking Mint and
  // reading inline field errors one at a time.
  const isSupplyReady = Number(values.supply) > 0;
  const isRoyaltyReady =
    values.royalty !== "" &&
    !Number.isNaN(Number(values.royalty)) &&
    Number(values.royalty) >= 0 &&
    Number(values.royalty) <= 100;
  const isWalletReady = isConnected;
  const isMintReady = isSupplyReady && isRoyaltyReady && isWalletReady;

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

      <div className="container py-3 mint-nft-page">
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <img src={right_arrow} />
            <span className={`${textColor2} fs-5 py-3 ms-2`}>NFT Details</span>
          </div>
        </div>
        <div className={`searchStyle mint-nft-card ${bgColor} my-4 p-5`}>
          <Row style={{ width: "100%" }} className="mint-nft-main-row">
            <Col lg={14} sm={24} xs={24} className="borderBottom">
              <Row
                className="mint-nft-inner-row"
                gutter={{ xs: 0, sm: 0, md: 30, lg: 50 }}
              >
                <Col lg={12} sm={24} md={12} xs={24}>
                  <div
                    className="cardContainer mintCardContainer mint-nft-player"
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
                      <div className="d-flex align-items-center label-input royalty-row">
                        <p className={`${textColor} m-0 fs-5 royalty-label`}>
                          Royalty% <span className="red">*</span>
                          <Tooltip title="The percentage you'll earn every time this NFT is resold on the marketplace. Enter a value between 0 and 100.">
                            <span>
                              {" "}
                              <AiOutlineInfoCircle style={{ cursor: "help" }} />
                            </span>
                          </Tooltip>
                          :
                        </p>
                        <div className="royalty-input-wrap">
                          <Input
                            name="royalty"
                            className={"royaltyInputField"}
                            placeholder={"royalty"}
                            onChange={(e) => {
                              if (e.target.value < 101) {
                                setFieldValue("royalty", e.target.value);
                              } else {
                                ToastMessage(
                                  "Error",
                                  "Royalty should be less than 100",
                                  "error",
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
                    Maximum Total Supply
                  </p>
                  <p className={`${textColor2} m-0 fs-6`}>{values.supply}</p>
                </div>
                <div className="my-3">
                  <p className={`${textColor} mb-1 fs-5`}>Supply Type</p>
                  <p className={`${textColor2} m-0 fs-6`}>Non Fungible Token</p>
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
              </div>
            </Col>
          </Row>
          <Row
            style={{ width: "100%" }}
            className="d-grid mint-nft-description"
          >
            <hr />
            <div>
              <p className={`${textColor} m-0 fs-5`}>Description</p>
            </div>
            <div className={`${textColor2} m-0 fs-6`}>
              {createNft && createNft.description}
            </div>
          </Row>
        </div>

        <div className="d-flex align-items-center">
          <img src={right_arrow} />
          <span className={`${textColor2} fs-5 py-3 ms-2`}>Mint Details</span>
        </div>
        <div
          style={{ width: "100%" }}
          className={`searchStyle mint-nft-card ${bgColor} my-4 p-5`}
        >
          <span className={`${textColor} fs-6 mb-3`}>
            How many NFTs would you like to mint? <span className="red">*</span>
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
                className={"royaltyInputField mint-nft-supply-input"}
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
        <div className="mint-checklist mb-3">
          <p className={`${textColor} fs-6 mb-2`}>Before you mint:</p>
          <ul className="mint-checklist__list">
            <li
              className={`mint-checklist__item ${
                isSupplyReady ? "mint-checklist__item--done" : ""
              }`}
            >
              <FaCheckCircle className="mint-checklist__icon" size={14} />
              <span>Circulating supply entered</span>
            </li>
            <li
              className={`mint-checklist__item ${
                isRoyaltyReady ? "mint-checklist__item--done" : ""
              }`}
            >
              <FaCheckCircle className="mint-checklist__icon" size={14} />
              <span>Royalty percentage set (0-100%)</span>
            </li>
            <li
              className={`mint-checklist__item ${
                isWalletReady ? "mint-checklist__item--done" : ""
              }`}
            >
              <FaCheckCircle className="mint-checklist__icon" size={14} />
              <span>Wallet connected</span>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center justify-content-center mint-nft-actions">
          <div className="mint-nft-action-btn">
            <Button
              className="px-5 cancelBtn"
              style={{
                backgroundColor: "transparent",
                color: textColor,
              }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
          <div className="mint-nft-action-btn">
            <div
              className={!isMintReady ? "mint-btn-disabled" : ""}
              title={
                !isMintReady
                  ? "Complete the checklist above before minting"
                  : undefined
              }
            >
              <ButtonComponent
                onClick={handleSubmit}
                text={"Mint NFT"}
                width={150}
                height={40}
              />
            </div>
          </div>

          <div className="mint-nft-recaptcha">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCH_SITE_KEY}
              onChange={(t) => setRecaptchaToken(t)}
              onExpired={() => setRecaptchaToken(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNft;
