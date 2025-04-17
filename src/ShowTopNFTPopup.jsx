import React, { useState } from "react";
import { TopNftsPopup } from "./components";

const ShowTopNFTPopup = ({
  onRequestClose,
  isOpen,
  fixedData,
  auctionData,
  name,
}) => {
  return (
    <div>
      {" "}
      <TopNftsPopup
        isOpen={isOpen}
        onRequestClose={() => {
          onRequestClose();
        }}
        fixedData={fixedData}
        auctionData={auctionData}
        name={name}
      />
    </div>
  );
};

export default ShowTopNFTPopup;
