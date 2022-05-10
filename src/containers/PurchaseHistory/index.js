import React from "react";
import { profile2, profile_large } from "../../assets";
import { NavbarComponent, Transactions } from "../../components";
import { Dropdown, Button, Space, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./css/index.css";

const PurchaseHistory = () => {
  let sellingData = [
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
    {
     
      name: "Speedy Walkover",
      date: "10/22/2021",
      price: "$300",
    },
  ];
  const menu = (
    <Menu
      onClick={(e) => console.log(e)}
      items={[
        {
          label: "Last Month",
          key: "1",
        },
        {
          label: "Last Year",
          key: "2",
        },
      ]}
    />
  );
  return (
    <div className="black-background">
      <NavbarComponent selectedKey={"8"} headerText={"Purchase History"} />
      <div className="container">
      <div
          className="d-flex justify-content-between py-5 transactionFirstView"
          style={{ alignItems: "center" }}
        >
          <div className="d-flex">
            <img src={profile_large} style={{ width: 70, height: 70 }} />
            <div className="ms-3">
              <span className="light-grey">Hi,</span>
              <p className="white">Snap Boogie</p>
            </div>
          </div>
          <Dropdown overlay={menu} className="dropdownView mobMargin">
            <Button>
              <Space>
                Last Week
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
        <div style={{ border: "1px solid #D54343" }}></div>
        <Transactions data={sellingData} />
      </div>
    </div>
  );
};

export default PurchaseHistory;
