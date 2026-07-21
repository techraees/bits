import { useLazyQuery } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../../../assets";
import {
  ButtonComponent,
  CustomCheckbox,
  ToastMessage,
} from "../../../components";
import ConnectModal from "../../../components/connectModal";
import Loading from "../../../components/loaders/loading";
import { signInSchema } from "../../../components/validations";
import { GET_PLAYER, LOGIN_USER } from "../../../gql/queries";
import { setCookieStorage } from "../../../utills/cookieStorage";
import ReCAPTCHA from "react-google-recaptcha";
import { Input } from "antd";
import { FiMail, FiLock } from "react-icons/fi";
import "./css/index.css";
function Login() {
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const dispatch = useDispatch();
  const { address, isConnected } = useAppKitAccount();
  const { web3, account } = useSelector((state) => state.web3.walletData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const [connectModal, setConnectModal] = useState(false);
  const [rememberCheckbox, setRememberCheckbox] = useState(false);
  let navigate = useNavigate();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset: signInResetValue,
  } = useForm({
    resolver: yupResolver(signInSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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
    if (!recaptchaToken) {
      ToastMessage(" reCAPTCHA not loaded yet", "", "error");
      return;
    }
    login({
      variables: {
        email: values.email,
        password: values.password,
        recaptchaToken: recaptchaToken,
      },
    }).catch(() => {});
  };
  function onSubmit(data) {
    loginUser(data);
  }
  useEffect(() => {
    if (loginData) {
      const { LoginUser } = loginData;
      const { access_token, refresh_token } = LoginUser;
      setCookieStorage("access_token", access_token);
      setCookieStorage("refresh_token", refresh_token);
      window.dispatchEvent(new Event("storageChange"));
      navigate("/");
    }
    if (loginError) {
      ToastMessage(loginError?.message || "Sign in failed", "", "error");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  }, [loginData, loginError, rememberCheckbox]);
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
    <div className={`login-page-wrapper ${backgroundTheme}`}>
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      {playerLoading || (loading && <Loading content="Loading" />)}

      <div className="container loginContainer">
        <div className="d-flex justify-content-center mb-4">
          <Link to="/">
            <img src={logo} className="logoSize" alt="logo" />
          </Link>
        </div>
        <div
          className="d-flex formMobView"
          style={{
            width: "100%",
          }}
        >
          <div className="formContainer">
            <form autoComplete="on">
              <h2
                className="text-center mb-4 text-white font-weight-bold"
                style={{
                  fontSize: "28px",
                  letterSpacing: "0.5px",
                }}
              >
                Sign in
              </h2>

              <div className="metamask-banner">
                <span>
                  Must have a{" "}
                  <span
                    className="login-metamask-link"
                    onClick={openMetaMaskLink}
                  >
                    MetaMask
                  </span>{" "}
                  to use the platform
                </span>
              </div>

              <div className="mb-4">
                <div className="login-input-group">
                  <label className="login-input-label">Email</label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <Input
                        {...field}
                        ref={ref}
                        placeholder="Email"
                        prefix={<FiMail className="login-input-icon" />}
                        className={`login-input-field ${errors.email ? "login-input-field-error" : ""}`}
                        autoComplete="username"
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="login-error-text">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="login-input-group mt-4">
                  <label className="login-input-label">Password</label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <Input.Password
                        {...field}
                        ref={ref}
                        placeholder="Password"
                        prefix={<FiLock className="login-input-icon" />}
                        className={`login-input-field ${errors.password ? "login-input-field-error" : ""}`}
                        autoComplete="current-password"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    )}
                  />
                  {errors.password && (
                    <span className="login-error-text">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="my-3 d-flex align-items-center">
                <CustomCheckbox
                  active={rememberCheckbox}
                  setActive={setRememberCheckbox}
                />
                <span
                  className="ms-2 remember-me-text"
                  onClick={() => setRememberCheckbox(!rememberCheckbox)}
                >
                  Remember me?
                </span>
              </div>

              <div className="my-4">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCH_SITE_KEY}
                  onChange={(t) => setRecaptchaToken(t)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>

              <div className="my-4">
                <ButtonComponent
                  onClick={handleSubmit(onSubmit)}
                  text={"SIGN IN"}
                  radius={8}
                />
              </div>

              <div className="mt-4 text-center">
                <span className="footer-text">
                  Don't have an account?{" "}
                  <Link to={"/signup"} className="footer-link">
                    Signup
                  </Link>
                </span>
              </div>

              <div className="mt-3 text-center">
                <Link to="/forgot-password" className="footer-link">
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
