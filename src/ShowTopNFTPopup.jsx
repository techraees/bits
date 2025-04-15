import React, { useState } from "react";
import { TopNftsPopup } from "./components";

const ShowTopNFTPopup = ({ onRequestClose, isOpen, owners, name }) => {
  return (
    <div>
      {" "}
      <TopNftsPopup
        isOpen={isOpen}
        onRequestClose={() => {
          onRequestClose();
        }}
        owners={owners}
        name={name}
      />
    </div>
  );
};

export default ShowTopNFTPopup;
