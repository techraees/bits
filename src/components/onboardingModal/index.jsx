import React from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { ButtonComponent } from "../index";
import { setStorage } from "../../utills/localStorage";
import "./css/index.css";
export const ONBOARDING_SEEN_KEY = "bits_onboarding_seen";
const STEPS = [
  {
    title: "Connect your wallet",
    description:
      "Link your MetaMask wallet on Ethereum or Polygon to buy, sell, or mint NFTs.",
  },
  {
    title: "Create your NFT",
    description:
      "Upload a dance or emote video, add a title and description, then mint it on-chain.",
  },
  {
    title: "List it on the Marketplace",
    description:
      "Choose Fixed-Price or Auction, set your price, and make it available to buyers.",
  },
  {
    title: "Buy or sell freely",
    description:
      "Browse the Marketplace, bid or buy instantly, and track everything from your Collection.",
  },
];
const OnboardingModal = ({ visible, onClose }) => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const handleDismiss = () => {
    setStorage(ONBOARDING_SEEN_KEY, "true");
    onClose();
  };
  return (
    <Modal
      style={{
        marginTop: "4rem",
        zIndex: 999999999,
      }}
      footer={null}
      className={backgroundTheme}
      bodyStyle={{
        backgroundColor: "#222222",
      }}
      open={visible}
      onOk={handleDismiss}
      onCancel={handleDismiss}
      zIndex={99999}
      width={520}
    >
      <div className="onboarding-modal">
        <h4 className="onboarding-modal__title">Welcome to BITS</h4>
        <p className="onboarding-modal__subtitle">
          Here's how to get started in four quick steps:
        </p>
        <ol className="onboarding-modal__steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="onboarding-modal__step">
              <span className="onboarding-modal__step-number">{index + 1}</span>
              <div>
                <p className="onboarding-modal__step-title">{step.title}</p>
                <p className="onboarding-modal__step-description">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="d-flex justify-content-center mt-3">
          <ButtonComponent
            onClick={handleDismiss}
            text={"Got it, let's go"}
            height={40}
            width={200}
          />
        </div>
      </div>
    </Modal>
  );
};
export default OnboardingModal;
