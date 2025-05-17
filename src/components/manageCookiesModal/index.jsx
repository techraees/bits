import { Button, Col, Modal, Row } from "antd";
import React, { useState } from "react";
import PrivacyModal from "../privacyModal";
import ConcentPreferences from "./ConcentPreferences";
// import './index.css';

const ManageCookiesModal = ({ manageCookies, setManageCookies }) => {
  const [privacyModal, setPrivacyModal] = useState(false);

  const handleCancel = () => {
    setManageCookies(false);
  };

  const openPrivacyModal = () => {
    setPrivacyModal(true);
  };

  return (
    <>
      <Modal
        open={manageCookies}
        onCancel={handleCancel}
        footer={false}
        centered
        width={"70%"}
        bodyStyle={{
          backgroundColor: "#f3f3f3",
          color: "black",
          borderRadius: "20px",
          height: 850,
          overflowY: "scroll",
        }}
        className="privacy-policy-modal"
      >
        <Row className="px-3">
          <Col span={24} className="text-center">
            <h4 className="fw-bold">Cookie Preferences</h4>
          </Col>
        </Row>

        <Row className="px-3">
          <Col span={24}>
            <p className="fs-6">
              When you visit our website, we store cookies on your browser to
              collect information. The information collected might relate to
              you, your preferences or your device, and is mostly used to make
              the site work as you expect it to and to provide a more
              personalized web experience. However, you can choose not to allow
              certain types of cookies, which may impact your experience of the
              site and the services we are able to offer. Click on the different
              category headings to find out more and change our default settings
              according to your preference. You cannot opt-out of our First
              Party Strictly Necessary Cookies as they are deployed in order to
              ensure the proper functioning of our website (such as prompting
              the cookie banner and remembering your settings, to log into your
              account, to redirect you when you log out, etc.). For more
              information about the First and Third Party Cookies used please
              follow this link:{" "}
              <span
                style={{
                  color: "#B83131",
                  fontWeight: "600",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={openPrivacyModal}
              >
                Privacy Policy
              </span>
            </p>

            <Button className="text-uppercase red-background white dashboardBtns px-5 my-3">
              Allow All
            </Button>

            <ConcentPreferences />
          </Col>
        </Row>
      </Modal>

      {privacyModal && (
        <PrivacyModal
          privacyModal={privacyModal}
          setPrivacyModal={setPrivacyModal}
        />
      )}
    </>
  );
};

export default ManageCookiesModal;
