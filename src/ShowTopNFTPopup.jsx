import React from "react";
import { TopNftsPopup } from "./components";

const ShowTopNFTPopup = () => {
  return (
    <div>
      {" "}
      <TopNftsPopup isOpen={true} onRequestClose={() => {}} />
    </div>
  );
};

export default ShowTopNFTPopup;
