import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { useWalletGateFlow } from "../../hooks/useWalletGateFlow";
import { ToastMessage } from "../index";
import WalletShieldIcon from "./WalletShieldIcon";
import "./css/index.css";

/** Above navbar and onboarding modal. */
const CONNECT_WALLET_MODAL_Z_INDEX = 100000310;

const ConnectModal = ({ visible, onClose, targetChain }) => {
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { userData } = useSelector((state) => state.address.userData);
  const { ensureWalletOnChain, isConnected } = useWalletGateFlow();
  const resolvedTargetChain = targetChain ?? contractData?.chain;
  const isLoggedIn = Boolean(userData?.isLogged);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (visible && isConnected) {
      onClose();
    }
  }, [visible, isConnected, onClose]);

  const handleConnect = async () => {
    if (!isLoggedIn) {
      ToastMessage(
        "Login required",
        "Please log in to connect your wallet.",
        "info",
      );
      return;
    }
    if (!resolvedTargetChain) {
      ToastMessage("Error", "Network is not ready yet. Please try again.", "error");
      return;
    }

    setConnecting(true);
    try {
      const ok = await ensureWalletOnChain(resolvedTargetChain);
      if (ok) {
        onClose();
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Modal
      open={visible}
      visible={visible}
      footer={null}
      onCancel={onClose}
      centered
      width={630}
      zIndex={CONNECT_WALLET_MODAL_Z_INDEX}
      maskStyle={{ zIndex: CONNECT_WALLET_MODAL_Z_INDEX - 10 }}
      className="connect-wallet-modal-wrap"
      wrapClassName="connect-wallet-modal-root"
      maskClosable={false}
      destroyOnClose
      getContainer={() => document.body}
    >
      <div className="connect-wallet-modal">
        <div className="connect-wallet-modal__icon" aria-hidden="true">
          <WalletShieldIcon />
        </div>

        <h2 className="connect-wallet-modal__title">Connect Your Wallet</h2>
        <p className="connect-wallet-modal__subtitle">
          Must have a{" "}
          <span className="connect-wallet-modal__highlight">MetaMask</span> to
          use the platform
        </p>

        <button
          type="button"
          className="connect-wallet-modal__cta"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? "Connecting..." : "Connect wallet"}
        </button>
      </div>
    </Modal>
  );
};

export default ConnectModal;
