import React, { useState } from "react";
import { Modal } from "antd";
import { mainnet, polygon } from "@reown/appkit/networks";
import { useAppKitNetwork } from "@reown/appkit/react";
import { ButtonComponent } from "../index";
import ToastMessage from "../toastMessage/index.jsx";
import { useSelector } from "react-redux";
import "./css/index.css";

const CHAIN_LABELS = {
  1: "Ethereum",
  137: "Polygon",
};

// Shown when the user picks a network in the navbar while their connected
// wallet is on a different chain. Guides them through switching the wallet
// instead of only surfacing a "wrong chain" toast at transaction time.
const NetworkSwitchModal = ({ visible, targetChain, onClose, onSwitched }) => {
  const { switchNetwork } = useAppKitNetwork();
  const [switching, setSwitching] = useState(false);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  const targetLabel = CHAIN_LABELS[targetChain] || "the selected network";

  const handleSwitch = async () => {
    setSwitching(true);
    try {
      // The AppKit hook does not return a settleable promise, so this is a
      // best-effort request - the wallet extension shows its own approval
      // prompt. onSwitched() applies the app's viewing chain optimistically
      // since that reflects what the user asked for; existing per-action
      // chain checks (mint/list/bid/purchase) still guard against a stale
      // wallet network before any transaction is signed.
      switchNetwork(targetChain === 1 ? mainnet : polygon);
      ToastMessage(
        "Switch requested",
        `Please approve the network switch to ${targetLabel} in your wallet.`,
        "info",
      );
      onSwitched?.();
    } catch (error) {
      console.error("Network switch failed:", error);
      ToastMessage(
        "Error",
        "Could not switch network automatically. Please switch it manually in your wallet.",
        "error",
      );
    } finally {
      setSwitching(false);
      onClose();
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
          Please switch your wallet to {targetLabel} to mint, list, bid, or
          buy on this network.
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
