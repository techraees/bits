import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import Zendesk, { ZendeskAPI } from "../../zendeskConfig";
import help from "../../assets/images/help.png";
const ZENDESK_KEY = process.env.REACT_APP_ZENDESK_KEY;
const ZendeskComp = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const handleLoaded = useCallback(() => {
    ZendeskAPI("webWidget", "hide");
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && window.zE) {
      ZendeskAPI("webWidget", "hide");
      setIsLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    if (open) {
      ZendeskAPI("webWidget", "show");
      ZendeskAPI("webWidget", "open");
    } else {
      ZendeskAPI("webWidget:on", "close", () => {
        ZendeskAPI("webWidget", "hide");
      });
      ZendeskAPI("webWidget", "close");
    }
  }, [open, isLoaded]);
  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);
  if (!ZENDESK_KEY) {
    return null;
  }
  return (
    <>
      <Zendesk defer zendeskKey={ZENDESK_KEY} onLoaded={handleLoaded} />

      {typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            className="img-wrapper"
            onClick={handleToggle}
            style={{
              zIndex: 9999999,
            }}
          >
            <img src={help} alt="help_icon" />
          </div>,
          document.body,
        )}
    </>
  );
};
export default ZendeskComp;
