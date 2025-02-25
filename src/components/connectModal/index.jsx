import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ButtonComponent } from "../index";
import { Modal } from "antd";
import "./css/index.css";
import { useSelector, useDispatch } from "react-redux";
import {
  loadBlockchainAction,
  loadWalletConnectAction,
} from "../../store/actions";
import { useAppKit } from "@reown/appkit/react";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";

const ConnectModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const { account } = useSelector((state) => state.web3.walletData);
  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
  );

  const [buttonVisible, setButtonVisible] = useState(visible);

  const handleWalletConnect = async () => {
    setButtonVisible(false);
    onClose();
    if (isConnected) {
      console.log("Already Connected");
    } else {
      await open();
    }
  };

  useEffect(() => {
    setButtonVisible(visible);
  }, [visible]);

  const fetchData = async () => {
    const provider = new ethers.providers.Web3Provider(walletProvider);
    dispatch(
      loadBlockchainAction(
        contractData.chain,
        userData?.address || account,
        address,
        provider
      )
    );
  };

  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, []);

  // const handleWalletConnect = async () => {
  //   onClose();
  //   dispatch(
  //     loadWalletConnectAction(contractData.chain, userData?.address || account)
  //   );
  // };

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
