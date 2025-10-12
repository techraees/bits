import React, { useState, useEffect } from "react";
// import { profile2 } from "../../assets";
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
import { getCookieStorage } from "../../../utills/cookieStorage";

const PurchaseHistory = () => {
  let token = getCookieStorage("access_token");
  const {
    // loading, error,
    data,
    // refetch
  } = useQuery(GET_ALL_NFTS_WITHOUT_ADDRESS);
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { userData } = useSelector((state) => state.address.userData);

  const [transactionHistory, setTransactionHistory] = useState([]);

  const [dropdownValue, setDropdownValue] = useState("Last Week");

  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);

  const {
    data: getAllMyTransaction,
    isLoading: getAllMyTransactionLoading,
    isFetching: getAllMyTransactionFetching,
  } = useQuery(GET_ALL_MY_TRANSACTION, {
    variables: {
      token: token,
      filterObj: `{"transaction_type":"buying_nft","chain_id":${contractData?.chain}}`,
    },
  });

  useEffect(() => {
    if (getAllMyTransaction) {
      const transactions = getAllMyTransaction?.getAllMyTransaction?.data;
      // const filteredTransactions = transactions?.filter(
      //   (transaction) => transaction.chain_id == contractData?.chain,
      // );
      setTransactionHistory(transactions);
    }
  }, [getAllMyTransaction]);

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
          <div className="d-flex">
            {/* <img src={profile2} style={{ width: 70, height: 70 }} /> */}
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
        <Transactions checkIcon data={transactionHistory} />
      </div>
    </div>
  );
};

export default PurchaseHistory;
