import { Switch } from "antd";
import { useDispatch } from "react-redux";
import "./css/index.css";

const SwitchBtn = ({
  toggleBtn
}) => {
  const dispatch = useDispatch();
  function onChange(checked) {
    const theme = {
      backgroundTheme: `${checked ? "black-background" : "light-background"}`,
      headerTheme: `${checked ? "black-background2" : "white-navbar"}`,
      textColor: `${checked ? "white" : "black"}`,
      textColor2: `${checked ? "light-grey" : "dark-grey"}`,
      textColor3: `${checked ? "white" : "red"}`,
      bgColor: `${checked ? "dark-grey-bg" : "white2"}`,
      bgColor2: `${checked ? "" : "light-background2"}`,
      bgColor3: `${checked ? "black-background3" : "light-background3"}`,
      border: `${checked ? "dark-border" : "light-border"}`
    };
    try {
      localStorage.setItem("bits-theme", JSON.stringify(theme));
    } catch (e) {}
    dispatch({
      type: "THEME",
      theme
    });
  }
  return <Switch checked={toggleBtn} className="switchBtnStyle" onChange={onChange} />;
};

export default SwitchBtn;
