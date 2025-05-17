import { Button, Col, Collapse, Row, Switch } from "antd";
import React, { useState } from "react";
import "./index.css";

const { Panel } = Collapse;

const ConcentPreferences = () => {
  const [expandIconPosition] = useState("end");
  const [isTargetingCookiesChecked, setIsTargetingCookiesChecked] =
    useState(true);
  const [isSocialMediaCookiesChecked, setIsSocialMediaCookiesChecked] =
    useState(false);

  const onChange = () => {};

  const onToggleTargetingCookies = (checked) => {
    setIsTargetingCookiesChecked(checked);
  };

  const onToggleSocialMediaCookies = (checked) => {
    setIsSocialMediaCookiesChecked(checked);
  };

  const genExtra = (type) => {
    let isChecked, onChangeHandler;

    if (type === "targeting") {
      isChecked = isTargetingCookiesChecked;
      onChangeHandler = onToggleTargetingCookies;
    } else if (type === "social") {
      isChecked = isSocialMediaCookiesChecked;
      onChangeHandler = onToggleSocialMediaCookies;
    }

    return (
      <Switch
        checked={isChecked}
        onChange={onChangeHandler}
        className={`${isChecked ? "switchBtnStyle" : ""}`}
      />
    );
  };

  return (
    <>
      <Collapse
        defaultActiveKey={["1"]}
        onChange={onChange}
        expandIconPosition={expandIconPosition}
      >
        <Panel
          header="Performance Cookies"
          key="1"
          extra={
            <div className="fw-bold" style={{ color: "#4161B8" }}>
              Always Active
            </div>
          }
        >
          <div>
            These cookies could be established via our website by our
            advertising associates. These entities may employ them to construct
            a profile of your preferences and present you with pertinent
            advertisements on external websites. They do not directly retain
            personal information but instead rely on distinctive identifiers for
            your web browser and internet device. Opting not to permit these
            cookies may result in a reduction in the level of personalized
            advertising you encounter.
          </div>
        </Panel>
        <Panel
          header="Functional Cookies"
          key="2"
          extra={
            <div className="fw-bold" style={{ color: "#4161B8" }}>
              Always Active
            </div>
          }
        >
          <div>
            These cookies enable the website to provide enhanced functionality
            and personalisation. They may be set by us or by third party
            providers whose services we have added to our pages. If you do not
            allow these cookies then some or all of these services may not
            function properly.
          </div>
        </Panel>
        <Panel
          header="Strictly Necessary Cookies"
          key="3"
          extra={
            <div className="fw-bold" style={{ color: "#4161B8" }}>
              Always Active
            </div>
          }
        >
          <div>
            These cookies are essential for the proper functioning of the
            website and cannot be deactivated in our systems. They are typically
            activated in response to actions you take, such as configuring your
            privacy settings, logging in, or completing forms, which essentially
            constitute requests for specific services. While you have the option
            to configure your browser to block or notify you regarding these
            cookies, please be aware that doing so may result in certain parts
            of the site becoming non-operational. Importantly, these cookies do
            not retain any personally identifiable information.
          </div>
        </Panel>

        <Panel header="Targeting Cookies" key="4" extra={genExtra("targeting")}>
          <div>
            These cookies might be placed on our website by our advertising
            partners. These companies may utilize them to create a profile of
            your interests, enabling the display of pertinent advertisements on
            other websites. While they don't store personal information
            directly, they rely on uniquely identifying your browser and
            internet device. Opting out of these cookies may result in less
            personalized advertising for you.
          </div>
        </Panel>

        <Panel header="Social Media Cookies" key="5" extra={genExtra("social")}>
          <div>
            These cookies are established by various social media services
            integrated into our site, facilitating the sharing of our content
            with your friends and networks. They have the ability to trace your
            browser's activity across other websites, forming a profile based on
            your interests. This could influence the content and messages
            displayed on other websites you visit. If you opt not to permit
            these cookies, you may be unable to utilize or view these sharing
            tools.
          </div>
        </Panel>
      </Collapse>

      <Row>
        <Col span={24} className="d-flex justify-content-end">
          <Button className="text-uppercase red-background white dashboardBtns px-5 my-3">
            REJECT ALL
          </Button>
          <Button className="text-uppercase red-background white dashboardBtns px-5 my-3 ms-2">
            CONFIRM MY CHOICES
          </Button>
        </Col>
      </Row>
    </>
  );
};
export default ConcentPreferences;
