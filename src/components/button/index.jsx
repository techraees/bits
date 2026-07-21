import React from "react";
import "./css/index.css";
import { Button } from "antd";
import { ClipLoader } from "react-spinners";
const ButtonComponent = ({
  text,
  onClick,
  simple,
  height,
  type = "button",
  htmlType,
  radius,
  green,
  width,
  disabled,
  loading = false,
  className = "",
}) => {
  const buttonHtmlType =
    htmlType ||
    (type === "submit" || type === "button" || type === "reset"
      ? type
      : "button");
  const antdType =
    type === "submit" || type === "button" || type === "reset"
      ? "default"
      : type;
  return (
    <>
      {loading ? (
        <Button
          htmlType="button"
          style={{
            width: width ? width : "100%",
          }}
          className="simpleBtnDesign  btnDesign"
          disabled={true}
        >
          <ClipLoader size={15} color="#fff" />
        </Button>
      ) : simple ? (
        <Button
          htmlType={buttonHtmlType}
          type={antdType}
          style={{
            width: width ? width : "100%",
          }}
          onClick={onClick}
          className="simpleBtnDesign red-background"
          disabled={!!disabled}
        >
          {text}
        </Button>
      ) : (
        <Button
          htmlType={buttonHtmlType}
          type={antdType}
          onClick={onClick}
          style={{
            height: height ? height : 50,
            borderRadius: radius ? radius : 20,
            width: width && width,
          }}
          className={`btnDesign ${green ? "green-gradient" : "red-gradient"} ${className}`.trim()}
          disabled={!!disabled}
        >
          {text}
        </Button>
      )}
    </>
  );
};
export default ButtonComponent;
