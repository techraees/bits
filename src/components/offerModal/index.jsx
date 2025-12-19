import { useMutation } from "@apollo/client";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { Modal, Table } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logo } from "../../assets";
import { ToastMessage } from "../../components";
import {
  CREATE_BID_AGAINST_AUCTION_NFT_MARKET_PLACE,
  CREATE_NEW_TRANSACTION,
  UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST,
} from "../../gql/mutations";
import { loadContractIns } from "../../store/actions";
import { ETHToWei } from "../../utills/convertWeiAndBnb";
import { getCookieStorage } from "../../utills/cookieStorage";
import { ETHTOUSD, MATICTOUSD } from "../../utills/currencyConverter";
import { trimWallet } from "../../utills/trimWalletAddr";
import BidModal from "../bidModal";
import ConnectModal from "../connectModal";
import "./css/index.css";

const OfferModal = ({
  name,
  price,
  initialPrice,
  currentBidAmount,
  nftOwner,
  auctionid,
  itemDbId,
  nftId,
  tokenId,
  offers,
}) => {
  auctionid = 1; //--- TEMPORARY FOR TESTING ---
  const dispatch = useDispatch();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const [offerAmount, setOfferAmount] = useState(0);

  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);
  const [connectModal, setConnectModal] = useState(false);

  const [dataSource, setDataSource] = useState([]);

  let token = getCookieStorage("access_token");

  const [create_bid_against_auction] = useMutation(
    CREATE_BID_AGAINST_AUCTION_NFT_MARKET_PLACE,
  );

  const [updateBiddingTime] = useMutation(
    UPDATE_NFT_MARKET_PLACE_BIDDING_TIME_BY_MINTS_FOR_EACH_REQUEST,
  );

  const [createNewTransation] = useMutation(CREATE_NEW_TRANSACTION);

  const { web3, signer } = useSelector((state) => state.web3.walletData);
  const { contractData = {} } = useSelector(
    (state) => state.chain.contractData || {},
  );
  const { userData } = useSelector((state) => state.address.userData);

  const getPriceDiff = (initialPrice, latestprice) => {
    const diff = latestprice - initialPrice;
    const val = diff / initialPrice;
    return Number(val).toFixed(4);
  };

  const handleDropDownClick = () => {
    setIsTableOpen(!isTableOpen);
  };

  const handleCancel = () => {
    setIsBidModalOpen(false);
  };

  const handleConnect = () => {
    connectWalletHandle();
  };

  const handleOffer = (e) => {
    const value = e.target.value;
    setOfferAmount(value);
  };

  useEffect(() => {
    // Fetch ETH and MATIC prices
    const fetchPrices = async () => {
      const [ethPrice, maticPrice] = await Promise.all([
        ETHTOUSD(1),
        MATICTOUSD(1),
      ]);
      setEthBal(ethPrice);
      setMaticBal(maticPrice);
    };

    fetchPrices();
  }, []);

  // Process bids only when contractData, ethBal, and maticBal are available
  useEffect(() => {
    async function getbids() {
      // Skip if contractData.chain is not set or balances are not loaded yet
      if (
        !contractData.chain ||
        (contractData.chain === 1 && !ethBal) ||
        (contractData.chain !== 1 && !maticBal)
      ) {
        return;
      }

      if (offers?.length > 0) {
        const newData = offers.map((item, i) => {
          const priceDiff = getPriceDiff(initialPrice, item?.bid_amount);
          return {
            key: i + 1,
            price: item?.bid_amount,
            uprice: getPrice(item?.bid_amount),
            quantity: "1",
            fdifference: `${priceDiff}% above`,
            expiration: "in 9 days",
            from: "you",
          };
        });
        setDataSource(newData); // Replace instead of appending
      }
    }

    getbids();
  }, [contractData, ethBal, maticBal]); // Add balances as dependencies

  const getPrice = (val) => {
    console.log("val", ethBal, maticBal);
    if (contractData.chain == 1) {
      return Number(val * ethBal).toFixed(4);
    } else {
      return Number(val * maticBal).toFixed(4);
    }
  };

  const columns = [
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "USD Price",
      dataIndex: "uprice",
      key: "uprice",
    },
    // {
    //   title: "Quantity",
    //   dataIndex: "quantity",
    //   key: "quantity",
    // },
    {
      title: "Floor Difference",
      dataIndex: "fdifference",
      key: "fdifference",
    },
    // {
    //   title: "Expiration",
    //   dataIndex: "expiration",
    //   key: "expiration",
    // },
    // {
    //   title: "From",
    //   dataIndex: "from",
    //   key: "from",
    // },
    // {
    //   title: "",
    //   dataIndex: "action",
    //   render: (_, record) => <a>Cancel</a>,
    // },
  ];

  const closeConnectModel = () => {
    setConnectModal(false);
  };
  const connectWalletHandle = () => {
    if (!isConnected) {
      setConnectModal(true);
    }
  };

  const handleBid = async () => {
    if (address?.toLowerCase() === userData?.address?.toLowerCase()) {
      if (contractData.chain == chainId) {
        const provider = new ethers.providers.Web3Provider(walletProvider);
        const signer = provider.getSigner();
        if (offerAmount > 0) {
          const amount = ETHToWei(`${offerAmount}`);
          if (
            signer &&
            (contractData.chain == 1 || contractData.chain == 137)
          ) {
            console.log("contractData", contractData);
            if (!contractData.marketContract) {
              ToastMessage("Error", "Market contract not initialized", "error");
              return;
            }
            const marketContractWithsigner =
              contractData.marketContract.connect(signer);
            try {
              setIsBidModalOpen(true);
              const tx = await marketContractWithsigner.bid(auctionid, {
                value: amount.toString(),
              });
              // if(tx){
              //   setIsBidModalOpen(true);
              // }
              const res = await tx.wait();

              console.log("bid res", res);

              if (res) {
                //saving to bids to DB
                const transactionHash = res.transactionHash;
                try {
                  await create_bid_against_auction({
                    variables: {
                      _id: itemDbId.toString(),
                      price: Number(offerAmount),
                    },
                  });

                  await updateBiddingTime({
                    variables: {
                      nftDbMarketPlaceId: itemDbId.toString(),
                    },
                  });

                  console.log("addd", address, tokenId, itemDbId, auctionid);

                  await createNewTransation({
                    variables: {
                      first_person_wallet_address: address.toString(),
                      nft_id: nftId.toString(),
                      amount: Number(offerAmount),
                      currency:
                        contractData.chain === process.env.REACT_ETH_CHAINID
                          ? "ETH"
                          : "MATIC",
                      transaction_type: "bidding_transaction",
                      token_id: tokenId.toString(),
                      chain_id: contractData.chain.toString(),
                      blockchain_listingID: auctionid.toString(),
                      listingID: itemDbId.toString(),
                      hash_field: transactionHash,
                    },
                  });

                  ToastMessage("Bid Successful", "", "success");
                  dispatch(loadContractIns());
                } catch (error) {
                  console.log(error);
                }
              }
            } catch (error) {
              // console.clear()
              console.log("amount: ", amount.toString());
              // console.log("auctionid: ", auctionid);
              console.log("bid error", error);
              const parsedEthersError = getParsedEthersError(error);
              if (parsedEthersError.context == -32603) {
                ToastMessage("Error", "Insufficient Balance", "error");
              } else {
                console.log(error);
                ToastMessage("Error", `${parsedEthersError.context}`, "error");
              }
            }
          } else {
            handleConnect();
          }
        } else {
          ToastMessage("Error", `Please provide amount`, "error");
        }
      } else {
        const network = contractData?.chain == 137 ? "polygon" : "ethereum";
        ToastMessage(`Please select ${network} network`, "", "error");
      }
    } else {
      ToastMessage(
        "Error",
        `Profile Wallet Address(${userData?.address}) mismatch with metamask wallet address(${address})`,
        "error",
      );
    }
  };

  useEffect(() => {
    if (isConnected) {
      setConnectModal(false);
    }
  }, [isConnected]);

  return (
    <div className="z-12" style={{ zIndex: 1, position: "fixedss" }}>
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      <Modal
        open={isBidModalOpen}
        onCancel={handleCancel}
        footer={false}
        centered
        width={829}
      >
        <BidModal
          handleCancel={handleCancel}
          nftOwner={nftOwner}
          name={name}
          offerAmount={offerAmount}
          amount={
            contractData.chain == 1
              ? (offerAmount * ethBal).toFixed(4)
              : (offerAmount * maticBal).toFixed(4)
          }
          chain={contractData.chain == 1 ? "ETH" : "MATIC"}
        />
      </Modal>
      <div className="main-wrapper">
        <div className="top-title">Place A Bid</div>
        <div className="info">
          <div className="d-flex gap-3 align-items-center">
            <div>
              <img src={logo} width={60} height={60} />
            </div>
            <div>
              <h5>{name}</h5>
              <p>{trimWallet(nftOwner)}</p>
              {/* <p>0xdaF60d937a200b36688e4BfBA68Ef026231570Ef</p> */}
            </div>
          </div>

          <div>
            <h5>
              {initialPrice} {contractData.chain == 1 ? "ETH" : "MATIC"}
            </h5>
            <p>$ {price}</p>
          </div>
        </div>
        <div className="balance-info">
          {/* <div className="d-flex justify-content-between align-items-center">
            <h5>Balance</h5>
            <p>0.001 ETH</p>
          </div> */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <h5>Floor Price</h5>
            <p> $ {price}</p>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <h5>Best Offer</h5>
            <p>$ {currentBidAmount}</p>
          </div>
        </div>

        <div className="drop-down-div" onClick={handleDropDownClick}>
          <div className="d-flex justify-content-between">
            <h5>Offers</h5>
            {isTableOpen ? (
              <MdOutlineKeyboardArrowUp color="#ffffff" fontSize={20} />
            ) : (
              <MdOutlineKeyboardArrowDown color="#ffffff" fontSize={20} />
            )}
          </div>
        </div>

        <div className="table-div">
          {isTableOpen && (
            <Table
              dataSource={dataSource}
              columns={columns}
              scroll={{ x: 100 }}
            />
          )}
        </div>

        <div className="input-field-div">
          <input type="text" placeholder="0.001" onChange={handleOffer} />
          <h5>{contractData.chain == 1 ? "ETH" : "MATIC"}</h5>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <p>
            ${" "}
            {contractData.chain == 1
              ? (offerAmount * ethBal).toFixed(4)
              : (offerAmount * maticBal).toFixed(4)}{" "}
            Total
          </p>
          <p>
            Total Offer amount: {offerAmount}{" "}
            {contractData.chain == 1 ? "ETH" : "MATIC"} (${" "}
            {contractData.chain == 1
              ? (offerAmount * ethBal).toFixed(4)
              : (offerAmount * maticBal).toFixed(4)}
            )
          </p>
        </div>
        <div>
          <button
            className="bid-btn"
            onClick={isConnected ? handleBid : handleConnect}
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;
