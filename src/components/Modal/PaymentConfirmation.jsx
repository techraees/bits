import React from "react";
import Confirm from "../../assets/images/ok.png";
import DownLoad from "../../assets/images/download.png";

const PaymentConfirmation = ({
  show,
  setShow,
  paymentConfirm,
  downloadConfirm,
  handleDownloadClick,
}) => {
  const handleClose = () => {
    setShow(false);
  };
  return (
    <>
      {show && (
        <div
          className="modal fade show custom-backdrop"
          tabIndex="-1"
          role="dialog"
          style={{ display: "block" }}
          id="staticBackdrop"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          aria-labelledby="staticBackdropLabel"
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content" style={{ borderRadius: "30px" }}>
              <div className="modal-header flex-column">
                <div className="w-100 text-end">
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleClose}
                  ></button>
                </div>
                <div className="w-100 text-center">
                  <h5 className="modal-title fw-bold">
                    {paymentConfirm
                      ? "Payment Confirmation"
                      : "Download Confirmation"}
                  </h5>
                </div>
              </div>
              <div className="modal-body">
                <div className="row align-items-center">
                  <div className="col-md-1">
                    <img className="img-fluid" src={Confirm} alt="" />
                  </div>
                  <div className="col-md-11">
                    <p className="paymentConfirmationHeading">
                      {paymentConfirm
                        ? "Congratulations! Your payment was successful."
                        : ""}
                      {downloadConfirm
                        ? "Congratulations! You successfully downloaded your FBX file."
                        : ""}
                    </p>
                  </div>
                </div>
                {paymentConfirm && (
                  <div className="row align-items-center mt-3">
                    <div className="col-md-1">
                      <img className="img-fluid" src={DownLoad} alt="" />
                    </div>
                    <div className="col-md-11">
                      <p className="paymentConfirmationHeading">
                        You can now download the file using the “Download”
                        button below.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {paymentConfirm && (
                <div
                  className="modal-footer flex-column"
                  style={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    borderTop: 0,
                  }}
                >
                  <button
                    type="button"
                    className="btn w-100 text-white checkoutBtn"
                    onClick={handleDownloadClick}
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentConfirmation;
