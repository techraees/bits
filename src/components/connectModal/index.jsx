import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useWalletGateFlow } from "../../hooks/useWalletGateFlow";

// Invisible gate: opens AppKit Connect directly (no custom Link Wallet modal).
const ConnectModal = ({ visible, onClose, targetChain }) => {
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { ensureWalletOnChain, isConnected, walletProvider } =
    useWalletGateFlow();

  const resolvedTargetChain = targetChain ?? contractData?.chain;

  useEffect(() => {
    if (!visible || !resolvedTargetChain) {
      return;
    }

    let cancelled = false;

    ensureWalletOnChain(resolvedTargetChain).then((ok) => {
      if (!cancelled && ok) {
        onClose();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    resolvedTargetChain,
    isConnected,
    walletProvider,
    ensureWalletOnChain,
    onClose,
  ]);

  return null;
};

export default ConnectModal;
