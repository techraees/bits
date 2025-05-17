import React from "react";
import { logo } from "../../../assets";
import { Container } from "react-bootstrap";
import { Button, Col, Input, Row } from "antd";
import { useNavigate } from "react-router-dom";
const ResetPassword = () => {
  let navigate = useNavigate();
  return (
    <div className="container loginContainer py-4">
      <img src={logo} className="logoSize mb-5" alt="logo" />

      <Container>
        <form>
          <Row>
            <Col span={24}>
              <h5 className="text-white">Create new Password</h5>
              <p className="text-white my-4">
                Your new password must be different from previous used
                passwords.
              </p>
            </Col>
          </Row>

          <Row>
            <Col span={6}>
              <label htmlFor="password" className="text-white mb-1">
                New Password
              </label>
              <Input.Password
                name="password"
                placeholder="Password"
                width={100}
              />
              <p className="text-white mt-1" style={{ fontSize: "13px" }}>
                Must be at least 8 characters.
              </p>
            </Col>
          </Row>

          <Row className="my-3">
            <Col span={6}>
              <label htmlFor="confirm-password" className="text-white mb-1">
                Confirm New Password
              </label>
              <Input.Password
                name="confirm-password"
                placeholder="Confirm New Password"
                width={100}
              />
              <p className="text-white mt-1" style={{ fontSize: "13px" }}>
                Both passwords must match.
              </p>
            </Col>
          </Row>

          <Row>
            <Col span={4}>
              <Button
                className="text-uppercase red-background white dashboardBtns px-5 my-3"
                onClick={() => navigate("/reset-password/success")}
              >
                Reset Password
              </Button>
            </Col>
          </Row>
        </form>
      </Container>
    </div>
  );
};

export default ResetPassword;
