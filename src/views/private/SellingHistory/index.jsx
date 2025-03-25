import React, { useState, useEffect } from "react";

import { Transactions } from "../../../components";
import { Dropdown, Button, Space, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./css/index.css";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import {
  GET_ALL_NFTS_WITHOUT_ADDRESS,
  GET_ALL_MY_TRANSACTION,
} from "../../../gql/queries";
import { getStorage } from "../../../utills/localStorage";

const SellingHistory = () => {
  let token = getStorage("token");
  const { error, data } = useQuery(GET_ALL_NFTS_WITHOUT_ADDRESS);

  const {
    data: getAllMyTransaction,
    isLoading: getAllMyTransactionLoading,
    isFetching: getAllMyTransactionFetching,
  } = useQuery(GET_ALL_MY_TRANSACTION, {
    variables: {
      token: token,
      filterObj: '{"transaction_type":"selling_nft"}',
    },
  });

  const [nfts, setNfts] = useState(null);
  const [dropdownValue, setDropdownValue] = useState("Last Week");
  const { userData } = useSelector((state) => state.address.userData);
  const [sellingHistory, setSellingHistory] = useState([]);

  useEffect(() => {
    if (getAllMyTransaction) {
      setSellingHistory(getAllMyTransaction?.getAllMyTransaction?.data);
    }
  }, [getAllMyTransaction]);

  useEffect(() => {
    if (data) {
      setNfts(data?.getAllNftsWithoutAddress);
    }
  }, [data]);

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
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
    <div className={`${backgroundTheme}`} style={{ minHeight: "100vh" }}>
      <div className="container">
        <div
          className="d-flex justify-content-between py-5 transactionFirstView"
          style={{ alignItems: "center" }}
        >
          <div className="d-flex" style={{ alignItems: "center" }}>
            {/* <img src={profile_large} style={{ width: 70, height: 70 }} /> */}
            <h4 className="white ms-4 semi-bold red-gradient-color">
              {userData?.full_name}
            </h4>
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
        <Transactions checkIcon data={sellingHistory} />
      </div>
    </div>
  );
};

export default SellingHistory;
