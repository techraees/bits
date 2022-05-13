import React, { useState } from "react";
import {
  down_arrow,
  metamask,
  paypal,
  profile_large,
  up_arrow,
} from "../../assets";
import { NavbarComponent } from "../../components";
import "./css/index.css";
import { Menu, Dropdown, Button, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import faker from "faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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
  const [dropdownValue, setDropdownValue] = useState("Last Week");
  let transactionsData = [
    {
      title: "Deposit",
      category: "Paypal",
      price: "$405",
      arrow: up_arrow,
    },
    {
      title: "Deposit",
      category: "Metamask",
      price: "$405",
      arrow: up_arrow,
    },
    {
      title: "Withdraw",
      category: "Paypal",
      price: "$405",
      arrow: down_arrow,
    },
    {
      title: "Withdraw",
      category: "Metamask",
      price: "$405",
      arrow: down_arrow,
    },
    {
      title: "Deposit",
      category: "Paypal",
      price: "$405",
      arrow: up_arrow,
    },
    {
      title: "Deposit",
      category: "Paypal",
      price: "$405",
      arrow: up_arrow,
    },
    {
      title: "Withdraw",
      category: "metamask",
      price: "$405",
      arrow: down_arrow,
    },
  ];
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme
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
    <div className={`${backgroundTheme} pb-2`}>
      <NavbarComponent selectedKey={"6"} headerText={"Transaction History"} />
      <div className="container">
        <div
          className="d-flex justify-content-between py-5 transactionFirstView"
          style={{ alignItems: "center" }}
        >
          <div className="d-flex">
            <img src={profile_large} style={{ width: 70, height: 70 }} />
            <div className="ms-3">
              <span className={textColor2}>Hi,</span>
              <p className={textColor}>Snap Boogie</p>
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
        <div className="my-5">
          <Bar options={options} data={data} />
        </div>
        <div className={`transactionsList my-5 ${bgColor2}`}>
          <h3 className={`${textColor} pt-4`} style={{ textAlign: "center" }}>
            Transactions
          </h3>
          {transactionsData.map((e, i) => {
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
                    {e.title}
                  </span>
                  <div>
                    <img
                      src={e.category === "Paypal" ? paypal : metamask}
                      style={{ width: 15 }}
                    />
                    <span style={{ fontSize: 12 }} className="light-blue ms-2">
                      {e.category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className={`${textColor} me-2`}>$405</span>
                  <img src={e.arrow} style={{ width: 10 }} />
                </div>
              </div>
            );
          })}
          <div
            className="d-flex justify-content-center py-3 cursor"
            style={{ textDecoration: "underline" }}
          >
            <span className="red-gradient-color">View All</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
