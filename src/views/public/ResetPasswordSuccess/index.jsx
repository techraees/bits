import React from "react";
import { logo } from "../../../assets";
import { Container } from "react-bootstrap";
import { Col, Row } from "antd";

const ResetPasswordSuccess = () => {
  return (
    <div className="container loginContainer py-4">
      <img src={logo} className="logoSize mb-5" alt="logo" />

      <Container>
        <Row>
          <Col span={24}>
            <h5 className="text-white">
              Your new password has been successfully reset!
            </h5>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPasswordSuccess;
