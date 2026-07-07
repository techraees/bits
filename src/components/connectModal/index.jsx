import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useWalletGateFlow } from "../../hooks/useWalletGateFlow";
import { ToastMessage } from "../index";

// Invisible gate: opens AppKit Connect directly (no custom Link Wallet modal).
const ConnectModal = ({ visible, onClose, targetChain }) => {
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { userData } = useSelector((state) => state.address.userData);
  const { ensureWalletOnChain, isConnected, walletProvider } =
    useWalletGateFlow();

  const resolvedTargetChain = targetChain ?? contractData?.chain;
  const isLoggedIn = Boolean(userData?.isLogged);

  useEffect(() => {
    if (!visible || !resolvedTargetChain) {
      return;
    }

    // Mint/List/Bid/Buy all require a BITS account first - don't prompt a
    // wallet connect/switch for a logged-out visitor just browsing.
    if (!isLoggedIn) {
      ToastMessage(
        "Login required",
        "Please log in to connect your wallet.",
        "info",
      );
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
    isLoggedIn,
    isConnected,
    walletProvider,
    ensureWalletOnChain,
    onClose,
  ]);

  return null;
};

export default ConnectModal;
