import React from "react";

import { Modal, Row, Col } from "antd";
import "./css/index.css";
import { useSelector } from "react-redux";

const QrCodeModal = ({ visible, onClose, qrCode }) => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);

  return (
    <Modal
      footer={null}
      className={`${backgroundTheme} qrModal`}
      bodyStyle={{ backgroundColor: "#222222" }}
      open={visible}
      onOk={onClose}
      onCancel={onClose}
    >
      <div>
        <Row className=" ms-3 py-3" gutter={{ xs: 8, sm: 16, md: 20, lg: 32 }}>
          <Col>
            <p className={`${textColor} fs-5 text-center m-0`}>
              Please Close Modal After Scanning QR Code
            </p>
            <img className="mt-3" src={qrCode} width={400} height={400}></img>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default QrCodeModal;
