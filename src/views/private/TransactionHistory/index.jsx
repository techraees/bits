import React, { useState, useEffect } from "react";
import "./css/index.css";
import { Menu, Dropdown, Button, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { GET_ALL_MY_TRANSACTION } from "../../../gql/queries";
import { ETHTOUSD, MATICTOUSD } from "../../../utills/currencyConverter";
import { dbDateToReadableDate } from "../../../utills/timeToTimestamp";
import { getStorage } from "../../../utills/localStorage";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import faker from "faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const data = {
  labels,
  datasets: [
    {
      label: "Metamask",
      data: labels.map(() => faker.datatype.number({ min: 0, max: 30 })),
      backgroundColor: "#74F086",
    },
    {
      label: "Paypal",
      data: labels.map(() => faker.datatype.number({ min: 0, max: 30 })),
      backgroundColor: "#20ACD8",
    },
  ],
};

const TransactionHistory = () => {
  let token = getStorage("token");
  const {
    data: getAllMyTransaction,
    isLoading: getAllMyTransactionLoading,
    isFetching: getAllMyTransactionFetching,
  } = useQuery(GET_ALL_MY_TRANSACTION, {
    variables: {
      token: token,
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
      setAllHistory(getAllMyTransaction?.getAllMyTransaction?.data);
    }
  }, [getAllMyTransaction]);

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );

  // const handleChange = (value) => {
  // 	console.log(`selected ${value}`);
  // };
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
    <div className={`${backgroundTheme} pb-2`} style={{ minHeight: "100vh" }}>
      <div className="container">
        <div
          className="d-flex justify-content-between py-5 transactionFirstView"
          style={{ alignItems: "center" }}
        >
          <div className="d-flex">
            {/* <img src={profile_large} style={{ width: 70, height: 70 }} /> */}
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
        <div style={{ border: "1px solid #D54343" }}></div>

        <div className={`transactionsList my-5 ${bgColor2}`}>
          <div className="transaction-main-Wrapper">
            <h3 className={`${textColor} pt-4`}>Transactions</h3>
            {/* <h4 className={`${textColor}`}>
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
              <span
                className="red-gradient-color cursor"
                style={{
                  textDecoration: "underline",
                  marginRight: "1rem",
                  borderBottom: "1px solid  #CD3C3C",
                }}
              >
                View All
              </span>
            </h4> */}
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
                  <span className={textColor2} style={{ fontSize: 18 }}>
                    {getTranType(e?.transaction_type)}
                  </span>
                  <div>
                    {/* <img
                      src={e.category === "Paypal" ? paypal : metamask}
                      style={{ width: 15 }}
                    /> */}
                    {/* <span style={{ fontSize: 12 }} className="light-blue ms-2">
                      {e.category}
                    </span> */}
                  </div>
                </div>
                <div>
                  {/* {e.title == "Deposit" ? (
                    <>
                      <button className="depositeBtn">Deposit</button>
                    </>
                  ) : (
                    <>
                      <button className="withdrawBtn">Withdraw</button>
                    </>
                  )} */}

                  {/* <button className="depositeBtn">
                    {dbDateToReadableDate(e?.createdAt)}
                  </button> */}
                  <p className={`${textColor} me-2`}>
                    {dbDateToReadableDate(e?.createdAt)}
                  </p>

                  <span className={`${textColor} me-2`}>
                    ${" "}
                    {e?.currency === "ETH"
                      ? Number(e?.amount * ethBal).toFixed(4)
                      : Number(e?.amount * maticBal).toFixed(4)}
                  </span>
                  <img src={e.arrow} style={{ width: 10 }} />
                </div>
              </div>
            );
          })}
          <div className="d-flex justify-content-center py-3 cursor">
            <span
              className="red-gradient-color"
              style={{ borderBottom: "1px solid  #CD3C3C" }}
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
