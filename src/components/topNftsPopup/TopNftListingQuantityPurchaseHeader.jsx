import React from "react";

const TopNftListingQuantityPurchaseHeader = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center w-full bg-white popup_header Nunito_font_family">
        <div className="d-flex align-items-center">
          <span className=" theme_gradient_red text-white popup_header_first_box">
            1
          </span>
          <h2 className="h5 mb-0">Listing</h2>
        </div>
        <div className="custom_line_adjustable"></div>
        <div className="text-muted h6 d-flex justify-content-center align-items-center">
          <div className="popup_header_second_box">3</div>
          <div>Quantity</div>
        </div>
        <div className="custom_line_adjustable"></div>
        <div className="text-muted h6 d-flex justify-content-center align-items-center">
          <div className="popup_header_second_box">2</div>
          <div>Auction</div>
        </div>
      </div>
    </>
  );
};

export default TopNftListingQuantityPurchaseHeader;
