import { ButtonComponent } from "../index";
const CHAIN_LABELS = {
  1: "Ethereum",
  137: "Polygon"
};
const NetworkSwitchBody = ({
  targetChain,
  onSuccess,
  onSwitch
}) => {
  const targetLabel = CHAIN_LABELS[targetChain] || "the selected network";
  const handleSwitch = async () => {
    if (onSwitch) {
      await onSwitch();
      return;
    }
    onSuccess?.();
  };
  return <div className="network-switch-modal">
      <p className="network-switch-modal__text">
        You&apos;re switching to <strong>{targetLabel}</strong> listings. Please
        connect your wallet and switch to {targetLabel} to mint, list, bid, or
        buy on this network.
      </p>
      <div className="d-flex mt-3 gap-3 justify-content-center">
        <ButtonComponent onClick={handleSwitch} text={`Switch to ${targetLabel}`} height={40} width={220} />
      </div>
    </div>;
};
export default NetworkSwitchBody;
