import React, { useEffect, useState } from "react";
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

  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  const [connecting, setConnecting] = useState(false);

  const fetchData = async () => {
    try {
      if (!walletProvider) {
        ToastMessage(
          "Error",
          "Wallet provider not ready. Please try again.",
          "error",
        );
        return;
      }

      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const { chainId } = await provider.getNetwork();

      if (userData) {
        // Existing user: Check address
        const userAddress = userData.address;

        if (userAddress.toLowerCase() !== address.toLowerCase()) {
          ToastMessage("Error", "Please connect correct wallet", "error");
          return;
        }
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

  // Previously fetchData() (which populates Redux web3 state) only ran when
  // the modal was opened while a wallet was already connected. A brand-new
  // connection never completed this step, so the user had to trigger their
  // action (mint/list/bid) a second time. This effect completes the flow
  // automatically the moment AppKit reports a connected wallet with a ready
  // provider, so connecting is a genuine single click.
  useEffect(() => {
    if (!visible || !isConnected || !walletProvider) return;

    let cancelled = false;
    setConnecting(true);

    fetchData().finally(() => {
      if (cancelled) return;
      setConnecting(false);
      onClose();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isConnected, walletProvider]);

  const handleWalletConnect = async () => {
    try {
      if (isConnected) {
        setConnecting(true);
        await fetchData();
        setConnecting(false);
        onClose();
        return;
      }

      await open();
      // Completion (fetchData + close) is handled by the effect above once
      // AppKit reports isConnected + walletProvider ready.
    } catch (error) {
      console.error("Connection failed:", error);
      setConnecting(false);
    }
  };

  return (
    <Modal
      style={{
        marginTop: "6rem",
        zIndex: 999999999,
      }}
      footer={null}
      className={backgroundTheme}
      bodyStyle={{ backgroundColor: "#222222" }}
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      zIndex={99999}
    >
      <div>
        <div className="d-flex mt-3 gap-4   flex-column justify-content-center align-items-center">
          <ButtonComponent
            onClick={handleWalletConnect}
            text={connecting ? "Connecting..." : "Link Wallet"}
            height={40}
            width={170}
            disabled={connecting}
            loading={connecting}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConnectModal;
