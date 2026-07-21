import { notification } from "antd";
import "./index.css";
const ToastMessage = (title, message, type) => {
  const key = title || message || "default_toast";
  notification[type]({
    key,
    message: title,
    description: message,
    duration: 5.2,
  });
};
export default ToastMessage;
