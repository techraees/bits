import { useMutation } from "@apollo/client";
import { Input } from "antd";
import { useEffect, useId, useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../../../assets";
import { ButtonComponent, ToastMessage } from "../../../components";
import PasswordRequirements from "../../../components/PasswordRequirements";
import Loading from "../../../components/loaders/loading";
import { isPasswordValid } from "../../../components/validations";
import { RESET_PASSWORD_MUTATION } from "../../../gql/mutations";
import {
  clearPasswordResetStorage,
  clearResetToken,
  getResetToken,
} from "../../../utills/forgotPasswordOtpStorage";
import getGraphQLErrorMessage from "../../../utills/getGraphQLErrorMessage";
import "../Login/css/index.css";
import "./css/index.css";

const env = process.env;

/** Avoid type="password" so Chrome/password managers don't offer saved logins. */
const noAutofillProps = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "off",
  spellCheck: false,
  "data-lpignore": "true",
  "data-1p-ignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
  "data-username": "false",
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const fieldSuffix = useId().replace(/:/g, "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD_MUTATION);

  const denyAccess = (message) => {
    clearResetToken();
    ToastMessage(
      "Error",
      message || "Session expired. Please verify OTP again.",
      "error",
    );
    navigate("/forgot-password", { replace: true });
  };

  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      const storedToken = getResetToken();
      if (!storedToken) {
        denyAccess("Reset session not found. Please verify OTP again.");
        return;
      }

      try {
        const response = await fetch(
          `${env.REACT_APP_BACKEND_BASE_URL}/verify-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: { token: storedToken } }),
          },
        );
        const data = await response.json();
        if (cancelled) return;

        if (data.success) {
          setToken(storedToken);
          setTokenValid(true);
          setVerifying(false);
        } else {
          denyAccess(
            data.message || "Reset token expired. Please verify OTP again.",
          );
        }
      } catch (error) {
        if (cancelled) return;
        denyAccess(
          error.message || "Reset token expired. Please verify OTP again.",
        );
      }
    };

    verifyToken();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!token || !getResetToken()) {
      denyAccess("Reset session expired. Please verify OTP again.");
      return;
    }
    if (password !== confirmPassword) {
      ToastMessage("Error", "Passwords do not match", "error");
      return;
    }
    if (!isPasswordValid(password)) {
      ToastMessage("Error", "Incorrect password format", "error");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await resetPasswordMutation({
        variables: { newPassword: password },
        context: {
          headers: {
            authorization: `Bearer ${getResetToken() || token}`,
          },
        },
      });

      if (data?.Reset_password?.updated) {
        clearPasswordResetStorage();
        ToastMessage("Success", "Password reset successfully", "success");
        navigate("/login", { replace: true });
      } else {
        ToastMessage("Error", "Failed to reset password", "error");
      }
    } catch (error) {
      const msg = getGraphQLErrorMessage(error, "Failed to reset password");
      const isSamePassword =
        /same as old password/i.test(msg) ||
        error?.graphQLErrors?.[0]?.error_code === "PASSWORDS_SAME" ||
        error?.networkError?.result?.errors?.[0]?.error_code ===
          "PASSWORDS_SAME";
      if (/invalid|expired|token|unauthorized/i.test(msg) && !isSamePassword) {
        denyAccess(msg);
      } else {
        ToastMessage("Error", msg, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying || !tokenValid) {
    return (
      <div className={`login-page-wrapper ${backgroundTheme}`}>
        <Loading content="Loading" />
      </div>
    );
  }

  const PasswordVisibilityToggle = ({ visible, onToggle }) => (
    <button
      type="button"
      className="reset-pw-visibility-btn"
      tabIndex={-1}
      aria-label={visible ? "Hide password" : "Show password"}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
    >
      {visible ? <FiEyeOff /> : <FiEye />}
    </button>
  );

  return (
    <div className={`login-page-wrapper ${backgroundTheme}`}>
      {submitting && <Loading content="Loading" />}

      <div className="container loginContainer">
        <div className="d-flex justify-content-center mb-4">
          <Link to="/">
            <img src={logo} className="logoSize" alt="logo" />
          </Link>
        </div>

        <div className="d-flex formMobView" style={{ width: "100%" }}>
          <div className="formContainer">
            <form
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <h2
                className="text-center mb-4 text-white font-weight-bold"
                style={{ fontSize: "28px", letterSpacing: "0.5px" }}
              >
                Reset your password
              </h2>
              <p
                className="text-center text-white mb-4"
                style={{ opacity: 0.8 }}
              >
                Your new password must be different from previous used
                passwords.
              </p>

              <div className="mb-4">
                <div className="login-input-group">
                  <label
                    className="login-input-label"
                    htmlFor={`np-${fieldSuffix}`}
                  >
                    New Password
                  </label>
                  <Input
                    id={`np-${fieldSuffix}`}
                    name={`np_${fieldSuffix}`}
                    type="text"
                    inputMode="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    prefix={<FiLock className="login-input-icon" />}
                    suffix={
                      <PasswordVisibilityToggle
                        visible={showPassword}
                        onToggle={() => setShowPassword((v) => !v)}
                      />
                    }
                    className={`login-input-field reset-pw-masked-input ${
                      showPassword ? "reset-pw-visible" : ""
                    }`}
                    {...noAutofillProps}
                  />
                </div>

                <PasswordRequirements password={password || ""} />

                <div className="login-input-group mt-4">
                  <label
                    className="login-input-label"
                    htmlFor={`cp-${fieldSuffix}`}
                  >
                    Confirm Password
                  </label>
                  <Input
                    id={`cp-${fieldSuffix}`}
                    name={`cp_${fieldSuffix}`}
                    type="text"
                    inputMode="text"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    prefix={<FiLock className="login-input-icon" />}
                    suffix={
                      <PasswordVisibilityToggle
                        visible={showConfirm}
                        onToggle={() => setShowConfirm((v) => !v)}
                      />
                    }
                    className={`login-input-field reset-pw-masked-input ${
                      showConfirm ? "reset-pw-visible" : ""
                    } ${
                      confirmPassword && password !== confirmPassword
                        ? "login-input-field-error"
                        : ""
                    }`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                    {...noAutofillProps}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <span className="login-error-text">
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>

              <div className="my-4">
                <ButtonComponent
                  onClick={handleSubmit}
                  text="RESET YOUR PASSWORD"
                  radius={8}
                  type="button"
                  disabled={submitting}
                  loading={submitting}
                />
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="footer-link"
                  onClick={() => clearPasswordResetStorage()}
                >
                  Back to Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
