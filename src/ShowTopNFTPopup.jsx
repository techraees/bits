import React, { useState } from "react";
import { TopNftsPopup } from "./components";

const ShowTopNFTPopup = ({ onRequestClose, isOpen }) => {
  return (
    <div>
      {" "}
      <TopNftsPopup
        isOpen={isOpen}
        onRequestClose={() => {
          onRequestClose();
        }}
      />
    </div>
  );
};

export default ShowTopNFTPopup;
