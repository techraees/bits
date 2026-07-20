import { useLazyQuery, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppKitAccount } from "@reown/appkit/react";
import { Input, Select } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import PhoneInputRPI2 from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { logo } from "../../../assets";
import {
  ButtonComponent,
  CustomCheckbox,
  ToastMessage
} from "../../../components";
import PasswordRequirements from "../../../components/PasswordRequirements";
import Loading from "../../../components/loaders/loading";
import {
  isPasswordValid,
  PASSWORD_FORMAT_ERROR_MESSAGE,
  signUpSchema
} from "../../../components/validations";
import { CREATE_USER } from "../../../gql/mutations";
import { GET_PLAYER } from "../../../gql/queries";
import { useWalletGateFlow } from "../../../hooks/useWalletGateFlow";
import { setCookieStorage } from "../../../utills/cookieStorage";
import "../Login/css/index.css";
import "./css/index.css";

function SignUp() {
  const { address, isConnected } = useAppKitAccount();
  const { openAppKitConnect } = useWalletGateFlow();
  const backgroundTheme = useSelector(state => state.app.theme.backgroundTheme);
  const [rememberCheckbox, setRememberCheckbox] = useState(false);
  const [signUpAgreeCheckbox, setSignUpAgreeCheckbox] = useState(false);
  const [monthsOptions, setMonthsOptions] = useState([]);
  const [daysOptions, setDaysOptions] = useState([]);
  const [yearsOptions, setYearsOptions] = useState([]);
  const [phoneCountry, setPhoneCountry] = useState("us");
  const [phoneDialCode, setPhoneDialCode] = useState("1");
  const [day, setDay] = useState();
  const [month, setMonth] = useState();
  const [year, setYear] = useState();

  const {
    control,
    handleSubmit: signUpSubmit,
    setValue: signUpSetValue,
    trigger,
    formState: { errors: signUpFormError, isValid: isSignUpFormValid },
    watch,
    reset: signUpResetValue
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      user_name: "",
      full_name: "",
      email: "",
      password: "",
      phone_number: "",
      dob: ""
    }
  });

  useEffect(() => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      options.push({
        value: i.toString(),
        label: i < 10 ? `0${i}` : i.toString()
      });
    }
    setMonthsOptions(options);

    const nextDays = [];
    for (let i = 1; i <= 31; i++) {
      nextDays.push({
        value: i.toString(),
        label: i < 10 ? `0${i}` : i.toString()
      });
    }
    setDaysOptions(nextDays);

    const optionsYears = [];
    for (let i = 1960; i <= 2024; i++) {
      optionsYears.push({
        value: i.toString(),
        label: i.toString()
      });
    }
    setYearsOptions(optionsYears);
  }, []);

  const [createUser, { loading: signUpLoading, data: signUpData }] =
    useMutation(CREATE_USER);

  useEffect(() => {
    if (day && month && year) {
      const combined = `${month}/${day}/${year}`;
      const dateFormat = new Date(combined);
      signUpSetValue("dob", dateFormat.toString(), {
        shouldValidate: true
      });
    }
  }, [day, month, year, signUpSetValue]);

  useEffect(() => {
    if (signUpData) {
      const { CreateUser } = signUpData;
      const { access_token, refresh_token, _id } = CreateUser;
      setCookieStorage("access_token", access_token);
      setCookieStorage("refresh_token", refresh_token);
      window.location.href = `/collections/${_id}`;
      signUpResetValue();
      ToastMessage("success", "Account Created Successfully", "success");
    }
  }, [signUpData, signUpResetValue]);

  async function signUpHandle(data) {
    if (
      isPasswordValid(data.password) &&
      validateEmail(data.email) &&
      validateUsername(data.user_name) &&
      validatePhoneNumber(data.phone_number)
    ) {
      createUser({
        variables: {
          userName: data.user_name,
          email: data.email,
          fullName: data.full_name,
          password: data.password,
          phoneNumber: data.phone_number,
          userAddress: address,
          dob: data.dob
        }
      });
    } else {
      await trigger();
    }
  }

  const [{ loading: playerLoading }] = useLazyQuery(GET_PLAYER, {
    fetchPolicy: "network-only"
  });

  const forceValidateAndConnect = async (e) => {
    e?.currentTarget?.blur?.();
    const isValid = await trigger();
    if (!isValid || !signUpAgreeCheckbox) {
      return;
    }
    await openAppKitConnect();
  };

  const handleCreateAccountClick = async (e) => {
    e?.currentTarget?.blur?.();
    const isValid = await trigger();
    if (!isValid || !signUpAgreeCheckbox || signUpLoading) {
      return;
    }
    await signUpSubmit(signUpHandle)();
  };

  const openMetaMaskLink = () => {
    window.open("https://metamask.io/", "_blank");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUsername = (username) => /^[a-zA-Z0-9_]+$/.test(username);
  const validatePhoneNumber = (phoneNumber) =>
    phoneNumber ? isValidPhoneNumber(phoneNumber) : false;

  const passwordValue = watch("password") || "";
  const canSubmitAccount =
    isSignUpFormValid && signUpAgreeCheckbox && !signUpLoading;

  return (
    <div className={`login-page-wrapper signup-page-wrapper ${backgroundTheme}`}>
      {(playerLoading || signUpLoading) && <Loading content="Loading" />}

      <div className="container loginContainer">
        <div className="d-flex justify-content-center mb-4">
          <Link to="/">
            <img src={logo} className="logoSize" alt="logo" />
          </Link>
        </div>

        <div className="d-flex formMobView" style={{ width: "100%" }}>
          <div className="formContainer">
            <form autoComplete="on">
              <h2
                className="text-center mb-4 text-white font-weight-bold"
                style={{ fontSize: "28px", letterSpacing: "0.5px" }}
              >
                Create an account
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
                  <label className="login-input-label">
                    <span className="signup-required">*</span> Full Name
                  </label>
                  <Controller
                    name="full_name"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <Input
                        {...field}
                        ref={ref}
                        placeholder="Full Name"
                        prefix={
                          <FiUser
                            className="login-input-icon"
                          />
                        }
                        className={`login-input-field ${
                          signUpFormError.full_name
                            ? "login-input-field-error"
                            : ""
                        }`}
                        autoComplete="name"
                      />
                    )}
                  />
                  {signUpFormError.full_name && (
                    <span className="login-error-text">
                      {signUpFormError.full_name.message}
                    </span>
                  )}
                </div>

                <div className="login-input-group mt-4">
                  <label className="login-input-label">
                    <span className="signup-required">*</span> Username
                  </label>
                  <Controller
                    name="user_name"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <Input
                        {...field}
                        ref={ref}
                        placeholder="Username"
                        prefix={
                          <FiUser
                            className="login-input-icon"
                          />
                        }
                        className={`login-input-field ${
                          signUpFormError.user_name
                            ? "login-input-field-error"
                            : ""
                        }`}
                        autoComplete="username"
                      />
                    )}
                  />
                  {signUpFormError.user_name && (
                    <span className="login-error-text">
                      {signUpFormError.user_name.message}
                    </span>
                  )}
                </div>

                <div className="login-input-group mt-4">
                  <label className="login-input-label">
                    <span className="signup-required">*</span> Email
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <Input
                        {...field}
                        ref={ref}
                        placeholder="Email"
                        prefix={
                          <FiMail
                            className="login-input-icon"
                          />
                        }
                        className={`login-input-field ${
                          signUpFormError.email ? "login-input-field-error" : ""
                        }`}
                        autoComplete="email"
                      />
                    )}
                  />
                  {signUpFormError.email && (
                    <span className="login-error-text">
                      {signUpFormError.email.message}
                    </span>
                  )}
                </div>

                <div className="login-input-group mt-4 signup-password-section">
                  <label className="login-input-label">
                    <span className="signup-required">*</span> Password
                  </label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <Input.Password
                        {...field}
                        ref={ref}
                        placeholder="Password"
                        prefix={
                          <FiLock
                            className="login-input-icon"
                          />
                        }
                        className={`login-input-field ${
                          signUpFormError.password
                            ? "login-input-field-error"
                            : ""
                        }`}
                        autoComplete="new-password"
                      />
                    )}
                  />
                  {signUpFormError.password &&
                    signUpFormError.password.message !==
                      PASSWORD_FORMAT_ERROR_MESSAGE && (
                      <span className="login-error-text">
                        {signUpFormError.password.message}
                      </span>
                    )}
                  <PasswordRequirements password={passwordValue} />
                </div>

                <div className="login-input-group mt-4">
                  <label className="login-input-label">
                    <span className="signup-required">*</span> Phone number
                  </label>
                  <div
                    className={`bits-phone-container${
                      signUpFormError.phone_number
                        ? " bits-phone-container--error"
                        : ""
                    }`}
                    style={{ "--dial-code": `"+${phoneDialCode}"` }}
                  >
                    <PhoneInputRPI2
                      country={phoneCountry}
                      enableSearch={true}
                      disableSearchIcon={true}
                      disableCountryCode={true}
                      countryCodeEditable={false}
                      specialLabel=""
                      placeholder="123 456 789"
                      searchPlaceholder="Search country..."
                      value={(() => {
                        const full = watch("phone_number") || "";
                        const digits = full.replace(/\D/g, "");
                        if (digits.startsWith(phoneDialCode)) {
                          return digits.slice(phoneDialCode.length);
                        }
                        return digits;
                      })()}
                      onChange={(val, data) => {
                        const dial = data?.dialCode || phoneDialCode;
                        const iso = data?.countryCode || phoneCountry;
                        setPhoneDialCode(dial);
                        setPhoneCountry(iso);

                        const digits = String(val || "").replace(/\D/g, "");
                        const national = digits.startsWith(dial)
                          ? digits.slice(dial.length)
                          : digits;
                        const fullNumber = national
                          ? `+${dial}${national}`
                          : `+${dial}`;

                        signUpSetValue("phone_number", fullNumber, {
                          shouldValidate: true
                        });
                      }}
                      containerClass="signup-phone-input"
                      inputClass="signup-phone-input__field"
                      buttonClass="signup-phone-input__flag-btn"
                      dropdownClass="signup-phone-input__dropdown"
                      searchClass="signup-phone-input__search"
                    />
                  </div>
                  {signUpFormError.phone_number && (
                    <span className="login-error-text">
                      {signUpFormError.phone_number.message}
                    </span>
                  )}
                </div>

                <div className="signup-dob-section">
                  <label className="login-input-label signup-dob-label">
                    Date of Birth
                  </label>
                  <div className="signup-dob-row">
                    <Select
                      placeholder="MM"
                      className="signup-dob-select signup-dob-select--mm"
                      dropdownClassName={`signup-dob-dropdown ${backgroundTheme}`}
                      onChange={setMonth}
                      options={monthsOptions}
                    />
                    <Select
                      placeholder="DD"
                      className="signup-dob-select signup-dob-select--dd"
                      dropdownClassName={`signup-dob-dropdown ${backgroundTheme}`}
                      onChange={setDay}
                      options={daysOptions}
                    />
                    <Select
                      placeholder="YYYY"
                      className="signup-dob-select signup-dob-select--yyyy"
                      dropdownClassName={`signup-dob-dropdown ${backgroundTheme}`}
                      onChange={setYear}
                      options={yearsOptions}
                    />
                  </div>
                </div>

                <p className="signup-disclaimer">
                  <span className="signup-disclaimer-label">Disclaimer:</span>{" "}
                  Users must be 18 or older to sign up. Our platform involves
                  buying and selling NFTs with crypto. By proceeding, you
                  confirm you meet the age requirement.
                </p>
              </div>

              <div className="my-3 d-flex align-items-center">
                <CustomCheckbox
                  active={signUpAgreeCheckbox}
                  setActive={setSignUpAgreeCheckbox}
                />
                <Link to="/privacy-security" className="ms-2 signup-terms-text">
                  I agree to BITS&apos;s{" "}
                  <span className="footer-link">Terms &amp; Conditions</span>{" "}
                  and <span className="footer-link">Privacy Policy</span>
                </Link>
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
                {!isConnected ? (
                  <ButtonComponent
                    type="button"
                    onClick={forceValidateAndConnect}
                    text="CONNECT WALLET"
                    className={
                      !isSignUpFormValid || !signUpAgreeCheckbox
                        ? "btn-visually-disabled"
                        : ""
                    }
                    radius={8}
                  />
                ) : (
                  <ButtonComponent
                    type="button"
                    onClick={handleCreateAccountClick}
                    text="CREATE ACCOUNT"
                    className={!canSubmitAccount ? "btn-visually-disabled" : ""}
                    disabled={signUpLoading}
                    loading={signUpLoading}
                    radius={8}
                  />
                )}
              </div>

              <div className="mt-4 text-center">
                <span className="footer-text">
                  Already have an account?{" "}
                  <Link to="/login" className="footer-link">
                    Login
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
