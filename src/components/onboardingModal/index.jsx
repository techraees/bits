import React from "react";
import { Modal } from "antd";
import { setStorage } from "../../utills/localStorage";
import "./css/index.css";

export const ONBOARDING_SEEN_KEY = "bits_onboarding_seen";

const STEPS = [
  {
    title: "Connect your Wallet",
    description:
      "Link your Metamask Wallet on Ethereum or Polygon to buy, Sell or mint NFTs.",
  },
  {
    title: "Create your NFT",
    description:
      "Upload a dance or emote video, add title and description, then mint it on-chain.",
  },
  {
    title: "List it on the Marketplace",
    description:
      "Choose Fixed-Price or Auction, set your price, and make it available to buyers.",
  },
  {
    title: "Buy or Sell freely",
    description:
      "Browse the Marketplace, bid or buy instantly, and track everything from collection",
  },
];

/** Above navbar (100000000+) and drawers (100000200). */
const ONBOARDING_MODAL_Z_INDEX = 100000300;

const OnboardingModal = ({ visible, onClose }) => {
  const handleDismiss = () => {
    setStorage(ONBOARDING_SEEN_KEY, "true");
    onClose();
  };

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={handleDismiss}
      centered
      width={630}
      zIndex={ONBOARDING_MODAL_Z_INDEX}
      maskStyle={{ zIndex: ONBOARDING_MODAL_Z_INDEX - 10 }}
      className="onboarding-modal-wrap"
      wrapClassName="onboarding-modal-root"
      maskClosable={false}
      destroyOnClose
      getContainer={() => document.body}
    >
      <div className="onboarding-modal">
        <div className="onboarding-modal__icon" aria-hidden="true">
          🎉
        </div>

        <h2 className="onboarding-modal__title">Welcome to BITS</h2>
        <p className="onboarding-modal__subtitle">
          Here&apos;s how to get started in four Quick steps:
        </p>

        <ol className="onboarding-modal__steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="onboarding-modal__step">
              <div className="onboarding-modal__step-head">
                <div className="onboarding-modal__step-marker">
                  <span className="onboarding-modal__step-number">
                    {index + 1}
                  </span>
                </div>
                <p className="onboarding-modal__step-title">{step.title}</p>
              </div>
              <p className="onboarding-modal__step-description">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="onboarding-modal__cta"
          onClick={handleDismiss}
        >
          Got it, let&apos;s go
        </button>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
