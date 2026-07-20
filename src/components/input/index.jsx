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
  const className = `inputStyle regular ${error ? "inputStyleError" : ""}`;
  return <div className="inputComponentRoot">
      <div className="inputIosNoZoom">
        {password ? <Input.Password {...rest} ref={inputRef} placeholder={placeholder} className={className} visibilityToggle={false} onChange={onChange} name={name} value={value} autoComplete="new-password" /> : <Input {...rest} ref={inputRef} placeholder={placeholder} className={className} name={name} onChange={onChange} value={value} autoComplete="new-password" />}
      </div>
    </div>;
};
export default InputComponent;
