import React, { useState } from "react";
import { TopNftsPopup } from "./components";

const ShowTopNFTPopup = ({
  onRequestClose,
  isOpen,
  fixedData,
  auctionData,
  name,
  marketplacecard,
  page,
  setPage,
  pageAuction,
  setPageAuction,
  auctionTotalPages,
  totalPages,
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
        marketplacecard={marketplacecard}
        page={page}
        setPage={setPage}
        pageAuction={pageAuction}
        setPageAuction={setPageAuction}
        totalPages={totalPages}
        auctionTotalPages={auctionTotalPages}
      />
    </div>
  );
};

export default ShowTopNFTPopup;
