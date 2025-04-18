import React from "react";
import TopNftPopupPagination from "./TopNftPopupPagination";

const TopNftListingAuctionBodySection = ({ nftData }) => {
  return (
    <>
      <div className=" d-flex flex-column justify-content-center align-items-center">
        <div className="down_side_popup lg:p-4 p-3 bg-white">
          <p className="mb-4 lg:mb-4 mb-2 text_detail_note">
            <strong>Note:</strong> This Item Seller is Snap Boogie. Select which
            NFT you would like to proceed with
          </p>

          <div className="w-full d-flex justify-content-center ">
            <div className="mb-4 switch_button_data switch_button_data__dark_color">
              <button className=" btn-outline-secondary btn-sm switch_button_data switch_button_data__dark_color switch_button_data_gray_button">
                Fixed Price NFTs
              </button>
              <button className=" btn-sm switch_button_data switch_button_data_red_button theme_gradient_red">
                Auctioned NFTs
              </button>
            </div>
          </div>

          <div className="">
            {nftData.map((nft, index) => (
              <div
                key={index}
                className="shadow-move d-flex justify-content-between align-items-center bg-white py-2 px-3 mb-3 rounded-3"
              >
                <div className="d-flex align-items-center">
                  <img
                    src="https://images.unsplash.com/photo-1617136041743-451cb49648b0?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="NFT"
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <div>
                    <div className="d-flex align-items-center ">
                      <h5 className="mb-1 text-danger">{nft.title}</h5>
                      <p className="mb-0 text-muted small address_margin">
                        ({nft.address})
                      </p>
                    </div>

                    <p className="mb-0 text-muted small">
                      {"Bid on this batch " + nft.note}
                    </p>
                  </div>
                </div>
                <span className="text-black price_tag">
                  {nft.price} <span className="price_tag_currency">ETH</span>
                </span>
              </div>
            ))}
          </div>

          <div className="w-full d-flex justify-content-center pagination_div_parent">
            <TopNftPopupPagination
              currentPage={1}
              totalPages={10}
              onPageChange={() => {}}
            />
          </div>

          <div className="text-center mt-4 close_button">
            <button
              onClick={() => {}}
              className="theme_gradient_red btn-lg close_button"
            >
              Close ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNftListingAuctionBodySection;
