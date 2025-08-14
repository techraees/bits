import React, { useEffect, useState } from "react";
import Zendesk, { ZendeskAPI } from "../../zendeskConfig";
import help from "../../assets/images/help.png";

const environment = process.env;

const ZendeskComp = () => {
  console.log(environment.REACT_APP_ZENDESK_KEY);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLoaded = () => {
    ZendeskAPI("messenger", "hide");
    ZendeskAPI("messenger", "close");
    setReady(true);
  };

  useEffect(() => {
    if (!ready) return;
    if (open) {
      ZendeskAPI("messenger", "show");
      ZendeskAPI("messenger", "open");
    } else {
      ZendeskAPI("messenger", "close");
      ZendeskAPI("messenger", "hide");
    }
  }, [open, ready]);

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
          setOpen((v) => !v);
        }}
      >
        <img src={help} alt="help_icon" />
      </div>
    </div>
  );
};

export default ZendeskComp;
