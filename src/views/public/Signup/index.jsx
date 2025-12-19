/* eslint-disable no-useless-escape */
import { useLazyQuery, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppKitAccount } from "@reown/appkit/react";
import { Col, Divider, Row, Select } from "antd";
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
import { signInSchema, signUpSchema } from "../../../components/validations";
import { CREATE_USER } from "../../../gql/mutations";
import { GET_PLAYER, LOGIN_USER } from "../../../gql/queries";
import { setCookieStorage } from "../../../utills/cookieStorage";
import "./css/index.css";

const env = process.env;

function Login() {
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

  // sign up checkbox
  const [signUpAgreeCheckbox, setSignUpAgreeCheckbox] = useState(false);
  const [monthsOptions, setMonthsOptions] = useState([]);
  const [daysOptions, setDaysOptions] = useState([]);
  const [yearsOptions, setYearsOptions] = useState([]);

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
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [login, { loading, error: loginError, data: loginData }] = useLazyQuery(
    LOGIN_USER,
    {
      fetchPolicy: "network-only",
    },
  );

  const loginUser = (values) => {
    login({
      variables: {
        email: values.email,
        password: values.password,
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

  const [day, setDay] = useState();
  const [month, setMonth] = useState();
  const [year, setYear] = useState();

  const handleDay = (e) => {
    setDay(e);
  };

  const handleMonth = (e) => {
    setMonth(e);
  };

  const handleYear = (e) => {
    setYear(e);
  };

  useEffect(() => {
    if (loginData) {
      // need to check if LoginUser has linkingInfo
      signInResetValue();

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
  }, [loginData, loginError]);

  // login

  // signUp

  const {
    register: signUpRegister,
    handleSubmit: signUpSubmit,
    setValue: signUpSetValue,
    trigger,
    formState: { errors: signUpFormError },
    watch,
    reset: signUpResetValue,
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      user_name: "",
      full_name: "",
      email: "",
    },
  });

  useEffect(() => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      options.push({
        value: i.toString(),
        label: i < 10 ? `0${i}` : i.toString(),
      });
    }
    setMonthsOptions(options);

    const daysOptions = [];
    for (let i = 1; i <= 31; i++) {
      daysOptions.push({
        value: i.toString(),
        label: i < 10 ? `0${i}` : i.toString(),
      });
    }
    setDaysOptions(daysOptions);

    const optionsYears = [];
    for (let i = 1960; i <= 2024; i++) {
      optionsYears.push({
        value: i.toString(),
        label: i.toString(),
      });
    }
    setYearsOptions(optionsYears);
  }, []);

  const [
    createUser,
    { loading: signUpLoading, error: singUpError, data: signUpData },
  ] = useMutation(CREATE_USER);

  useEffect(() => {
    if (day && month && year) {
      const combined = `${month}/${day}/${year}`;
      const dateFormat = new Date(combined);
      signUpSetValue("dob", dateFormat.toString());
    }
  }, [day, month, year]);

  // signUp useEffect to check if any error

  useEffect(() => {
    if (signUpData) {
      const { CreateUser } = signUpData;

      const { access_token, refresh_token, _id } = CreateUser;

      setCookieStorage("access_token", access_token);
      setCookieStorage("refresh_token", refresh_token);

      // setStorage("token", token);
      // dispatch({
      //   type: "NFT_ADDRESS",
      //   userData: {
      //     address: address,
      //     user_name: user_name,
      //     country: country,
      //     bio: bio,
      //     profileImg: profileImg,
      //     id: _id,
      //     token,
      //     isLogged: true,
      //   },
      // });
      // navigate(`/collections/${_id}`);
      window.location.href = `/collections/${_id}`;

      signUpResetValue();
      signUpSetValue("full_name", "");
      signUpSetValue("email", "");
      signUpSetValue("user_name", "");
      signUpSetValue("dob", "");
      ToastMessage("success", "Account Created Successfully", "success");
    }
    if (singUpError) {
      ToastMessage("error", singUpError?.message, "error");
    }
  }, [signUpData, singUpError]);

  async function signUpHandle(data) {
    if (
      validatePassword(data.password) &&
      validateEmail(data.email) &&
      validateUsername(data.user_name) &&
      validatePhoneNumber(data.phone_number)
    ) {
      const variables = {
        userName: data.user_name,
        email: data.email,
        fullName: data.full_name,
        password: data.password,
        phoneNumber: data.phone_number,
        userAddress: address,
        dob: data.dob,
      };
      createUser({
        variables: variables,
      });
    } else {
      ToastMessage("Error", "Incorrect input format", "error");
    }
  }

  const handleChangeSignUp = (e) => {
    signUpSetValue(e.target.name, e.target.value);
  };

  // get Player
  const [{ loading: playerLoading }] = useLazyQuery(GET_PLAYER, {
    fetchPolicy: "network-only",
  });

  const closeConnectModel = () => {
    setConnectModal(false);
  };

  const forceValidateAndConnect = async () => {
    const isValid = await trigger(); // 🔥 force validate all fields

    if (!isValid) {
      // ToastMessage("Error", "Please fix form errors", "error");
      return;
    }

    // form valid hai
    setConnectModal(true);
  };

  const connectWalletHandle = () => {
    if (!isConnected) {
      setConnectModal(true);
    }
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

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    var regex = /^[a-zA-Z0-9_]+$/;
    if (regex.test(username)) {
      return true;
    } else {
      return false;
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    var regex = /^\d{1,3}\d{5,}$/;
    if (regex.test(phoneNumber)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div style={{ background: "black" }}>
      <ConnectModal visible={connectModal} onClose={closeConnectModel} />
      {playerLoading ||
        signUpLoading ||
        (loading && <Loading content="Loading" />)}

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
            <form>
              <div className="d-flex justify-content-center mb-5">
                <img src={account} alt="" />
                <span className="ms-4 semi-bold fs-5">Create Account</span>
              </div>
              <div className="mb-3">
                <InputComponent
                  placeholder={"Full Name"}
                  name="full_name"
                  ref={signUpRegister}
                  value={watch("full_name")}
                  onChange={handleChangeSignUp}
                  autocomplete="off"
                />
                {signUpFormError.full_name && (
                  <span className="text-danger" style={{ fontSize: "12px" }}>
                    {signUpFormError.full_name.message}
                  </span>
                )}
                <InputComponent
                  placeholder={"User Name"}
                  ref={signUpRegister}
                  name="user_name"
                  value={watch("user_name")}
                  onChange={handleChangeSignUp}
                  autocomplete="off"
                />
                {signUpFormError.user_name && (
                  <span className="text-danger" style={{ fontSize: "12px" }}>
                    {signUpFormError.user_name.message}
                  </span>
                )}
                <InputComponent
                  placeholder={"E-mail"}
                  ref={signUpRegister}
                  name="email"
                  value={watch("email")}
                  onChange={handleChangeSignUp}
                  autocomplete="off"
                />
                {signUpFormError.email && (
                  <span className="text-danger" style={{ fontSize: "12px" }}>
                    {signUpFormError.email.message}
                  </span>
                )}
                <InputComponent
                  password
                  placeholder={"Password"}
                  ref={signUpRegister}
                  name="password"
                  value={watch("password")}
                  onChange={handleChangeSignUp}
                  autocomplete="off"
                />
                {signUpFormError.password && (
                  <span className="text-danger" style={{ fontSize: "12px" }}>
                    {signUpFormError.password.message}
                  </span>
                )}
                <InputComponent
                  placeholder={"Phone number"}
                  ref={signUpRegister}
                  name="phone_number"
                  value={watch("phone_number")}
                  onChange={handleChangeSignUp}
                  autocomplete="off"
                />
                {signUpFormError.phone_number && (
                  <span className="text-danger" style={{ fontSize: "12px" }}>
                    {signUpFormError.phone_number.message}
                  </span>
                )}

                <div className="mt-3">
                  <label> Date of Birth</label>
                  <Row gutter={16}>
                    <Col span={8} className="my-3 mb-2">
                      <Select
                        defaultValue="MM"
                        style={{
                          width: "100%",
                        }}
                        dropdownStyle={{
                          color: "#dcdcdc",
                        }}
                        name="month"
                        className={"black"}
                        onChange={handleMonth}
                        options={monthsOptions}
                      />
                    </Col>

                    <Col span={8} className="my-3 mb-2">
                      <Select
                        defaultValue="DD"
                        style={{
                          width: "100%",
                        }}
                        name="day"
                        className={"black"}
                        onChange={handleDay}
                        options={daysOptions}
                      />
                    </Col>

                    <Col span={8} className="my-3 mb-2">
                      <Select
                        defaultValue="YYYY"
                        style={{
                          width: "100%",
                          color: "black",
                        }}
                        name="year"
                        className={"black"}
                        onChange={handleYear}
                        options={yearsOptions}
                      />
                    </Col>
                  </Row>
                </div>

                <p style={{ fontSize: "12px" }}>
                  Disclaimer: Users must be 18 or older to sign up. Our platform
                  involves buying and selling NFTs with crypto. By proceeding,
                  you confirm you meet the age requirement.
                </p>

                <Divider style={{ border: "1.5px solid #dcdcdc" }} />
              </div>

              <div className="my-2 d-flex" style={{ alignItems: "center" }}>
                <CustomCheckbox
                  active={signUpAgreeCheckbox}
                  setActive={setSignUpAgreeCheckbox}
                />
                <Link to="/privacy-security">
                  <span className="ms-3 light-grey">
                    I agree to BITS’s{" "}
                    <span className="red">Terms & Conditions</span> and{" "}
                    <span className="red">Privacy Policy</span>
                  </span>
                </Link>
              </div>
              <div className="my-2 d-flex" style={{ alignItems: "center" }}>
                <CustomCheckbox
                  active={rememberCheckbox}
                  setActive={setRememberCheckbox}
                />
                <span className="ms-3 light-grey">Remember me</span>
              </div>
              <div className="my-5">
                {!isConnected ? (
                  <ButtonComponent
                    onClick={() => {
                      forceValidateAndConnect();
                    }}
                    text={"CONNECT WALLET"}
                  />
                ) : (
                  <ButtonComponent
                    onClick={signUpSubmit(signUpHandle)}
                    text={"CREATE ACCOUNT"}
                    disabled={!signUpAgreeCheckbox || signUpLoading}
                    loading={signUpLoading}
                  />
                )}
              </div>
              <div className="my-4 d-flex justify-content-center">
                <span>
                  Already have Account?{" "}
                  <Link to={"/login"} className="red cursor">
                    Login
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
                  style={{ cursor: "pointer" }}
                  onClick={openMetaMaskLink}
                  alt=""
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
