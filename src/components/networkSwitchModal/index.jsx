import React from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import NetworkSwitchBody from "./NetworkSwitchBody";
import "./css/index.css";

// Shown when the user picks a network in the navbar while their connected
// wallet is on a different chain. Guides them through switching the wallet
// instead of only surfacing a "wrong chain" toast at transaction time.
const NetworkSwitchModal = ({ visible, targetChain, onClose, onSwitched }) => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  const handleSuccess = () => {
    onSwitched?.();
    onClose();
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
      <NetworkSwitchBody targetChain={targetChain} onSuccess={handleSuccess} />
    </Modal>
  );
};

export default NetworkSwitchModal;
