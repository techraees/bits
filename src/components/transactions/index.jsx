import React, { useState } from "react";
import { check } from "../../assets";
import "./css/index.css";
import { useSelector } from "react-redux";
import { ETHTOUSD, MATICTOUSD } from "../../utills/currencyConverter";
import { trimWallet } from "../../utills/trimWalletAddr";
import { dbDateToReadableDate } from "../../utills/timeToTimestamp";

const Transactions = ({ data, checkIcon }) => {
  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const bgColor2 = useSelector((state) => state.app.theme.bgColor2);

  const { contractData } = useSelector((state) => state.chain.contractData);

  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);

  ETHTOUSD(1).then((result) => {
    setEthBal(result);
  });

  MATICTOUSD(1).then((result) => {
    setMaticBal(result);
  });

  console.log("history data", data);

  return (
    <div className="py-2">
      <div
        className="d-flex justify-content-between m-4"
        style={{ alignItems: "center" }}
      >
        <h4 className={`${textColor} m-0`}>Transactions</h4>
        {/* <div className="d-flex text">
          <h4 className={`${textColor}`}>
            Sort by: &nbsp; &nbsp;
            <Select
              defaultValue="US Dollar"
              style={{
                width: 120,
              }}
              className={textColor == "black" && "ant-light"}
              onChange={handleChange}
              options={[
                {
                  value: "US Dollar",
                  label: "US Dollar",
                },
                {
                  value: "Etherum",
                  label: "Etherum",
                },
                {
                  value: "Binanace",
                  label: "Binanace",
                },
              ]}
            />
          </h4>
          <div className="cursor" style={{ marginTop: ".4rem" }}>
            <span
              className="red-gradient-color"
              style={{ borderBottom: "1px solid  #CD3C3C" }}
            >
              View All
            </span>
          </div>
        </div> */}
      </div>
      {data &&
        data.map((e, i) => {
          return (
            <div
              key={i}
              className={`d-flex justify-content-between shadowBorder py-3 cardsPadding my-4 ${bgColor2}`}
              style={{ alignItems: "center" }}
            >
              <div className="d-flex" style={{ alignItems: "center" }}>
                {e.image && (
                  <img className="me-4" src={e.image} style={{ width: 60 }} />
                )}
                <div>
                  <span className={textColor2}>
                    {trimWallet(e?.first_person_wallet_address)}
                  </span>
                  <div>
                    {checkIcon && <img src={check} className="me-2" />}
                    {e?.second_person_wallet_address && (
                      <span className={textColor2}>
                        {e?.transaction_type === "selling_nft"
                          ? "Sold to"
                          : "bought from"}{" "}
                        {trimWallet(e?.second_person_wallet_address)} on{" "}
                      </span>
                    )}
                    <span className="red">
                      {dbDateToReadableDate(e?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <h4 className={"m-0"} style={{ color: "#B93232" }}>
                ${" "}
                {e?.currency === "ETH"
                  ? Number(e?.amount * ethBal).toFixed(4)
                  : Number(e?.amount * maticBal).toFixed(4)}
              </h4>
            </div>
          );
        })}
    </div>
  );
};

export default Transactions;
