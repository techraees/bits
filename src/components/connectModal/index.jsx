import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { ButtonComponent } from "../index";
import { Modal } from "antd";
import "./css/index.css";
import { useSelector, useDispatch } from "react-redux";
import ActionTypes from "../../store/contants/ActionTypes";
import ToastMessage from "../toastMessage/index.jsx";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";

const ConnectModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const { account } = useSelector((state) => state.web3.walletData);
  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  const [buttonVisible, setButtonVisible] = useState(visible);

  const handleWalletConnect = async () => {
    try {
      setButtonVisible(false);
      onClose();
      if (isConnected) {
        await fetchData();
        return;
      } else {
        await open();
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  useEffect(() => {
    setButtonVisible(visible);
  }, [visible]);

  const fetchData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const { chainId } = await provider.getNetwork();

      console.log("Provider", chainId);
      if (userData) {
        // Existing user: Check address
        const userAddress = userData.address;

        if (userAddress.toLowerCase() !== address.toLowerCase()) {
          ToastMessage("Error", "Please connect correct wallet", "error");
          return;
        }
      } else {
        // New user: No userData, no need to compare addresses
        console.log("New user signing up, skipping address check.");
      }

      // Proceed only if chainId matches
      if (contractData.chain === chainId) {
        const web3 = provider;
        dispatch({
          type: ActionTypes.WEB3CONNECT,
          payload: { address, web3, chainId, signer },
        });
      } else {
        ToastMessage("Error", "Please connect correct chain", "error");
      }
    } catch (error) {
      console.error("fetchData error:", error);
    }
  };

  return (
    <Modal
      // wrapClassName={backgroundTheme}
      style={{ marginTop: "6rem" }}
      footer={null}
      className={backgroundTheme}
      bodyStyle={{ backgroundColor: "#222222" }}
      open={buttonVisible}
      onOk={onClose}
      onCancel={onClose}
    >
      <div>
        <div className="d-flex mt-3 gap-4   flex-column justify-content-center align-items-center">
          <ButtonComponent
            onClick={handleWalletConnect}
            text={"Link Wallet"}
            height={40}
            width={170}
          />
          {/* <ButtonComponent
            onClick={handleWalletConnect}
            text={"Link Mobile Wallet"}
            height={40}
            width={170}
          /> */}
        </div>
      </div>
    </Modal>
  );
};

export default ConnectModal;
