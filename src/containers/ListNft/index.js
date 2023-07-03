import { Card, Col, Radio, Row, Select } from "antd";
import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { NavbarComponent } from "../../components";
import { IoLogoUsd } from "react-icons/io";
import { BiTimeFive } from "react-icons/bi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsCalendarDate } from "react-icons/bs";
import { Input } from "antd";
import { DatePicker, Space } from "antd";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./css/index.css";
import { test } from "../../assets";
import { useParams, useLocation } from "react-router-dom";
import ConnectModal from "../../components/connectModal";
import { ETHToWei } from "../../utills/convertWeiAndBnb";

const ListNft = () => {
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const dateFormat = "MMM DD, YYYY HH:mm:ss A";
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("fixed Price");
  const [fixedPrice, setFixedPrice] = useState(0);
  const [auctionStartPrice, setAuctionStartPrice] = useState(0);
  const { hash } = useParams();
  const [currency, setCurrency] = useState("USD");
  const [potentialEarning, setPotentialEarning] = useState(0);
  const [connectModal, setConnectModal] = useState(false);

  const {state}= useLocation();

  const { web3, account, signer } = useSelector((state) => state.web3.walletData);
  const {contractData} = useSelector((state) => state.chain.contractData);


  const {name, royalty, artistName} = state;

  console.log(name, royalty, artistName);

  const handleRadioChange = (e) => {
    setSelectedOption(e.target.value);
    setPotentialEarning(0);
    setCurrency("USD");
    setFixedPrice(0);
    setAuctionStartPrice(0);
  };

  const handlePriceChange = (e)=>{
    const value = e.target.value;
    if(selectedOption === "fixed Price"){
      setFixedPrice(value);
      setPotentialEarning(calculateEarning(value, 2.5, royalty));
    }else if(selectedOption === "auction price"){
      setAuctionStartPrice(value);
      setPotentialEarning(calculateEarning(value, 2.5, royalty));
    }
  }

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const border = useSelector((state) => state.app.theme.border);
  const bgColor = useSelector((state) => state.app.theme.bgColor);

  console.log("border", textColor == "black");

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const handleListing= async()=>{
    connectWalletHandle();

    const contractWithsigner = contractData.marketContract.connect(signer);
    const mintContractWithsigner = contractData.mintContract.connect(signer);

    if(selectedOption === "fixed Price"){
      const polygonMintingConract = "0x630656827C8Ceaff3580823a8fD757E298cBfAAf";
      const polygonMarketPlaceContract = "0x96d02fcCaC1aa96432347824D42754b5266B4D6c";
      const amount = ETHToWei(fixedPrice);
      const approveTx = await mintContractWithsigner.setApprovalForAll(polygonMarketPlaceContract, true);
      const resp = await approveTx.wait();
      if(resp){
        const tx = await contractWithsigner.listItemForFixedPrice(0, 5, amount, polygonMintingConract);
        const res = await tx.wait();
        if(res){
          console.log("Listing Successful");
        }
      }else{
        console.log("error");
      }

      console.log("fixed price selected");
    }else if(selectedOption === "auction price"){
      console.log("auction selected");
    }
  };

  const handleCurrency = (value)=>{
    setCurrency(value);
  }

  const calculateEarning =(amount, fee, royalty)=>{
    const totalFee = (Number(fee) + Number(royalty))/100
    const totalFeeAmount = amount * totalFee;
    const earning = amount- totalFeeAmount;
    return earning;
  }

  const selectAfter = (
    <Select defaultValue="USD" onChange={handleCurrency}>
      <Option value="USD">USD</Option>
      <Option value="ETH">ETH</Option>
      <Option value="MATIC">MATIC</Option>
    </Select>
  );

  // const calenderRef = useRef();

  // useEffect(() => {
  //   window.addEventListener("click", clickOutside);
  // }, []);

  // const clickOutside = (e) => {
  //   console.log("eddd", calenderRef?.current.contains(e.target));
  //   if (calenderRef?.current.contains(e.target)) {
  //     setOpen(true);
  //   } else if (!calenderRef?.current?.contains(e.target)) {
  //     setOpen(false);
  //   }
  // };

  
  const closeConnectModel = () => {
    setConnectModal(false);
  };
  const connectWalletHandle = () => {
    if (!web3) {
      setConnectModal(true);
    }
  };

  useEffect(() => {
    if (web3) {
      setConnectModal(false);
    }
  }, [web3]);

  console.log(fixedPrice, auctionStartPrice);

  return (
    
    <div
      className={`${backgroundTheme}`}
      style={{ minHeight: "100vh", overflowX: "hidden" }}
    >
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      <NavbarComponent
        toggleBtn={textColor === "white" ? true : false}
        // selectedKey={"5"}
        headerText={"List NFT"}
      />
      <div className="container py-3">
        <Row style={{ width: "100%" }} className={`d-flex  my-4 p-5`}>
          <Col lg={24} sm={24} xs={24}>
            <Row gutter={{ xs: 8, sm: 16, md: 30, lg: 50 }}>
              <Col lg={6} sm={24} md={12} xs={24}>
                <div className="cardContainer" style={{ width: "100%" }}>
                  <ReactPlayer
                    controls={true}
                    width="260px"
                    height="250px"
                    url={`https://infura-ipfs.io/ipfs/${hash}`}
                  />
                  <div className="d-flex justify-content-between mt-1 px-2">
                    <p className="name">{name}</p>
                    <span className="value">Price</span>
                  </div>
                  <div className="d-flex justify-content-between px-2 pb-3">
                    <p className="name2">{artistName}</p>
                    <span className="value2">4 ETH</span>
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
                    className={textColor == "black" && "radio-light"}
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
              {/* <div className="d-flex text">
                <h4 className={`${textColor}`}>
                  Sort by: &nbsp; &nbsp;
                  <Select
                    defaultValue="US Dollar"
                    style={{
                      width: 120,
                    }}
                    className={textColor == "black" && "ant-light"}
                    onChange={handleChange}
                    options={[
                      {
                        value: "US Dollar",
                        label: "US Dollar",
                      },
                      {
                        value: "Etherum",
                        label: "Etherum",
                      },
                      {
                        value: "Binanace",
                        label: "Binanace",
                      },
                    ]}
                  />
                </h4>
                <div className="cursor" style={{ marginTop: ".4rem" }}>
                  <span
                    className="red-gradient-color"
                    style={{ borderBottom: "1px solid  #CD3C3C" }}
                  >
                    View All
                  </span>
                </div>
              </div> */}
            </div>
            <div
              style={{ width: "100%", marginTop: "1rem" }}
              className={
                textColor == "black" ? "ant-light-input" : "priceinput-field"
              }
            >
              <Input
                className={textColor == "black" && "ant-light"}
                onChange={handlePriceChange}
                // addonBefore={selectBefore}
                addonAfter={selectAfter}
                defaultValue="Amount"
              />
            </div>
            {/* <div className="auction-length">
              <h5 className={`${textColor}`}>Auction Length</h5>
            </div>
            <div
              className={
                textColor == "black" ? "auction-light" : "auction-length-field"
              }
            >
              <div ref={calenderRef}>
                <BsCalendarDate
                  className={`${textColor}`}
                  style={{
                    fontSize: "2rem",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => setOpen(!open)}
                />
              </div>
            </div> */}
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
              <h5 style={{ color: "white" }}>
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
              <p>{fixedPrice} {currency}</p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Service Fee</h5>
              <p>2.5%</p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Creator Fee</h5>
              <p>{royalty}%</p>
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
              <p className={`${textColor}`}> {potentialEarning} {currency}</p>
            </div>
            <div className="btn-wrapper red-gradient">
              <button onClick={handleListing}>COMPLETE LISTING</button>
            </div>
          </>
        )}
        {selectedOption === "auction price" && (
          <>
            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Choose a method <AiOutlineInfoCircle />
              </h5>
              {/* <div className="d-flex text">
                <h4 className={`${textColor}`}>
                  Sort by: &nbsp; &nbsp;
                  <Select
                    defaultValue="US Dollar"
                    style={{
                      width: 120,
                    }}
                    className={textColor == "black" && "ant-light"}
                    onChange={handleChange}
                    options={[
                      {
                        value: "US Dollar",
                        label: "US Dollar",
                      },
                      {
                        value: "Etherum",
                        label: "Etherum",
                      },
                      {
                        value: "Binanace",
                        label: "Binanace",
                      },
                    ]}
                  />
                </h4>
                <div className="cursor" style={{ marginTop: ".4rem" }}>
                  <span
                    className="red-gradient-color"
                    style={{ borderBottom: "1px solid  #CD3C3C" }}
                  >
                    View All
                  </span>
                </div>
              </div> */}
            </div>
            <div
              className={textColor == "black" ? "ant-light-select" : "select"}
            >
              <Select
                defaultValue="lucy"
                style={{
                  width: "100%",
                }}
                className={textColor == "black" && "ant-light"}
                onChange={handleChange}
                options={[
                  {
                    value: "jack",
                    label: "Sell To Highest Bidder",
                  },
                  // {
                  //   value: "lucy",
                  //   label: "Lucy",
                  // },
                  // {
                  //   value: "Yiminghe",
                  //   label: "yiminghe",
                  // },
                ]}
              />
            </div>
            <div className="PriceWrapper  d-flex justify-content-between">
              <h5 className={`${textColor}`}>
                Starting Price <AiOutlineInfoCircle />
              </h5>
              {/* <div className="d-flex text">
                <h4 className={`${textColor}`}>
                  Sort by: &nbsp; &nbsp;
                  <Select
                    defaultValue="US Dollar"
                    style={{
                      width: 120,
                    }}
                    className={textColor == "black" && "ant-light"}
                    onChange={handleChange}
                    options={[
                      {
                        value: "US Dollar",
                        label: "US Dollar",
                      },
                      {
                        value: "Etherum",
                        label: "Etherum",
                      },
                      {
                        value: "Binanace",
                        label: "Binanace",
                      },
                    ]}
                  />
                </h4>
                <div
                  className="cursor"
                  style={{ textDecoration: "underline", marginTop: ".4rem" }}
                >
                  <span className="red-gradient-color">View All</span>
                </div>
              </div> */}
            </div>
            <div
              style={{ width: "100%", marginTop: "1rem" }}
              className={
                textColor == "black" ? "ant-light-input" : "priceinput-field"
              }
            >
              <Input addonAfter={selectAfter} defaultValue="Amount" onChange={handlePriceChange} />
            </div>
            {/* <div className="auction-length">
              <h5 className={`${textColor}`}>Auction Length</h5>
            </div>
            <div
              style={{ width: "100%", marginTop: "1rem" }}
              className={
                textColor == "black" ? "auction-light" : "auction-length-field"
              }
            >
              <div ref={calenderRef}>
                <BsCalendarDate
                  className={`${textColor}`}
                  style={{
                    fontSize: "2rem",
                 
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => setOpen(!open)}
                />

              </div>
            </div> */}
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
              <h5 style={{ color: "white" }}>
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
              <p>{auctionStartPrice} {currency}</p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Service Fee</h5>
              <p>2.5%</p>
            </div>
            <div className="list-wrapper d-flex justify-content-between ">
              <h5>Creator Fee</h5>
              <p>{royalty}%</p>
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
              <p className={`${textColor}`}> {potentialEarning} {currency}</p>
            </div>
            <div className="btn-wrapper red-gradient">
              <button onClick={handleListing}>COMPLETE LISTING</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListNft;
