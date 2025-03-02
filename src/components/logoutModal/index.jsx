import React from "react";
import "./css/index.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutWallet } from "../../store/actions";
import { removeStorage } from "../../utills/localStorage";
function LogoutModal({ handleOk }) {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.address.userData);
  const dispatch = useDispatch();
  const address = userData?.address;
  const full_name = userData?.full_name;

  const logoutHandle = () => {
    dispatch({
      type: "USER_AUTH_RESET",
      userData: {
        address: "",
        full_name: "",
        country: "",
        bio: "",
        profileImg: "",
        id: "",
        token: "",
        isLogged: false,
      },
    });
    removeStorage("token");
    dispatch(logoutWallet());
    handleOk();
    window.location.href = '/'
    // navigate("/login");
  };

  return (
    <div className="logoutModal">
      <div className="flexDiv firstDiv">
        <p className="logOutText">User Name</p>
        <p className="logOutvalue">{full_name}</p>
      </div>
      <div className="flexDiv">
        <p className="logOutText">Wallet Address</p>
        <p
          className="logOutvalue"
          onClick={() => {
            navigator.clipboard.writeText(address);
          }}
          style={{
            cursor: "pointer",
          }}
        >
          {address.slice(0, 4)}...{address.slice(37, address.length)}
        </p>
      </div>

      <div className="btnDiv">
        <button className="logOutBtn" onClick={logoutHandle}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default LogoutModal;
