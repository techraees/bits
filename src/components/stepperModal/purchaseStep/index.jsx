import { useLazyQuery, useMutation } from "@apollo/client";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { Modal } from "antd";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { test } from "../../../assets";
import { Loader, ToastMessage } from "../../../components";
import {
  CREATE_NEW_OWNERSHIP_OF_NFT,
  CREATE_NEW_TRANSACTION,
  SEND_EMAIL_MUTATION,
} from "../../../gql/mutations";
import { GET_PROFILE_DETAILS_QUERY } from "../../../gql/queries";
import { loadContractIns } from "../../../store/actions";
import { ETHToWei } from "../../../utills/convertWeiAndBnb";
import { getCookieStorage } from "../../../utills/cookieStorage";
import { boughtMessage } from "../../../utills/emailMessages";
import { trimWallet } from "../../../utills/trimWalletAddr";
import ConnectModal from "../../connectModal";
import { SuccessModal } from "../../index";
import "./css/index.css";
import ReCAPTCHA from "react-google-recaptcha";

const environment = process.env;

function PurchaseStep({
  owner,
  name,
  totalPrice,
  showAmt,
  quantity,
  fixedId,
  sellerUsername,
  databaseId,
  tokenId,
  NFTId,
}) {
  const dispatch = useDispatch();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { web3, signer } = useSelector((state) => state.web3.walletData);
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectModal, setConnectModal] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { userData } = useSelector((state) => state.address.userData);

  let token = getCookieStorage("access_token");

  const [
    getProfile,
    {
      // loading: profileLoadeing,
      // error: profileError,
      data: profileData,
      // refetch,
    },
  ] = useLazyQuery(GET_PROFILE_DETAILS_QUERY, {});

  const [
    sendEmail,
    // { data: emailData, loading: emailLoading, error: emailError },
  ] = useMutation(SEND_EMAIL_MUTATION);

  const [createNewNftOwnership] = useMutation(CREATE_NEW_OWNERSHIP_OF_NFT);
  const [createNewTransation] = useMutation(CREATE_NEW_TRANSACTION);

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

  console.log("id data", fixedId);

  useEffect(() => {
    if (userData?.id) {
      getProfile({ variables: userData?.id });
    }
  }, [userData?.id]);

  const handlePurchase = async () => {
    if (address?.toLowerCase() === userData?.address?.toLowerCase()) {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const amount = ETHToWei(totalPrice.toString()).toString();
      setLoadingStatus(true);

      if (!signer || quantity <= 0) {
        handleConnect();
        return;
      }

      const marketContractWithSigner =
        contractData.marketContract.connect(signer);

      try {
        const tx = await marketContractWithSigner.BuyFixedPriceItem(
          fixedId,
          quantity,
          { value: amount },
        );
        setLoadingMessage("Transaction Pending...");

        const res = await tx.wait();
        if (!res) throw new Error("Transaction failed");

        const transactionHash = res.transactionHash;

        const transactionVariables = {
          nft_id: NFTId.toString(),
          amount: Number(totalPrice),
          currency:
            contractData.chain === process.env.REACT_ETH_CHAINID
              ? "ETH"
              : "MATIC",
          token_id: tokenId.toString(),
          chain_id: contractData.chain.toString(),
          blockchain_listingID: fixedId.toString(),
        };

        await createNewNftOwnership({
          variables: {
            ...transactionVariables,
            total_price: Number(totalPrice),
            listingIDFromBlockChain: fixedId.toString(),
            listingID: databaseId.toString(),
            copies: Number(quantity),
            pricePerItem: Number(totalPrice),
            from_user_wallet: owner.toString(),
            to_user_wallet: address.toString(),
          },
        });

        await Promise.all([
          createNewTransation({
            variables: {
              ...transactionVariables,
              first_person_wallet_address: address.toString(),
              second_person_wallet_address: owner.toString(),
              transaction_type: "buying_nft",
              copies_transferred: Number(quantity),
              listingID: databaseId.toString(),
              hash_field: transactionHash,
            },
          }),
          createNewTransation({
            variables: {
              ...transactionVariables,
              first_person_wallet_address: owner.toString(),
              second_person_wallet_address: address.toString(),
              transaction_type: "selling_nft",
              copies_transferred: Number(quantity),
              listingID: databaseId.toString(),
              hash_field: transactionHash,
            },
          }),
        ]);

        if (!recaptchaToken) {
          ToastMessage("⚠️ reCAPTCHA not loaded yet", "", "error");
          return;
        }

        const msgData = boughtMessage(
          userData?.full_name,
          name,
          sellerUsername,
          totalPrice,
        );
        await sendEmail({
          variables: {
            to: profileData?.GetProfileDetails?.email,
            from: environment.REACT_APP_EMAIL_OWNER,
            subject: msgData.subject,
            text: msgData.message,
            recaptchaToken: recaptchaToken,
          },
        });

        setLoadingStatus(false);
        setLoadingMessage("");
        ToastMessage("Purchase Successful", "", "success");
        showModal();
        dispatch(loadContractIns());
      } catch (error) {
        setLoadingStatus(false);
        const parsedEthersError = getParsedEthersError(error);
        const errorMessage =
          parsedEthersError.context === -32603
            ? "Insufficient Balance"
            : parsedEthersError.context;
        ToastMessage("Error", errorMessage, "error");
      }
    } else {
      ToastMessage(
        "Error",
        `Profile Wallet Address(${userData?.address}) mismatch with metamask wallet address(${address})`,
        "error",
      );
    }
  };

  const closeConnectModel = () => {
    setConnectModal(false);
  };
  const connectWalletHandle = () => {
    if (!isConnected) {
      setConnectModal(true);
    }
  };

  useEffect(() => {
    if (isConnected) {
      setConnectModal(false);
    }
  }, [isConnected]);

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
        <div className="mt-3">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCH_SITE_KEY}
            onChange={(t) => setRecaptchaToken(t)}
            onExpired={() => setRecaptchaToken(null)}
            // Optional:
            // theme="dark"
            // size="compact"
          />
        </div>
      </div>
    </div>
  );
}

export default PurchaseStep;
