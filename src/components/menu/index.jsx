import React, { useState, useEffect } from "react";
import "./css/index.css";
import { Menu, Tooltip } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { UploadVideoModal } from "../../components";
import { useSelector } from "react-redux";
import routes from "../../route";

const MenuComponent = ({ menuHandle, className }) => {
  const { userData } = useSelector((state) => state.address.userData);
  const [uploadVideoModal, setUploadVideoModal] = useState(false);
  const isLogged = userData?.isLogged;

  let navigate = useNavigate();
  let location = useLocation();

  const [width, setWidth] = useState(window.innerWidth);
  console.log({ width });
  const handleCreateNFT = () => {
    if (isLogged) {
      setUploadVideoModal(true);
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const getItems = () => {
    const result = [];
    const belongsToMap = {};

    routes.forEach((route) => {
      if (route.isNav) {
        const iconElement = route.icon ? (
          <img src={route.icon} alt={route.name} />
        ) : null;
        let labelElement = route.name;
        if (route?.layout === "private" && !isLogged) return;
        // Check if route is not visible
        if (route.isDisabled) {
          labelElement = (
            <Tooltip title={`${route.name} (Coming Soon)`} placement="right">
              <div style={{ cursor: "not-allowed" }}>{route.name}</div>
            </Tooltip>
          );
        }

        const routeItem = {
          icon: iconElement,
          key: route?.key,
          label: route.isDisabled ? (
            <Tooltip title={`${route.name} (Coming Soon)`} placement="right">
              <div style={{ cursor: "not-allowed" }}>{route.name}</div>
            </Tooltip>
          ) : (
            labelElement
          ),
        };

        if (route.belongsTo) {
          if (!belongsToMap[route.belongsTo]) {
            belongsToMap[route.belongsTo] = {
              label: route.belongsTo,
              children: [],
              icon: <img src={route.belongsToIcon} alt={route.belongsTo} />,
              key: routes?.length + Math.random(),
            };
            result.push(belongsToMap[route.belongsTo]);
          }
          belongsToMap[route.belongsTo].children.push(routeItem);
        } else {
          result.push(routeItem);
        }
      }
    });

    return result;
  };

  const handleClick = (key) => {
    const route = routes?.find((route) => route?.key === parseInt(key));
    if (route.isDisabled) return;
    if (key === "100") return handleCreateNFT();
    if (key === "10") return navigate(`/collections/${userData?.id}`);
    return navigate(route?.path);
  };
  const getSelectedKey = () => {
    return JSON.stringify(
      routes?.find((route) => route?.path === location?.pathname)?.key,
    );
  };

  return (
    <div
      style={{
        zIndex: 1,
        position: "fixed",
        // top: width < 600 ? "70px" : "",
        top: "70px",
      }}
      className={className}
    >
      <UploadVideoModal
        visible={uploadVideoModal}
        onClose={() => setUploadVideoModal(false)}
      />
      <Menu
        defaultSelectedKeys={[getSelectedKey()]}
        className="manuStyle"
        mode="inline"
        theme="dark"
        inlineCollapsed={menuHandle}
        items={getItems()}
        onClick={(item) => handleClick(item?.key)}
        onSelect={(item) => handleClick(item?.key)}
      />
    </div>
  );
};

export default MenuComponent;
