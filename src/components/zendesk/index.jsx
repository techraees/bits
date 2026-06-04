import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Zendesk, { ZendeskAPI } from "../../zendeskConfig";
import help from "../../assets/images/help.png";

const environment = process.env;

const ZendeskComp = () => {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLoaded = () => {
    // console.log("Zendesk script loaded, hiding webWidget");
    ZendeskAPI("webWidget", "hide");
    setReady(true);
  };

  useEffect(() => {
    // console.log("Zendesk open state changed:", open, "ready:", ready);
    if (!ready) return;
    if (open) {
      // console.log("Opening webWidget...");
      ZendeskAPI("webWidget", "show");
      setTimeout(() => ZendeskAPI("webWidget", "open"), 150);
    } else {
      // console.log("Closing webWidget...");
      ZendeskAPI("webWidget", "close");
      setTimeout(() => ZendeskAPI("webWidget", "hide"), 150);
    }
  }, [open, ready]);

  return (
    <>
      <Zendesk
        defer
        zendeskKey={
          environment.REACT_APP_ZENDESK_KEY ||
          process.env.REACT_APP_ZENDESK_KEY ||
          "7666164b-b463-442f-9179-b7ec57bd3c1b"
        }
        onLoaded={handleLoaded}
      />

      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            className="img-wrapper"
            onClick={() => {
              setOpen((v) => !v);
            }}
            style={{ zIndex: 9999999 }}
          >
            <img src={help} alt="help_icon" />
          </div>,
          document.body,
        )}
    </>
  );
};

export default ZendeskComp;
