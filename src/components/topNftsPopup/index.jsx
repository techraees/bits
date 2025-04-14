import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { motion } from "framer-motion";
import "./css/index.css";
import TopNftListingAuctionBodySection from "./TopNftListingAuctionBodySection";
import TopNftListingAuctionHeader from "./TopNftListingAuctionHeader";
import TopNftListingQuantityPurchaseHeader from "./TopNftListingQuantityPurchaseHeader";
import TopNftAddQuantiyPurchaseInputBodySection from "./TopNftAddQuantiyPurchaseInputBodySection";
import { ALLOWED_MARKET_PLACE_NFT_TYPE } from "../../data/enums";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    top: "0px",
    left: "0px", // Fixed position at right
    width: "100svw",
    height: "100vh",
    border: "none",
    padding: 0,
    background: "transparent",
    position: "fixed", // Changed to fixed
    borderRadius: "0px",
    overflow: "hidden",
    borderBottomLeftRadius: "15px",
    borderBottomRightRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const nftData = [
  {
    title: "Redbull",
    price: "1.3",
    address: "0xbb1...8b903",
    nfts_available: 27,
  },
  {
    title: "Redbull",
    price: "0.4",
    address: "0xbb1...8b903",
    nfts_available: 32,
  },
  {
    title: "Redbull",
    price: "1.3",
    address: "0xbb1...8b903",
    nfts_available: 1,
  },
  {
    title: "Redbull",
    price: "1.3",
    address: "0xbb1...8b903",
    nfts_available: 23,
  },
];

const ListingModal = ({ isOpen, onRequestClose }) => {
  const [isSwitchValue, setIsSwitchValue] = useState(
    ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE,
  );

  const [isFixedPriceStep, setIsFixedPriceStep] = useState(1);
  const [isAuctionStep, setIsAuctionStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
        setIsAuctionStep(1);
        setIsFixedPriceStep(1);
      }}
      style={customStyles}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="popup_parent_div shadow-xl text-gray-800 scrollbar_hide_custom"
        style={{
          zIndex: 1,
        }}
      >
        {/* <TopNftListingAuctionHeader /> */}
        <TopNftListingQuantityPurchaseHeader
          isSwitchValue={isSwitchValue}
          setIsSwitchValue={setIsSwitchValue}
          onRequestClose={onRequestClose}
          isFixedPriceStep={isFixedPriceStep}
          isAuctionStep={isAuctionStep}
        />
        {isFixedPriceStep === 1 && (
          <TopNftListingAuctionBodySection
            nftData={nftData}
            isSwitchValue={isSwitchValue}
            setIsSwitchValue={setIsSwitchValue}
            onRequestClose={onRequestClose}
            setIsFixedPriceStep={setIsFixedPriceStep}
            setIsAuctionStep={setIsAuctionStep}
          />
        )}
        {(isFixedPriceStep === 2 || isFixedPriceStep === 3) && (
          <TopNftAddQuantiyPurchaseInputBodySection
            setIsFixedPriceStep={setIsFixedPriceStep}
            onRequestClose={onRequestClose}
            setIsAuctionStep={setIsAuctionStep}
          />
        )}
      </motion.div>
    </Modal>
  );
};

export default ListingModal;
