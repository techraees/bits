import React from "react";
const ErrorMessage = ({ message, className }) => {
  if (!message) return null;
  return (
    <div className={className}>
      <p
        style={
          className
            ? undefined
            : {
                textAlign: "start",
                color: "#d54343",
                marginBottom: 0,
                fontSize: 12,
              }
        }
      >
        {message}
      </p>
    </div>
  );
};
export default ErrorMessage;
