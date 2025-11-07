/* eslint-disable no-useless-escape */
import { useLazyQuery } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logo, metamaskwithmascot } from "../../../assets";
import {
  ButtonComponent,
  CustomCheckbox,
  InputComponent,
  ToastMessage,
} from "../../../components";
import ConnectModal from "../../../components/connectModal";
import ForgotPassModal from "../../../components/ForgotPassModal";
import Loading from "../../../components/loaders/loading";
import { signInSchema } from "../../../components/validations";
import { GET_PLAYER, LOGIN_USER } from "../../../gql/queries";
import { setCookieStorage } from "../../../utills/cookieStorage";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import "./css/index.css";

const env = process.env;

function Login() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const dispatch = useDispatch();
  const { address, isConnected } = useAppKitAccount();

  const { web3, account } = useSelector((state) => state.web3.walletData);
  const [connectModal, setConnectModal] = useState(false);
  const [forgotPassModal, setForgotPassModal] = useState(false);
  const [step, setStep] = useState(1);
  const [id, setId] = useState(null);
  const [token, setToken] = useState(null);

  // sign in checkbox
  const [rememberCheckbox, setRememberCheckbox] = useState(false);

  let navigate = useNavigate();

  //login
  const {
    register,
    handleSubmit,
    setValue,
    watch: signWatch,
    formState: { errors },
    reset: signInResetValue,
  } = useForm({
    resolver: yupResolver(signInSchema),
  });

  const [login, { loading, error: loginError, data: loginData }] = useLazyQuery(
    LOGIN_USER,
    {
      fetchPolicy: "network-only",
    },
  );

  const loginUser = async (values) => {
    if (rememberCheckbox) {
      localStorage.setItem("rememberEmail", values.email);
      localStorage.setItem("rememberPassword", values.password);
    } else {
      localStorage.removeItem("rememberEmail");
      localStorage.removeItem("rememberPassword");
    }

    if (!executeRecaptcha) {
      ToastMessage("⚠️ reCAPTCHA not loaded yet", "", "error");
      return;
    }

    const token = await executeRecaptcha("form_submit");

    login({
      variables: {
        email: values.email,
        password: values.password,
        recaptchaToken: token,
      },
    }).catch((err) => {
      console.log("errr", err);
    });
  };

  function onSubmit(data) {
    loginUser(data);
  }

  const handleChange = (e) => {
    setValue(e.target.name, e.target.value);
  };

  useEffect(() => {
    if (loginData) {
      // need to check if LoginUser has linkingInfo
      const { LoginUser } = loginData;
      const { access_token, refresh_token } = LoginUser;

      setCookieStorage("access_token", access_token);
      setCookieStorage("refresh_token", refresh_token);

      // dispatch({
      //   type: "NFT_ADDRESS",
      //   userData: {
      //     address: user_address,
      //     full_name: full_name,
      //     country: country,
      //     bio: bio,
      //     profileImg: profileImg,
      //     id,
      //     token,
      //     isLogged: true,
      //   },
      // });

      // navigate("/");
      window.location.href = "/";
    }
    if (loginError) {
      ToastMessage("Sign in Error", loginError?.message, "error");
    }
  }, [loginData, loginError, rememberCheckbox]);

  // get Player
  const [{ loading: playerLoading }] = useLazyQuery(GET_PLAYER, {
    fetchPolicy: "network-only",
  });

  const closeConnectModel = () => {
    setConnectModal(false);
  };
  const openMetaMaskLink = () => {
    window.open("https://metamask.io/", "_blank");
  };

  useEffect(() => {
    if (isConnected) {
      setConnectModal(false);
    }
  }, [isConnected]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    const fetchData = async () => {
      if (searchParams.get("id") && searchParams.get("token")) {
        const id = searchParams.get("id");
        const token = searchParams.get("token");
        setId(id);
        setToken(token);
        const res = await sendToken(id, token);
        if (res.success) {
          setStep(3);
          setForgotPassModal(true);
        } else {
          ToastMessage("Error", res.message, "error");
        }
      }
    };
    fetchData();
  }, [searchParams.get("token")]);

  const handleOpenForgotPass = () => {
    setForgotPassModal(true);
  };

  const handleCloseForgotPass = () => {
    setForgotPassModal(false);
  };

  const sendToken = async (id, token) => {
    const body = {
      data: {
        id: id,
        token: token,
      },
    };

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${env.REACT_APP_BACKEND_BASE_URL}/verify-token`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return data;
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedPassword = localStorage.getItem("rememberPassword");

    if (savedEmail && savedPassword) {
      setValue("email", savedEmail);
      setValue("password", savedPassword);
      setRememberCheckbox(true);
    }
  }, [setValue]);

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setValue("email", saved);
      setRememberCheckbox(true);
    }
  }, []);

  return (
    <div style={{ background: "black" }}>
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      {playerLoading || (loading && <Loading content="Loading" />)}

      {forgotPassModal && (
        <ForgotPassModal
          visible={forgotPassModal}
          onClose={handleCloseForgotPass}
          setStep={setStep}
          step={step}
          id={id}
          token={token}
          handleCloseForgotPass={handleCloseForgotPass}
        />
      )}

      <div className="container loginContainer py-4">
        <img src={logo} className="logoSize mb-5" alt="logo" />
        <div className="d-flex formMobView" style={{ width: "100%" }}>
          <div className="formContainer">
            <form autoComplete="on">
              <div className="d-flex justify-content-center mb-5">
                <img src={account} alt="" />
                <span className="ms-4 semi-bold fs-5">Sign in</span>
              </div>
              <div className="mb-5">
                <InputComponent
                  placeholder={"E-mail"}
                  name="email"
                  ref={register}
                  autoComplete="username"
                  onChange={handleChange}
                  value={signWatch("email")}
                />
                {errors.email && <span>{errors.email.message}</span>}

                <input
                  placeholder={"Password"}
                  type="password"
                  name="password"
                  ref={register}
                  onChange={handleChange}
                  value={signWatch("password")}
                  autoComplete="current-password"
                  {...register("password")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSubmit(onSubmit)();
                    }
                  }}
                />
                {errors.password && <span>{errors.password.message}</span>}
              </div>
              <div className="my-2 d-flex" style={{ alignItems: "center" }}>
                <CustomCheckbox
                  active={rememberCheckbox}
                  setActive={setRememberCheckbox}
                />
                <span className="ms-3 light-grey">Remember me</span>
              </div>
              <div className="my-5">
                <ButtonComponent
                  onClick={handleSubmit(onSubmit)}
                  text={"SIGN IN"}
                />
              </div>
              <div className="my-4 d-flex justify-content-center">
                <span className="red cursor" onClick={handleOpenForgotPass}>
                  Forgot Password?
                </span>
              </div>
              <div className="my-4 d-flex justify-content-center">
                <span>
                  Don't have account?{" "}
                  <Link to={"/signup"} className="red cursor">
                    Signup
                  </Link>
                </span>
              </div>
              <div className="my-2 d-flex justify-content-center">
                <span>
                  Must have a{" "}
                  <span
                    style={{
                      color: "#F5841E",
                      cursor: "pointer",
                    }}
                    onClick={openMetaMaskLink}
                  >
                    MetaMask
                  </span>{" "}
                  wallet to use the platform
                </span>
              </div>
              <div className="d-flex justify-content-center">
                <img
                  src={metamaskwithmascot}
                  alt=""
                  style={{ cursor: "pointer" }}
                  onClick={openMetaMaskLink}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
