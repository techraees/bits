import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ButtonComponent } from "../index";
import { Modal } from "antd";
import "./css/index.css";
import { useSelector, useDispatch } from "react-redux";
import ActionTypes from "../../store/contants/ActionTypes";
import ToastMessage from "../toastMessage/index.jsx";
import { useAppKit } from "@reown/appkit/react";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import NetworkSwitchBody from "../networkSwitchModal/NetworkSwitchBody";
import {
  getWalletChainId,
  isWalletActive,
  subscribeWalletChain,
} from "../../utills/walletChain";

const ConnectModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");

  const { userData } = useSelector((state) => state.address.userData);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  const [connecting, setConnecting] = useState(false);
  const [liveWalletChainId, setLiveWalletChainId] = useState(null);

  const walletActive = isWalletActive(isConnected);
  const effectiveChainId =
    liveWalletChainId ?? (chainId != null ? Number(chainId) : null);
  const needsSwitch =
    walletActive &&
    effectiveChainId != null &&
    contractData?.chain != null &&
    effectiveChainId !== Number(contractData.chain);

  useEffect(() => {
    if (!visible || !walletActive) {
      setLiveWalletChainId(null);
      return;
    }

    let cancelled = false;

    getWalletChainId().then((id) => {
      if (!cancelled && id != null) {
        setLiveWalletChainId(id);
      }
    });

    const unsubscribe = subscribeWalletChain((id) => {
      setLiveWalletChainId(id);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [visible, walletActive, isConnected]);

  const fetchData = async () => {
    try {
      if (!walletProvider) {
        ToastMessage(
          "Error",
          "Wallet provider not ready. Please try again.",
          "error",
        );
        return false;
      }

      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const { chainId: providerChainId } = await provider.getNetwork();

      if (userData) {
        const userAddress = userData.address;

        if (userAddress.toLowerCase() !== address.toLowerCase()) {
          ToastMessage("Error", "Please connect correct wallet", "error");
          return false;
        }
      }

      if (contractData.chain === providerChainId) {
        dispatch({
          type: ActionTypes.WEB3CONNECT,
          payload: {
            address,
            web3: provider,
            chainId: providerChainId,
            signer,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("fetchData error:", error);
      return false;
    }
  };

  const handleSwitchSuccess = async () => {
    setConnecting(true);
    const ok = await fetchData();
    setConnecting(false);
    if (ok) {
      onClose();
    }
  };

  // Auto-complete when connected on the correct chain. Skip when the modal
  // should show the network switch UI instead.
  useEffect(() => {
    if (!visible || !isConnected || !walletProvider || needsSwitch) return;

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
  }, [visible, isConnected, walletProvider, needsSwitch]);

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
      {needsSwitch ? (
        <NetworkSwitchBody
          targetChain={contractData.chain}
          onSuccess={handleSwitchSuccess}
        />
      ) : (
        <div>
          <div className="d-flex mt-3 gap-4 flex-column justify-content-center align-items-center">
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
      )}
    </Modal>
  );
};

export default ConnectModal;
