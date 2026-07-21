import React, { useState, useEffect } from "react";
import "./css/index.css";
import { Menu, Dropdown, Button, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { GET_ALL_MY_TRANSACTION } from "../../../gql/queries";
import { ETHTOUSD, MATICTOUSD } from "../../../utills/currencyConverter";
import { dbDateToReadableDate } from "../../../utills/timeToTimestamp";
import { getCookieStorage } from "../../../utills/cookieStorage";
const TransactionHistory = () => {
  let token = getCookieStorage("access_token");
  const { contractData } = useSelector((state) => state.chain.contractData);
  const {
    data: getAllMyTransaction,
    isLoading: getAllMyTransactionLoading,
    isFetching: getAllMyTransactionFetching,
  } = useQuery(GET_ALL_MY_TRANSACTION, {
    variables: {
      filterObj: `{"chain_id":${contractData?.chain}}`,
    },
  });
  const { userData } = useSelector((state) => state.address.userData);
  const [dropdownValue, setDropdownValue] = useState("Last Week");
  const [allHistory, setAllHistory] = useState([]);
  const [ethBal, setEthBal] = useState(0);
  const [maticBal, setMaticBal] = useState(0);
  ETHTOUSD(1).then((result) => {
    setEthBal(result);
  });
  MATICTOUSD(1).then((result) => {
    setMaticBal(result);
  });
  const getTranType = (tran) => {
    if (tran === "create_nft") {
      return "Nft Created";
    }
    if (tran === "listing_nft") {
      return "Nft Listed";
    }
    if (tran === "buying_nft") {
      return "Nft Bought";
    }
    if (tran === "selling_nft") {
      return "Nft Sold";
    }
    if (tran === "bidding_transaction") {
      return "Bid";
    }
  };
  useEffect(() => {
    if (getAllMyTransaction) {
      const transactions = getAllMyTransaction?.getAllMyTransaction?.data;
      const filteredTransactions = transactions?.filter(
        (transaction) => transaction.chain_id == contractData?.chain,
      );
      setAllHistory(transactions);
    }
  }, [getAllMyTransaction]);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const bgColor2 = useSelector((state) => state.app.theme.bgColor2);
  const menu = (
    <Menu
      onClick={(e) => setDropdownValue(e.key)}
      items={[
        {
          label: "Last Week",
          key: "Last Week",
        },
        {
          label: "Last Month",
          key: "Last Month",
        },
        {
          label: "Last Year",
          key: "Last Year",
        },
      ]}
    />
  );
  return (
    <div
      className={`${backgroundTheme} pb-2`}
      style={{
        minHeight: "100vh",
      }}
    >
      <div className="container">
        <div
          className="d-flex justify-content-between py-5 transactionFirstView"
          style={{
            alignItems: "center",
          }}
        >
          <div className="d-flex">
            {}
            <div className="ms-3">
              <span className={textColor2}>Hi,</span>
              <p className={textColor}>{userData?.full_name}</p>
            </div>
          </div>
          <Dropdown overlay={menu} className="dropdownView mobMargin">
            <Button>
              <Space>
                {dropdownValue}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
        <div
          style={{
            border: "1px solid #D54343",
          }}
        ></div>

        <div className={`transactionsList my-5 ${bgColor2}`}>
          <div className="transaction-main-Wrapper">
            <h3 className={`${textColor} pt-4`}>Transactions</h3>
            {}
          </div>
          {allHistory.map((e, i) => {
            return (
              <div
                key={i}
                className="d-flex justify-content-between py-3 mx-5"
                style={{
                  borderBottom: "1px solid #2d2d2d",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    className={textColor2}
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {getTranType(e?.transaction_type)}
                  </span>
                  <div>
                    {}
                    {}
                  </div>
                </div>
                <div>
                  {}

                  {}
                  <p className={`${textColor} me-2`}>
                    {dbDateToReadableDate(e?.createdAt)}
                  </p>

                  <span className={`${textColor} me-2`}>
                    ${" "}
                    {e?.currency === "ETH"
                      ? Number(e?.amount * ethBal).toFixed(4)
                      : Number(e?.amount * maticBal).toFixed(4)}
                  </span>
                  <img
                    src={e.arrow}
                    style={{
                      width: 10,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <div className="d-flex justify-content-center py-3 cursor">
            <span
              className="red-gradient-color"
              style={{
                borderBottom: "1px solid  #CD3C3C",
              }}
            >
              View All
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransactionHistory;
