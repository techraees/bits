import "./css/index.css";
import React, { useState } from "react";
import { Steps } from "antd";
import ListingStep from "./listingStep";
import QuantityStep from "./quantityStep";
import PurchaseStep from "./purchaseStep";
import { AiOutlineClose } from "react-icons/ai";

function StepperModal({ handleCancel }) {
  const { Step } = Steps;

  const [current, setCurrent] = useState(0);
  const onChange = (value) => {
    console.log("onChange:", current);
    setCurrent(value);
  };

  return (
    <div>
      <div className="mainWrapper">
        <Steps current={current} onChange={onChange}>
          <Step title="Listing" />
          <Step title="Quantity" />
          <Step title="Purchase" />
        </Steps>
      </div>
      <div className="subWrapper">
        {current === 0 && <ListingStep />}
        {current === 1 && <QuantityStep />}
        {current === 2 && <PurchaseStep />}
        <button className="closeButton" onClick={handleCancel}>
          Close <AiOutlineClose className="closeIcon" />
        </button>
      </div>
    </div>
  );
}

export default StepperModal;
