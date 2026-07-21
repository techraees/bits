import { Col, Radio, Row, Select } from "antd";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { ToastMessage, Loader } from "../../../components";
import { IoLogoUsd } from "react-icons/io";
import { BiTimeFive } from "react-icons/bi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Input } from "antd";
import { DatePicker } from "antd";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./css/index.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ConnectModal from "../../../components/connectModal";
import { ETHToWei } from "../../../utills/convertWeiAndBnb";
import { Form } from "react-bootstrap";
import { timeToTimeStamp } from "../../../utills/timeToTimestamp";
import { loadContractIns } from "../../../store/actions";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import { gql, useMutation } from "@apollo/client";
import {
  ADD_NFT_TO_NFT_MARKET_PLACE,
  CREATE_NEW_TRANSACTION,
} from "../../../gql/mutations";
import { getCookieStorage } from "../../../utills/cookieStorage";
import { useWalletGateFlow } from "../../../hooks/useWalletGateFlow";
const ListNft = () => {
  const { chainId } = useAppKitNetwork();
  const [addNftToMarketPlace, { data, loading, error }] = useMutation(
    ADD_NFT_TO_NFT_MARKET_PLACE,
  );
  const [
    createNewTransation,
    {
      data: transactionData,
      loading: transactionLoading,
      error: transactionError,
    },
  ] = useMutation(CREATE_NEW_TRANSACTION);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("fixed Price");
  const [fixedPrice, setFixedPrice] = useState(0);
  const [fixedPriceCopies, setFixedPriceCopies] = useState(0);
  const [auctionStartPrice, setAuctionStartPrice] = useState(0);
  const [auctionCopies, setAuctionCopies] = useState(0);
  const [potentialEarning, setPotentialEarning] = useState(0);
  const [connectModal, setConnectModal] = useState(false);
  const [endTimeStamp, setEndTimeStamp] = useState(0);
  const [showVal, setShowVal] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { isTargetChainMismatched } = useWalletGateFlow();
  const { userData } = useSelector((state) => state.address.userData);
  const { web3, account, signer } = useSelector(
    (state) => state.web3.walletData,
  );
  const { contractData } = useSelector((state) => state.chain.contractData);
  const [tokens, setTokens] = useState(0);
  const { name, royalty, artistName, tokenId, videoLink, nftId } = state;
  let token = getCookieStorage("access_token");
  const handleEndTimeStamp = (value, dateString) => {
    const time = timeToTimeStamp(dateString);
    setEndTimeStamp(time);
  };
  const handleRadioChange = (e) => {
    setSelectedOption(e.target.value);
    setPotentialEarning(0);
    setFixedPrice(0);
    setAuctionStartPrice(0);
    setShowVal(0);
  };
  const handlePriceChange = (e) => {
    const value = e.target.value;
    const finalVal = value;
    setShowVal(value);
    if (selectedOption === "fixed Price") {
      setFixedPrice(finalVal);
      setPotentialEarning(calculateEarning(value, 2.5, royalty));
    } else if (selectedOption === "auction price") {
      setAuctionStartPrice(finalVal);
      setPotentialEarning(calculateEarning(value, 2.5, royalty));
    }
  };
  const handleCopyChange = (e) => {
    const value = e.target.value;
    if (selectedOption === "fixed Price") {
      setFixedPriceCopies(value);
    } else if (selectedOption === "auction price") {
      setAuctionCopies(value);
    }
  };
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const handleChange = (value) => {};
  useEffect(() => {
    async function getTokens() {
      const data = await contractData.mintContract.balanceOf(
        userData?.address,
        tokenId,
      );
      setTokens(Number(data));
    }
    getTokens();
  }, []);
  const handleListing = async () => {
    let newItemId;
    if (address?.toLowerCase() === userData?.address?.toLowerCase()) {
      const liveMismatch = await isTargetChainMismatched(contractData.chain);
      if (liveMismatch) {
        connectWalletHandle(true);
        return;
      }
      try {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();
        const { chainId } = await provider.getNetwork();
        const { marketContract, mintContract } = contractData;
        const market = marketContract.connect(signer);
        const mint = mintContract.connect(signer);
        const isApproved = await mint.isApprovedForAll(address, market.address);
        if (!isApproved) {
          const approveTx = await mint.setApprovalForAll(market.address, true);
          await approveTx.wait();
        }
        const isAuction = selectedOption === "auction price";
        const price = ETHToWei(isAuction ? auctionStartPrice : fixedPrice);
        const copies = isAuction ? auctionCopies : fixedPriceCopies;
        const eventName = isAuction ? "AuctionStart" : "OfferSale";
        const startTimeStamp = isAuction
          ? Math.floor(Date.now() / 1000) + 150
          : 0;
        const endTimeStampParam = isAuction ? endTimeStamp : 0;
        setLoadingStatus(true);
        setLoadingMessage("Listing...");
        const tx = isAuction
          ? await market.listItemForAuction(
              price,
              startTimeStamp,
              endTimeStampParam,
              tokenId,
              copies,
              mintContract.address,
            )
          : await market.listItemForFixedPrice(
              tokenId,
              copies,
              price,
              mintContract.address,
            );
        const res = await tx.wait();
        const transactionHash = res.transactionHash;
        const event = res.events.find((e) => e.event === eventName);
        if (event) {
          newItemId = Number(event.args[0]);
        } else {
          ToastMessage(`Event not found`, "", "error");
          return;
        }
        if (newItemId) {
          const listingType = isAuction ? "auction" : "fixed_price";
          const start = isAuction ? new Date(startTimeStamp * 1000) : null;
          const end = isAuction ? new Date(endTimeStamp * 1000) : null;
          const response = await addNftToMarketPlace({
            variables: {
              tokenId,
              numberOfCopies: Number(copies),
              price: Number(isAuction ? auctionStartPrice : fixedPrice),
              nftAddress: mintContract.address,
              listingID: newItemId.toString(),
              listingType,
              currency:
                chainId === process.env.REACT_APP_ETH_CHAINID ? "ETH" : "MATIC",
              [isAuction ? "auctionid" : "fixedid"]: newItemId.toString(),
              biddingStartTime: start || 0,
              biddingEndTime: end || 0,
            },
          });
          await createNewTransation({
            variables: {
              first_person_wallet_address: address.toString(),
              nft_id: nftId.toString(),
              amount: Number(isAuction ? auctionStartPrice : fixedPrice),
              currency:
                chainId === process.env.REACT_APP_ETH_CHAINID ? "ETH" : "MATIC",
              copies_transferred: Number(copies),
              transaction_type: "listing_nft",
              token_id: tokenId.toString(),
              chain_id: chainId.toString(),
              blockchain_listingID: newItemId.toString(),
              listingID: response?.data?.addNftToNftMarketPlace?._id,
              hash_field: transactionHash,
            },
          });
        }
        setLoadingStatus(false);
        setLoadingMessage("");
        ToastMessage("Listing Successful", "", "success");
        dispatch(loadContractIns());
        if (isAuction) {
          navigate("/marketplace?tab=auction");
        } else {
          navigate("/marketplace?tab=fixed_price");
        }
      } catch (error) {
        setLoadingStatus(false);
        setLoadingMessage("");
        const parsedError = getParsedEthersError(error);
        ToastMessage("Error", parsedError.context || "Unknown error", "error");
      }
    } else {
      ToastMessage(
        "Error",
        `Profile Wallet Address(${userData?.address}) mismatch with metamask wallet address(${address})`,
        "error",
      );
    }
  };
  const calculateEarning = (amount, fee, royalty) => {
    const totalFee = (Number(fee) + Number(royalty)) / 10000;
    const totalFeeAmount = amount * totalFee;
    const earning = amount - totalFeeAmount;
    return earning;
  };
  const selectAfter = (
    <Select value={contractData.chain === 1 ? "ETH" : "MATIC"}>
      {}
      {}
    </Select>
  );
  const closeConnectModel = () => {
    setConnectModal(false);
  };
  const connectWalletHandle = (forceOpen = false) => {
    const chainMismatch =
      isConnected &&
      chainId != null &&
      Number(chainId) !== Number(contractData?.chain);
    if (forceOpen || !isConnected || chainMismatch) {
      setConnectModal(true);
    }
  };
  useEffect(() => {
    if (isConnected) {
      setConnectModal(false);
    }
  }, [isConnected]);
  return (
    <div
      className={`list-nft-page ${backgroundTheme}`}
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {loadingStatus && <Loader content={loadingMessage} />}
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      {}
      <div className="container py-3">
        <Row
          style={{
            width: "100%",
          }}
          className={"d-flex  my-4 p-5"}
        >
          <Col lg={24} sm={24} xs={24}>
            <Row
              gutter={{
                xs: 8,
                sm: 16,
                md: 30,
                lg: 50,
              }}
            >
              <Col lg={6} sm={24} md={12} xs={24}>
                <div
                  className="cardContainer"
                  style={{
                    width: "100%",
                  }}
                >
                  <ReactPlayer
                    controls={true}
                    width="260px"
                    height="250px"
                    url={videoLink}
                  />
                  <div className="d-flex justify-content-between mt-1 px-2">
                    <p className="name">{name}</p>
                    {}
                  </div>
                  <div className="d-flex justify-content-between px-2 pb-3">
                    <p className="name2">{artistName}</p>
                    {}
                  </div>
                </div>
              </Col>
              <Col lg={18} md={12} xs={24}>
                <div className="my-3">
                  <p className="title">List NFT</p>
                  <span className={`ctext ${textColor}`}>
                    Choose a type of sale
                  </span>
                </div>
                <div className="radio-group">
                  <Radio.Group
                    defaultValue="fixed Price"
                    buttonStyle="solid"
                    className={textColor === "black" && "radio-light"}
                    onChange={handleRadioChange}
                  >
                    <Radio.Button value="fixed Price">
                      <span>
                        <IoLogoUsd />
                      </span>
                      <br />
                      Fixed Price
                    </Radio.Button>
                    <Radio.Button value="auction price">
                      <span>
                        <BiTimeFive />
                      </span>
                      <br />
                      Timed Auction
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        {selectedOption === "fixed Price" && (
          <>
            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Price <AiOutlineInfoCircle />
              </h5>
            </div>
            <div
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
              className={
                textColor === "black" ? "ant-light-input" : "priceinput-field"
              }
            >
              <Input
                className={textColor === "black" && "ant-light"}
                onChange={handlePriceChange}
                addonAfter={selectAfter}
                placeholder="Amount"
                type="number"
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Number Copies To Sell (Available: {tokens})
              </h5>
            </div>
            <div
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
              className={
                textColor === "black" ? "ant-light-input" : "priceinput-field"
              }
            >
              <Form.Control
                type="number"
                id="number"
                aria-describedby="number"
                placeholder="0000"
                min="0"
                onChange={handleCopyChange}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div
              className="option-wrapper d-flex justify-content-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              <h5>More Options</h5>
              <span>
                <RiArrowDropDownLine
                  className={`${textColor}`}
                  style={{
                    color: "white",
                    fontSize: "2.5rem",
                    marginTop: "1.5rem",
                    cursor: "pointer",
                  }}
                />
              </span>
            </div>
            {isOpen && (
              <h5
                style={{
                  color: "white",
                }}
              >
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    disabled
                    style={{
                      cursor: "not-allowed",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <span className={`${textColor}`}>Coming soon</span>
                  </button>
                </div>
              </h5>
            )}
            <div className="summary-wrapper d-flex justify-content-between mt-3">
              <h5 className={`${textColor}`}>Summary</h5>
              <span>
                <AiOutlineInfoCircle
                  className={`${textColor}`}
                  style={{
                    color: "white",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                />
              </span>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Listing Price</h5>
              <p>
                {showVal} {contractData.chain === 1 ? "ETH" : "MATIC"}
              </p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Service Fee</h5>
              <p>2.5%</p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Creator Fee</h5>
              <p>{royalty / 100}%</p>
            </div>
            <div
              style={{
                borderBottom: "1px solid #F7F8F8",
                opacity: "0.4",
                marginTop: "2rem",
              }}
            ></div>
            <div className="footer-text d-flex justify-content-between mt-5">
              <h5>Total Potential Earning</h5>
              <p className={`${textColor}`}>
                {" "}
                {potentialEarning} {contractData.chain === 1 ? "ETH" : "MATIC"}
              </p>
            </div>
            <div
              className="btn-wrapper red-gradient"
              style={
                loadingStatus
                  ? {
                      opacity: 0.6,
                      cursor: "not-allowed",
                      pointerEvents: "none",
                    }
                  : {}
              }
            >
              <button
                onClick={handleListing}
                disabled={loadingStatus}
                style={
                  loadingStatus
                    ? {
                        cursor: "not-allowed",
                      }
                    : {}
                }
              >
                {loadingStatus ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <ClipLoader size={20} color="#fff" />
                    <span>LISTING...</span>
                  </div>
                ) : (
                  "COMPLETE LISTING"
                )}
              </button>
            </div>
          </>
        )}
        {selectedOption === "auction price" && (
          <>
            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Choose a method <AiOutlineInfoCircle />
              </h5>
            </div>
            <div
              className={textColor === "black" ? "ant-light-select" : "select"}
            >
              <Select
                defaultValue="Type of auction"
                style={{
                  width: "100%",
                  color: "white",
                }}
                dropdownStyle={{
                  backgroundColor: "#000",
                  color: "white",
                }}
                className="custom-select-white"
                onChange={handleChange}
                options={[
                  {
                    value: "jack",
                    label: "Sell To Highest Bidder",
                  },
                ]}
              />
            </div>
            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Starting Price <AiOutlineInfoCircle />
              </h5>
            </div>
            <div
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
              className={
                textColor === "black" ? "ant-light-input" : "priceinput-field"
              }
            >
              <Input
                addonAfter={selectAfter}
                placeholder="Amount"
                type="number"
                onChange={handlePriceChange}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <Row
              gutter={{
                xs: 8,
                sm: 16,
                md: 30,
                lg: 50,
              }}
            >
              {}
              <Col lg={12} md={12} xs={24}>
                <div className="PriceWrapper  d-flex justify-content-between">
                  <h5 className={`${textColor}`}>Auction End Time</h5>
                </div>
                <div
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                  }}
                  className={
                    textColor === "black"
                      ? "ant-light-input"
                      : "priceinput-field"
                  }
                >
                  <DatePicker showTime onChange={handleEndTimeStamp} />
                </div>
              </Col>
            </Row>

            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Number Copies To Sell (Available: {tokens})
              </h5>
            </div>
            <div
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
              className={
                textColor === "black" ? "ant-light-input" : "priceinput-field"
              }
            >
              <Form.Control
                type="number"
                id="number"
                aria-describedby="number"
                placeholder="0000"
                min="0"
                onChange={handleCopyChange}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div
              className="option-wrapper d-flex justify-content-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              <h5>More Options</h5>
              <span>
                <RiArrowDropDownLine
                  className={`${textColor}`}
                  style={{
                    color: "white",
                    fontSize: "2.5rem",
                    marginTop: "1.5rem",
                    cursor: "pointer",
                  }}
                />
              </span>
            </div>
            {isOpen && (
              <h5
                style={{
                  color: "white",
                }}
              >
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    disabled
                    style={{
                      cursor: "not-allowed",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <span className={`${textColor}`}>Coming soon</span>
                  </button>
                </div>
              </h5>
            )}

            <div className="summary-wrapper d-flex justify-content-between mt-3">
              <h5 className={`${textColor}`}>Summary</h5>
              <span>
                <AiOutlineInfoCircle
                  className={`${textColor}`}
                  style={{
                    color: "white",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                />
              </span>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Listing Price</h5>
              <p>
                {showVal} {contractData.chain === 1 ? "ETH" : "MATIC"}
              </p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Service Fee</h5>
              <p>2.5%</p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Creator Fee</h5>
              <p>{royalty / 100}%</p>
            </div>
            <div
              style={{
                borderBottom: "1px solid #F7F8F8",
                opacity: "0.4",
                marginTop: "2rem",
              }}
            ></div>
            <div className="footer-text d-flex justify-content-between mt-5">
              <h5>Total Potential Earning</h5>
              <p className={`${textColor}`}>
                {" "}
                {potentialEarning} {contractData.chain === 1 ? "ETH" : "MATIC"}
              </p>
            </div>
            <div
              className="btn-wrapper red-gradient"
              style={
                loadingStatus
                  ? {
                      opacity: 0.6,
                      cursor: "not-allowed",
                      pointerEvents: "none",
                    }
                  : {}
              }
            >
              <button
                onClick={handleListing}
                disabled={loadingStatus}
                style={
                  loadingStatus
                    ? {
                        cursor: "not-allowed",
                      }
                    : {}
                }
              >
                {loadingStatus ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <ClipLoader size={20} color="#fff" />
                    <span>LISTING...</span>
                  </div>
                ) : (
                  "COMPLETE LISTING"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ListNft;
