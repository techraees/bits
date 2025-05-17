import "./css/index.css";
import React, { useState } from "react";
import { Steps } from "antd";
import ListingStep from "./listingStep";
import QuantityStep from "./quantityStep";
import PurchaseStep from "./purchaseStep";
import { AiOutlineClose } from "react-icons/ai";

function StepperModal({ handleCancel, owners, name, sellerUsername }) {
  const { Step } = Steps;

  const [current, setCurrent] = useState(0);
  const [owner, setOwner] = useState();
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showAmt, setShowAmt] = useState(0);
  const [fixedId, setFixedId] = useState(0);
  const [databaseId, setDatabaseId] = useState(null);
  const [NFTId, setNFTId] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  // const onChange = (value) => {
  // 	setCurrent(value);
  // };

  return (
    <div>
      <div className="mainWrapper">
        <Steps
          current={current}
          // onChange={onChange}
        >
          <Step title="Listing" />
          <Step title="Quantity" />
          <Step title="Purchase" />
        </Steps>
      </div>
      <div className="subWrapper">
        {current === 0 && (
          <ListingStep
            setCurrent={setCurrent}
            owners={owners}
            name={name}
            setOwner={setOwner}
            setPrice={setPrice}
            setFixedId={setFixedId}
            setDatabaseId={setDatabaseId}
            setTokenId={setTokenId}
            setNFTId={setNFTId}
          />
        )}

        {current === 1 && (
          <QuantityStep
            setCurrent={setCurrent}
            name={name}
            owner={owner}
            setQuantity={setQuantity}
            quantity={quantity}
            databaseId={databaseId}
            NFTId={NFTId}
            tokenId={tokenId}
            price={price}
            setTotalPrice={setTotalPrice}
            totalPrice={totalPrice}
            showAmt={showAmt}
            setShowAmt={setShowAmt}
          />
        )}

        {current === 2 && (
          <PurchaseStep
            name={name}
            owner={owner}
            quantity={quantity}
            databaseId={databaseId}
            NFTId={NFTId}
            tokenId={tokenId}
            price={price}
            totalPrice={totalPrice}
            showAmt={showAmt}
            fixedId={fixedId}
            sellerUsername={sellerUsername}
          />
        )}

        <button
          className="closeButton"
          onClick={() => {
            handleCancel();
            setCurrent(0);
          }}
        >
          Close <AiOutlineClose className="closeIcon" />
        </button>
      </div>
    </div>
  );
}

export default StepperModal;
