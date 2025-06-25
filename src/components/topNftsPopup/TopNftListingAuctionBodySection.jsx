import React, { useState, useEffect } from "react";
import TopNftPopupPagination from "./TopNftPopupPagination";
import { ALLOWED_MARKET_PLACE_NFT_TYPE } from "../../data/enums";
import { Modal } from "antd";
import OfferModal from "../offerModal";
import { trimWallet } from "../../utills/trimWalletAddr";
import { ETHTOUSD, MATICTOUSD } from "../../utills/currencyConverter";

const TopNftListingAuctionBodySection = ({
  fixedData,
  auctionData,
  name,
  itemData,
  setItemData,
  isSwitchValue,
  setIsSwitchValue,
  onRequestClose,
  setIsFixedPriceStep,
  setIsAuctionStep,
  page,
  setPage,
  pageAuction,
  setPageAuction,
  auctionTotalPages,
  totalPages,
}) => {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);

  const handleCancel = () => {
    setIsOfferModalOpen(false);
  };

  ETHTOUSD(1).then((result) => {
    setEthBal(result);
  });

  MATICTOUSD(1).then((result) => {
    setMaticBal(result);
  });

  return (
    <>
      <div className=" d-flex flex-column justify-content-center align-items-center">
        <div className="down_side_popup lg:p-4 p-3 bg-white">
          <p className="lg:mb-4 mb-2 text_detail_note">
            <strong>Note:</strong> This Item Seller is Snap Boogie. Select which
            NFT you would like to proceed with
          </p>

          <div className="w-full d-flex justify-content-center  ">
            <div className="lg:mb-4 mb-2 switch_button_data switch_button_data__dark_color">
              <button
                onClick={() => {
                  setIsSwitchValue(ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE);
                }}
                className={`btn-outline-secondary btn-sm switch_button_data  ${isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE ? "switch_button_data_red_button theme_gradient_red" : "switch_button_data__dark_color switch_button_data_gray_button"}`}
              >
                Fixed Price NFTs
              </button>
              <button
                onClick={() => {
                  setIsSwitchValue(ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION);
                }}
                className={`btn-sm btn-outline-secondary switch_button_data ${isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION ? "switch_button_data_red_button theme_gradient_red" : "switch_button_data__dark_color switch_button_data_gray_button"}`}
              >
                Auctioned NFTs
              </button>
            </div>
          </div>

          <div className="">
            {isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.FIXED_PRICE
              ? fixedData.map((nft, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setItemData({
                        name: name,
                        price: nft?.price,
                        currentBidAmount: nft?.currentBidAmount,
                        nftOwner: nft?.owner,
                        auctionId: nft?.fixedid,
                        itemDbId: nft?.dbid,
                        nftId: nft?.nftId,
                        chainId: nft?.chainId,
                        tokenId: nft?.tokenId,
                      });
                      setIsFixedPriceStep(2);
                    }}
                    className="shadow-move d-flex nft_listing justify-content-between align-items-center bg-white lg:py-2 py-1 lg:px-3 px-2 lg:mb-3 mb-2 rounded-3"
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src="https://images.unsplash.com/photo-1617136041743-451cb49648b0?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="NFT"
                        className="rounded-circle img-top_nft lg:me-3 me-2"
                      />
                      <div>
                        <div className="d-flex align-items-center ">
                          <h5 className="mb-1 nft_title text-danger">{name}</h5>
                          <p className="mb-0 text-muted  small address_margin">
                            ({trimWallet(nft?.owner)})
                          </p>
                        </div>

                        <p className="mb-0 nft_available_box">
                          {`${Number(nft?.copies).toLocaleString("en-US")} NFTs Available`}
                        </p>
                      </div>
                    </div>
                    <span className="text-black price_tag">
                      {nft?.price}{" "}
                      <span className="price_tag_currency">
                        {nft?.chainId == 137 ? "MATIC" : "ETH"}
                      </span>
                    </span>
                  </div>
                ))
              : auctionData.map((nft, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setItemData({
                        name: name,
                        price: nft?.price,
                        currentBidAmount: nft?.currentBidAmount,
                        nftOwner: nft?.owner,
                        auctionId: nft?.fixedid,
                        itemDbId: nft?.dbid,
                        nftId: nft?.nftId,
                        chainId: nft?.chainId,
                        tokenId: nft?.tokenId,
                        offers: nft?.auctionbids,
                      });
                      setIsAuctionStep(2);
                      setIsOfferModalOpen(true);
                    }}
                    className="shadow-move nft_listing d-flex justify-content-between align-items-center lg:py-2 py-1 lg:px-3 px-2 lg:mb-3 mb-2 rounded-3"
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src="https://images.unsplash.com/photo-1617136041743-451cb49648b0?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="NFT"
                        className="rounded-circle img-top_nft lg:me-3 me-2"
                      />
                      <div>
                        <div className="d-flex align-items-center ">
                          <h5 className="mb-1 nft_title text-danger">{name}</h5>
                          <p className="mb-0 text-muted small address_margin">
                            ({trimWallet(nft?.owner)})
                          </p>
                        </div>

                        <p className="mb-0 nft_available_box">
                          {'"Bid on this batch" ' +
                            Number(nft?.copies).toLocaleString("en-US") +
                            " NFTs Available"}
                        </p>
                      </div>
                    </div>
                    <span className="text-black price_tag">
                      {nft?.currentBidAmount > 0
                        ? nft?.currentBidAmount
                        : nft?.price}{" "}
                      <span className="price_tag_currency">
                        {nft?.chainId == 137 ? "MATIC" : "ETH"}
                      </span>
                    </span>
                  </div>
                ))}
            {}
          </div>

          <div className="w-full d-flex justify-content-center pagination_div_parent">
            <TopNftPopupPagination
              currentPage={
                isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION
                  ? pageAuction
                  : page
              }
              onPageChange={
                isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION
                  ? setPageAuction
                  : setPage
              }
              totalPages={
                isSwitchValue === ALLOWED_MARKET_PLACE_NFT_TYPE.AUCTION
                  ? auctionTotalPages === 0
                    ? 1
                    : auctionTotalPages
                  : totalPages
              }
            />
          </div>

          <div className="text-center mt-4 close_button">
            <button
              onClick={() => {
                onRequestClose();
                setIsAuctionStep(1);
                setIsFixedPriceStep(1);
              }}
              className="theme_gradient_red btn-lg close_button"
            >
              Close ✕
            </button>
          </div>
        </div>
      </div>
      <Modal
        open={isOfferModalOpen}
        onCancel={handleCancel}
        footer={false}
        centered
        width={829}
      >
        <OfferModal
          handleCancel={handleCancel}
          name={itemData.name}
          price={
            itemData.chainId == 1
              ? (itemData?.price * ethBal).toFixed(4)
              : (itemData?.price * maticBal).toFixed(4)
          }
          initialPrice={itemData?.price}
          currentBidAmount={
            itemData.chainId == 1
              ? (itemData?.currentBidAmount * ethBal).toFixed(4)
              : (itemData?.currentBidAmount * maticBal).toFixed(4)
          }
          nftOwner={itemData.nftOwner}
          auctionid={itemData.auctionId}
          itemDbId={itemData.itemDbId}
          nftId={itemData.nftId}
          tokenId={itemData.tokenId}
          offers={itemData.offers}
          modalType="test"
          customMessage="This is a test of the OfferModal with dummy data."
        />
      </Modal>
    </>
  );
};

export default TopNftListingAuctionBodySection;
