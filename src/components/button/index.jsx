import React from "react";
import "./css/index.css";
import { Button } from "antd";
import { ClipLoader } from "react-spinners";

const ButtonComponent = ({
  text,
  onClick,
  simple,
  height,
  type = "submit",
  radius,
  green,
  width,
  disabled,
  loading = false,
}) => {
  // console.log("disa", disabled);
  return (
    <>
      {loading ? (
        <Button
          type={"button"}
          style={{ width: width ? width : "100%" }}
          className="simpleBtnDesign  btnDesign"
          disabled={true}
        >
          <ClipLoader size={15} color="#fff" />
        </Button>
      ) : simple ? (
        <Button
          type={type}
          style={{ width: width ? width : "100%" }}
          onClick={onClick}
          className="simpleBtnDesign red-background"
        >
          {text}
        </Button>
      ) : (
        <Button
          type={type}
          onClick={onClick}
          style={{
            height: height ? height : 50,
            borderRadius: radius ? radius : 20,
            width: width && width,
          }}
          className={`btnDesign ${green ? "green-gradient" : "red-gradient"}`}
          disabled={disabled && true}
        >
          {text}
        </Button>
      )}
    </>
  );
};

export default ButtonComponent;
