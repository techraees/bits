import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./css/index.css";
import { AiFillCheckCircle } from "react-icons/ai";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_PROFILE_DETAILS_QUERY } from "../../../gql/queries";
import { SEND_EMAIL_MUTATION } from "../../../gql/mutations";
import { test } from "../../../assets";
import { SuccessModal } from "../../index";
import ConnectModal from "../../connectModal";
import { Modal } from "antd";
import { trimWallet } from "../../../utills/trimWalletAddr";
import { ETHToWei } from "../../../utills/convertWeiAndBnb";
import { Loader, ToastMessage } from "../../../components";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { loadContractIns } from "../../../store/actions";
import { boughtMessage } from "../../../utills/emailMessages";

const environment = process.env;

function PurchaseStep({
  owner,
  name,
  totalPrice,
  showAmt,
  quantity,
  fixedId,
  sellerUsername,
}) {
  const dispatch = useDispatch();
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { web3, signer } = useSelector((state) => state.web3.walletData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectModal, setConnectModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { userData } = useSelector((state) => state.address.userData);

  console.log("web3", web3, signer);

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

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleConnect = () => {
    connectWalletHandle();
  };

  useEffect(() => {
    if (userData?.id) {
      getProfile({ variables: userData?.id });
    }
  }, [userData?.id]);

  const handlePurchase = async () => {
    let val = Number(ETHToWei(totalPrice.toString()));
    let amount = val.toString();
    setLoadingStatus(true);

    if (signer) {
      const marketContractWithsigner =
        contractData.marketContract.connect(signer);

      if (quantity > 0) {
        try {
          const tx = await marketContractWithsigner.BuyFixedPriceItem(
            fixedId,
            quantity,
            { value: amount }
          );

          setLoadingMessage("Transaction Pending...");

          const res = await tx.wait();
          if (res) {
            setLoadingStatus(false);
            setLoadingMessage("");

            ToastMessage("Purchase Successful", "", "success");
            showModal();
            dispatch(loadContractIns());

            try {
              const msgData = boughtMessage(
                userData?.full_name,
                name,
                sellerUsername,
                totalPrice
              );
              await sendEmail({
                variables: {
                  to: profileData?.GetProfileDetails?.email,
                  from: environment.REACT_APP_EMAIL_OWNER,
                  subject: msgData.subject,
                  text: msgData.message,
                },
              });
            } catch (error) {
              setLoadingStatus(false);
              console.log(error);
            }
          }
        } catch (error) {
          const parsedEthersError = getParsedEthersError(error);
          if (parsedEthersError.context == -32603) {
            ToastMessage("Error", "Insufficient Balance", "error");
          } else {
            ToastMessage("Error", `${parsedEthersError.context}`, "error");
          }
        }
      } else {
        handleConnect();
      }
    }
  };

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
      setIsConnected(true);
    }
  }, [web3]);

  return (
    <div className="purchaseStep">
      {loadingStatus && <Loader content={loadingMessage} />}
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        centered
        width={706}
        className="successModal"
      >
        <SuccessModal totalPrice={totalPrice} showAmt={showAmt} />
      </Modal>
      <div className="purchaseStepMainWrapper">
        <div className="purchasecontentDiv">
          <div className="purchaseleftDiv">
            <div>
              <img className="purchaseImg" src={test} />
            </div>
            <div className="purchasetextWrapper">
              <h4 className="purchaseleftDivText">{name}</h4>
              <h6 className="purchaseleftDivSubText">
                {" "}
                From {trimWallet(owner)}
              </h6>
            </div>
          </div>
          <div className="purchaserightDiv">
            <h4 className="purchaseQtyText">Qty : {quantity}</h4>
            <AiFillCheckCircle className="purchaseCheckIcon" fontSize={24} />
          </div>
        </div>
        <div className="purchaseText">
          <div className="purchaseTextLeftDiv">
            <h4 className="totalPrice">Total Price</h4>
          </div>
          <div className="purchaseTextRightDiv">
            <h4 className="purchaseNumber">
              {totalPrice}{" "}
              <span className="purchaseNumberSpan">
                {" "}
                {contractData.chain == 1 ? "ETH" : "MATIC"} ($
                {showAmt.toFixed(5)}){" "}
              </span>
            </h4>
          </div>
        </div>
        <button
          className="purchaseConnectBtn"
          onClick={isConnected ? handlePurchase : handleConnect}
        >
          {isConnected ? "Buy Now" : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}

export default PurchaseStep;
