import React, { useState } from "react";
import { useAppKitProvider } from "@reown/appkit/react";
import { ButtonComponent } from "../index";
import ToastMessage from "../toastMessage/index.jsx";
import {
  switchWalletChain,
  WalletSwitchRejectedError,
} from "../../utills/switchWalletChain";
import { resolveWalletProvider } from "../../utills/walletChain";

const CHAIN_LABELS = {
  1: "Ethereum",
  137: "Polygon",
};

const NetworkSwitchBody = ({ targetChain, onSuccess }) => {
  const { walletProvider } = useAppKitProvider("eip155");
  const [switching, setSwitching] = useState(false);

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
      onSuccess?.();
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
    <div className="network-switch-modal">
      <p className="network-switch-modal__text">
        You&apos;re switching to <strong>{targetLabel}</strong> listings. Please
        switch your wallet to {targetLabel} to mint, list, bid, or buy on this
        network.
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
  );
};

export default NetworkSwitchBody;
