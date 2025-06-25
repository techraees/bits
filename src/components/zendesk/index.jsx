import React, { useState } from "react";
import Zendesk, { ZendeskAPI } from "../../zendeskConfig";
import { useEffect } from "react";
import help from "../../assets/images/help.png";

const environment = process.env;

const ZendeskComp = () => {
  const [showChat, setShowChat] = useState(false);

  const handleLoaded = (status) => {
    ZendeskAPI("messenger", status);
  };

  useEffect(() => {
    if (showChat) {
      handleLoaded("open");
    } else {
      handleLoaded("close");
    }
  }, [showChat]);

  return (
    <div>
      <Zendesk
        defer
        zendeskKey={environment.REACT_APP_ZENDESK_KEY}
        onLoaded={handleLoaded}
      />
      <div
        className="img-wrapper"
        onClick={() => {
          setShowChat(!showChat);
        }}
      >
        <img src={help} alt="help_icon" />
      </div>
    </div>
  );
};

export default ZendeskComp;
