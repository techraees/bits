import React, { useState } from "react";
import { Modal } from "antd";
import { useAppKitProvider } from "@reown/appkit/react";
import { ButtonComponent } from "../index";
import ToastMessage from "../toastMessage/index.jsx";
import { useSelector } from "react-redux";
import {
  switchWalletChain,
  WalletSwitchRejectedError,
} from "../../utills/switchWalletChain";
import { resolveWalletProvider } from "../../utills/walletChain";
import "./css/index.css";

const CHAIN_LABELS = {
  1: "Ethereum",
  137: "Polygon",
};

// Shown when the user picks a network in the navbar while their connected
// wallet is on a different chain. Guides them through switching the wallet
// instead of only surfacing a "wrong chain" toast at transaction time.
const NetworkSwitchModal = ({ visible, targetChain, onClose, onSwitched }) => {
  const { walletProvider } = useAppKitProvider("eip155");
  const [switching, setSwitching] = useState(false);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  const targetLabel = CHAIN_LABELS[targetChain] || "the selected network";
  const activeProvider = resolveWalletProvider(walletProvider);

  const handleSwitch = async () => {
    if (!activeProvider?.request) {
      ToastMessage(
        "Error",
        "Wallet provider not ready. Please reconnect your wallet.",
        "error",
      );
      return;
    }

    setSwitching(true);
    try {
      await switchWalletChain(activeProvider, targetChain);
      onSwitched?.();
      onClose();
    } catch (error) {
      if (error instanceof WalletSwitchRejectedError) {
        ToastMessage(
          "Switch cancelled",
          "Network switch was declined in your wallet.",
          "info",
        );
        return;
      }

      console.error("Network switch failed:", error);
      ToastMessage(
        "Error",
        "Could not switch network automatically. Please switch it manually in your wallet.",
        "error",
      );
    } finally {
      setSwitching(false);
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
      <div className="network-switch-modal">
        <p className="network-switch-modal__text">
          You&apos;re switching to <strong>{targetLabel}</strong> listings.
          Please switch your wallet to {targetLabel} to mint, list, bid, or buy
          on this network.
        </p>
        <div className="d-flex mt-3 gap-3 justify-content-center">
          <ButtonComponent
            onClick={handleSwitch}
            text={switching ? "Switching..." : `Switch to ${targetLabel}`}
            height={40}
            width={220}
            disabled={switching}
            loading={switching}
          />
        </div>
      </div>
    </Modal>
  );
};

export default NetworkSwitchModal;
