import React, { useState } from "react";
import TopNftPopupPagination from "./TopNftPopupPagination";
import RedCrossIcon from "./redCross.svg";
import GreenTick from "./GreenTick.svg";
import DecrementButtonArr from "./DecrementButtonArr.svg";
import IncrementButtonArr from "./IncrementButtonArr.svg";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import BidModal from "../bidModal";
import ConnectModal from "../connectModal";
import ButtonComponent from "../button";

const TopNftAddQuantiyPurchaseInputBodySection = ({ setIsFixedPriceStep }) => {
  const [activeButton, settActiveButton] = useState(false);

  const [connectModal, setConnectModal] = useState(false);
  const closeConnectModel = () => {
    setConnectModal(false);
  };
  return (
    <>
      {/* <ConnectModal visible={connectModal} onClose={closeConnectModel} /> */}

      <Modal
        // wrapClassName={backgroundTheme}
        style={{ marginTop: "6rem" }}
        footer={null}
        // className={backgroundTheme}
        bodyStyle={{ backgroundColor: "#222222" }}
        open={connectModal}
        onOk={closeConnectModel}
        onCancel={closeConnectModel}
      >
        <div>
          <div className="d-flex mt-3 gap-4   flex-column justify-content-center align-items-center">
            <ButtonComponent
              // onClick={handleWalletConnect}
              text={"Link Wallet"}
              height={40}
              width={170}
            />
            {/* <ButtonComponent
            onClick={handleWalletConnect}
            text={"Link Mobile Wallet"}
            height={40}
            width={170}
          /> */}
          </div>
        </div>
      </Modal>

      <div className="Nunito_font_family d-flex flex-column justify-content-center align-items-center">
        <div className="down_side_popup lg:p-4 p-3 bg-white">
          {/* Card */}
          <div className=" custom-card shadow-move">
            <div className="card-body position-relative">
              {/* Cross Button */}
              <div className="cross_icon_red">
                <img src={RedCrossIcon} alt="" className="w-full h-full" />
              </div>
              <div className="">
                <div className="">
                  <div className="d-flex align-items-center"
                    style={{
                      width: "100%"
                    }} >
                    <img
                      src="https://plus.unsplash.com/premium_photo-1686727103139-2824d4fa46a3?q=80&w=3327&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      className="rounded-circle img_quantity_top_nft mr-3"
                      alt="Profile Image"
                      style={{

                        objectFit: "cover",
                      }}
                    />
                    <div className="heading_data">
                      <div className="heading_data_name">
                        <div>Speedy Walkover</div>
                        <div className="green_tick_button">
                          <img
                            src={GreenTick}
                            alt=""
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                      <p className="">From Snap Boogie</p>
                    </div>
                  </div>

                  <div></div>
                </div>
              </div>

              <div className="input_go_button_parent">
                {!activeButton ? (
                  <>
                    <div className="input_go_button_parent__input_div">
                      <div className="input_go_button_parent__input_div__parent">
                        <p className="input_go_button_parent__input_div__p">
                          Select Quantity
                        </p>
                        <span className="input_go_button_parent__input_div__p__value">
                          1
                        </span>
                      </div>

                      <div className="increment_decrement_button">
                        <div className="increment_decrement_button__increment">
                          <img src={IncrementButtonArr} alt="" />
                        </div>
                        <div className="increment_decrement_button__decrement">
                          <img src={DecrementButtonArr} alt="" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="input_go_button_parent__input_div">
                      <div className="input_go_button_parent__input_div__parent_full">
                        <p className="input_go_button_parent__input_div__p">
                          Total Price
                        </p>
                        <div className="line_vertical"></div>
                        <p>
                          1.3{" "}
                          <span className="price_tag_currency">
                            MATIC ($0.00204)
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {!activeButton && (
                  <div>
                    <button
                      className="theme_gradient_red go_button"
                      onClick={() => {
                        settActiveButton(true);
                      }}
                    >
                      GO
                    </button>
                  </div>
                )}
              </div>

              {!activeButton ? (
                <div className="total-price mt-3">
                  <div className="total_price_data">
                    <p>Total Price:</p>
                    <p>
                      1.3{" "}
                      <span className="price_tag_currency">
                        MATIC ($0.00204)
                      </span>
                    </p>
                  </div>
                  <p>
                    <span className="font-weight-bold">1 Ethereum</span> =
                    <strong> $1250.58</strong>
                  </p>
                </div>
              ) : (
                <div className="connect_wallet_button__parent" onClick={() => {
                  setIsFixedPriceStep(3)
                  setConnectModal(true)
                }}>
                  <button className="connect_wallet_button theme_gradient_red">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4 close_button">
            <button
              onClick={() => { }}
              className="theme_gradient_red btn-lg close_button"
            >
              Close ✕
            </button>
          </div>
        </div>
      </div >


    </>
  );
};

export default TopNftAddQuantiyPurchaseInputBodySection;
