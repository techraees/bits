import React from "react";
import { Input } from "antd";
import "./css/index.css";

const InputComponent = ({
  placeholder,
  value,
  name,
  onChange,
  password,
  error,
  inputRef,
  ...rest
}) => {
  return (
    <div>
      {password ? (
        <Input.Password
          {...rest}
          ref={inputRef}
          placeholder={placeholder}
          className={`inputStyle regular ${error ? "inputStyleError" : ""}`}
          visibilityToggle={false}
          onChange={onChange}
          name={name}
          value={value}
          autoComplete="new-password"
        />
      ) : (
        <Input
          {...rest}
          ref={inputRef}
          placeholder={placeholder}
          className={`inputStyle regular ${error ? "inputStyleError" : ""}`}
          name={name}
          onChange={onChange}
          value={value}
          autoComplete="new-password"
        />
      )}
    </div>
  );
};

export default InputComponent;
