import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TopNftPopupPagination from "./TopNftPopupPagination";
import RedCrossIcon from "./redCross.svg";
import GreenTick from "./GreenTick.svg";
import DecrementButtonArr from "./DecrementButtonArr.svg";
import IncrementButtonArr from "./IncrementButtonArr.svg";
import { Modal } from "antd";
import { useSelector, useDispatch } from "react-redux";
import BidModal from "../bidModal";
import ConnectModal from "../connectModal";
import ButtonComponent from "../button";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_PROFILE_DETAILS_QUERY } from "../../gql/queries";
import {
  SEND_EMAIL_MUTATION,
  CREATE_NEW_OWNERSHIP_OF_NFT,
  CREATE_NEW_TRANSACTION,
} from "../../gql/mutations";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { Loader, ToastMessage } from "../../components";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { trimWallet } from "../../utills/trimWalletAddr";
import { ETHTOUSD, MATICTOUSD } from "../../utills/currencyConverter";
import { getStorage } from "../../utills/localStorage";
import { ETHToWei } from "../../utills/convertWeiAndBnb";
import { boughtMessage } from "../../utills/emailMessages";
import { loadContractIns } from "../../store/actions";

const environment = process.env;

const TopNftAddQuantiyPurchaseInputBodySection = ({
  setIsFixedPriceStep,
  fixedData,
  itemData,
  onRequestClose,
  setIsAuctionStep,
}) => {
  const dispatch = useDispatch();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { contractData } = useSelector((state) => state.chain.contractData);
  const [activeButton, settActiveButton] = useState(false);

  const [connectModal, setConnectModal] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);

  const [quantity, setQuantity] = useState(1);

  ETHTOUSD(1).then((result) => {
    setEthBal(result);
  });

  MATICTOUSD(1).then((result) => {
    setMaticBal(result);
  });

  const increment = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
  };

  const decrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); // Prevent less than 1
  };

  let token = getStorage("token");

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

  const [
    sendEmail,
    // { data: emailData, loading: emailLoading, error: emailError },
  ] = useMutation(SEND_EMAIL_MUTATION);

  const [createNewNftOwnership] = useMutation(CREATE_NEW_OWNERSHIP_OF_NFT);
  const [createNewTransation] = useMutation(CREATE_NEW_TRANSACTION);

  const closeConnectModel = () => {
    setConnectModal(false);
  };

  const connectWalletHandle = () => {
    if (!isConnected) {
      setConnectModal(true);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      getProfile({ variables: userData?.id });
    }
  }, [userData?.id]);

  useEffect(() => {
    if (isConnected) {
      setConnectModal(false);
    }
  }, [isConnected]);

  const handlePurchase = async () => {
    const provider = new ethers.providers.Web3Provider(walletProvider);
    const signer = provider.getSigner();
    const totalcost = Number(quantity * itemData?.price);
    const amount = ETHToWei(totalcost.toString()).toString();
    setLoadingStatus(true);

    if (!signer || quantity <= 0) {
      connectWalletHandle();
      return;
    }

    const marketContractWithSigner =
      contractData.marketContract.connect(signer);

    try {
      const tx = await marketContractWithSigner.BuyFixedPriceItem(
        itemData?.auctionId,
        quantity,
        { value: amount }
      );
      setLoadingMessage("Transaction Pending...");

      const res = await tx.wait();
      if (!res) throw new Error("Transaction failed");

      const transactionVariables = {
        token,
        nft_id: itemData?.nftId?.toString(),
        amount: Number(totalcost),
        currency:
          contractData.chain === process.env.REACT_ETH_CHAINID
            ? "ETH"
            : "MATIC",
        token_id: itemData?.tokenId?.toString(),
        chain_id: contractData.chain.toString(),
        blockchain_listingID: itemData?.itemDbId?.toString(),
      };

      await createNewNftOwnership({
        variables: {
          ...transactionVariables,
          total_price: Number(totalcost),
          listingIDFromBlockChain: itemData?.auctionId?.toString(),
          listingID: itemData?.itemDbId?.toString(),
          copies: Number(quantity),
          pricePerItem: Number(totalcost),
          from_user_wallet: itemData?.nftOwner?.toString(),
          to_user_wallet: address?.toString(),
        },
      });

      await Promise.all([
        createNewTransation({
          variables: {
            ...transactionVariables,
            first_person_wallet_address: address?.toString(),
            second_person_wallet_address: itemData?.nftOwner?.toString(),
            transaction_type: "buying_nft",
            copies_transferred: Number(quantity),
            listingID: itemData?.itemDbId?.toString(),
          },
        }),

        createNewTransation({
          variables: {
            ...transactionVariables,
            first_person_wallet_address: itemData?.nftOwner?.toString(),
            second_person_wallet_address: address?.toString(),
            transaction_type: "selling_nft",
            copies_transferred: Number(quantity),
            listingID: itemData?.itemDbId?.toString(),
          },
        }),
      ]);

      const msgData = boughtMessage(
        userData?.full_name,
        itemData?.name,
        itemData?.name,
        totalcost
      );

      await sendEmail({
        variables: {
          to: profileData?.GetProfileDetails?.email,
          from: environment.REACT_APP_EMAIL_OWNER,
          subject: msgData.subject,
          text: msgData.message,
        },
      });

      setLoadingStatus(false);
      setLoadingMessage("");
      ToastMessage("Purchase Successful", "", "success");
      dispatch(loadContractIns());
    } catch (error) {
      console.error("Error in purchase", error);
      setLoadingStatus(false);
      const parsedEthersError = getParsedEthersError(error);
      const errorMessage =
        parsedEthersError.context === -32603
          ? "Insufficient Balance"
          : parsedEthersError.context;
      ToastMessage("Error", errorMessage, "error");
    }
  };

  return (
    <>
      {loadingStatus && <Loader content={loadingMessage} />}
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />

      <div className="Nunito_font_family d-flex flex-column justify-content-center align-items-center">
        <div className="down_side_popup lg:p-4 p-3 bg-white">
          {/* Card */}
          <div className=" custom-card shadow-move">
            <div className="card-body position-relative">
              {/* Cross Button */}
              <div className="cross_icon_red">
                <img
                  onClick={() => {
                    if (!activeButton) {
                      settActiveButton(false);
                      setIsFixedPriceStep(1);
                    } else {
                      settActiveButton(false);
                      setIsFixedPriceStep(2);
                    }
                  }}
                  src={RedCrossIcon}
                  alt=""
                  className="w-full h-full"
                />
              </div>
              <div className="">
                <div className="">
                  <div
                    className="d-flex align-items-center"
                    style={{
                      width: "100%",
                    }}
                  >
                    <img
                      src="https://plus.unsplash.com/premium_photo-1686727103139-2824d4fa46a3?q=80&w=3327&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      className="rounded-circle img_quantity_top_nft mr-3"
                      alt="Profile Image"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                    <div
                      className="heading_data"
                      style={{
                        width: "90%",
                      }}
                    >
                      <div className="heading_data_name">
                        <div>{itemData?.name}</div>
                        <div className="green_tick_button">
                          <img
                            src={GreenTick}
                            alt=""
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                      <p className="">From {trimWallet(itemData?.nftOwner)}</p>
                    </div>
                  </div>

                  <div></div>
                </div>
              </div>

              <div className="input_go_button_parent">
                {!activeButton ? (
                  <>
                    <div className="input_go_button_parent__input_div">
                      <div className="input_go_button_parent__input_div__parent">
                        <p className="input_go_button_parent__input_div__p">
                          Select Quantity
                        </p>
                        <span className="input_go_button_parent__input_div__p">
                          {quantity}
                        </span>
                      </div>

                      <div className="increment_decrement_button">
                        <div
                          className="increment_decrement_button__increment"
                          onClick={increment}
                        >
                          <img
                            className="w-full"
                            src={IncrementButtonArr}
                            alt=""
                          />
                        </div>
                        <div
                          className="increment_decrement_button__increment"
                          onClick={decrement}
                        >
                          <img
                            className="w-full"
                            src={DecrementButtonArr}
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="input_go_button_parent__input_div">
                      <div className="input_go_button_parent__input_div__parent_full">
                        <p className="input_go_button_parent__input_div__p">
                          Total Price
                        </p>
                        <div className="line_vertical"></div>
                        <p>
                          {quantity * itemData?.price}{" "}
                          <span className="price_tag_currency">
                            {itemData?.chainId == 137 ? "MATIC" : "ETH"} ( $
                            {Number(
                              quantity *
                                itemData?.price *
                                (itemData?.chainId == 137 ? maticBal : ethBal)
                            ).toFixed(6)}
                            ){" "}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {!activeButton && (
                  <div>
                    <button
                      className="go_button"
                      onClick={() => {
                        settActiveButton(true);
                        setIsFixedPriceStep(3);
                      }}
                    >
                      GO
                    </button>
                  </div>
                )}
              </div>

              {!activeButton ? (
                <div className="total-price mt-3">
                  <div className="total_price_data">
                    <p>Total Price:</p>
                    <p>
                      {quantity * itemData?.price}{" "}
                      <span className="price_tag_currency">
                        {itemData?.chainId == 137 ? "MATIC" : "ETH"} ( $
                        {Number(
                          quantity *
                            itemData?.price *
                            (itemData?.chainId == 137 ? maticBal : ethBal)
                        ).toFixed(6)}
                        ){" "}
                      </span>
                    </p>
                  </div>
                  <p>
                    <span className="font-weight-bold">
                      1 {itemData?.chainId == 137 ? "MATIC" : "ETH"}
                    </span>{" "}
                    =
                    <strong>
                      {itemData?.chainId == 137 ? maticBal : ethBal}{" "}
                    </strong>
                  </p>
                </div>
              ) : (
                <div
                  className="connect_wallet_button__parent"
                  onClick={() => {
                    setIsFixedPriceStep(3);
                    if (isConnected) {
                      handlePurchase();
                    }
                    connectWalletHandle();
                  }}
                >
                  <button className="connect_wallet_button theme_gradient_red">
                    {isConnected ? "BuyNow" : "Connect Wallet"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4 close_button">
            <button
              onClick={() => {
                onRequestClose();
                setIsFixedPriceStep(1);
                setIsAuctionStep(1);
                settActiveButton(false);
                setConnectModal(false);
              }}
              className="theme_gradient_red btn-lg close_button"
            >
              Close ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNftAddQuantiyPurchaseInputBodySection;
