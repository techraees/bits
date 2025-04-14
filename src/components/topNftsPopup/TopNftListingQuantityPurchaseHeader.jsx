import React from "react";
import { ALLOWED_MARKET_PLACE_NFT_TYPE } from "../../data/enums";

const TopNftListingQuantityPurchaseHeader = ({
  isSwitchValue,
  setIsSwitchValue,
  onRequestClose,
  setIsFixedPriceStep,
  isFixedPriceStep,
  isAuctionStep,
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center w-full bg-white popup_header Nunito_font_family">
        {isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE ? (
          <>
            <div className="d-flex align-items-center">
              <div
                className={` ${
                  isFixedPriceStep === 1 ? "theme_gradient_red" : ""
                } popup_header_second_box`}
              >
                1
              </div>
              <div className=" ">Listing</div>
            </div>
            <div className="custom_line_adjustable"></div>
            <div className="d-flex justify-content-center align-items-center">
              <div
                className={` ${
                  isFixedPriceStep === 2 ? "theme_gradient_red" : ""
                } popup_header_second_box`}
              >
                2
              </div>
              <div>Quantity</div>
            </div>
            <div className="custom_line_adjustable"></div>
            <div className="d-flex justify-content-center align-items-center">
              <div
                className={` ${
                  isFixedPriceStep === 3 ? "theme_gradient_red" : ""
                } popup_header_second_box`}
              >
                3
              </div>
              <div>Purchase</div>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex align-items-center">
              <div
                className={` ${
                  isAuctionStep === 1 ? "theme_gradient_red" : ""
                } popup_header_second_box`}
              >
                1
              </div>
              <div className="">Listing</div>
            </div>
            <div className="custom_line_adjustable"></div>
            <div className="d-flex justify-content-center align-items-center">
              <div
                className={` ${
                  isAuctionStep === 2 ? "theme_gradient_red" : ""
                } popup_header_second_box`}
              >
                2
              </div>
              <div>Auction</div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TopNftListingQuantityPurchaseHeader;
