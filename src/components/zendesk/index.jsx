import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Zendesk, { ZendeskAPI } from "../../zendeskConfig";
import help from "../../assets/images/help.png";

const environment = process.env;

const ZendeskComp = () => {
  const [ready, setReady] = useState(
    typeof window !== "undefined" && !!window.zE,
  );
  const [open, setOpen] = useState(false);

  const handleLoaded = () => {
    // console.log("Zendesk script loaded, hiding webWidget");
    ZendeskAPI("webWidget", "hide");
    setReady(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.zE) {
      setReady(true);
      ZendeskAPI("webWidget", "hide");
    }
  }, []);

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
        zendeskKey={"7666164b-b463-442f-9179-b7ec57bd3c1b"}
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
