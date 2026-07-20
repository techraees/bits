import { useEffect, useLayoutEffect, useRef, useState } from "react";
import OtpInput from "react-otp-input";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { logo } from "../../../assets";
import { ButtonComponent, ToastMessage } from "../../../components";
import Loading from "../../../components/loaders/loading";
import {
  getCooldownRemainingMs,
  getResetToken,
  clearResetToken,
  setOtpCooldown,
  setResetToken
} from "../../../utills/forgotPasswordOtpStorage";
import "../Login/css/index.css";
import "../ForgotPassword/css/index.css";
import "./css/index.css";

const env = process.env;
const NO_SCROLL_CLASS = "forgot-password-no-scroll";

function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backgroundTheme = useSelector(state => state.app.theme.backgroundTheme);
  const emailFromQuery = searchParams.get("email") || "";

  const [email] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const verifyingRef = useRef(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    html.classList.add(NO_SCROLL_CLASS);
    body.classList.add(NO_SCROLL_CLASS);
    root?.classList.add(NO_SCROLL_CLASS);

    const blockScroll = (event) => {
      event.preventDefault();
    };
    const keepAtTop = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("scroll", keepAtTop, { passive: true });

    return () => {
      html.classList.remove(NO_SCROLL_CLASS);
      body.classList.remove(NO_SCROLL_CLASS);
      root?.classList.remove(NO_SCROLL_CLASS);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("scroll", keepAtTop);
    };
  }, []);

  useEffect(() => {
    // OTP already verified → skip expired OTP screen
    if (getResetToken()) {
      navigate("/reset-password", { replace: true });
      return;
    }

    if (!email) {
      ToastMessage("Error", "Email is required. Request OTP again.", "error");
      navigate("/forgot-password", { replace: true });
      return;
    }

    const tick = () => {
      const remaining = getCooldownRemainingMs(email);
      setCooldownSeconds(Math.ceil(remaining / 1000));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [email, navigate]);

  useEffect(() => {
    if (!email || getResetToken()) return;
    const focusFirst = () => {
      document.querySelector(".verify-otp-circle")?.focus();
    };
    focusFirst();
    const t = window.setTimeout(focusFirst, 50);
    return () => window.clearTimeout(t);
  }, [email]);

  const handleVerify = async (otpValue = otp) => {
    const code = String(otpValue || "").trim();
    if (!/^\d{6}$/.test(code)) {
      ToastMessage("Error", "Enter the 6-digit OTP from your email", "error");
      return;
    }
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    setLoading(true);
    try {
      const response = await fetch(
        `${env.REACT_APP_BACKEND_BASE_URL}/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: { email: email.trim(), otp: code }
          })
        }
      );
      const data = await response.json();
      if (data.success && data.token) {
        setResetToken(data.token);
        ToastMessage("Success", "OTP verified", "success");
        // Replace so Back from reset-password skips consumed OTP screen
        navigate("/reset-password", { replace: true });
      } else {
        const message =
          (typeof data?.message === "string" && data.message) ||
          data?.message?.message ||
          "Invalid OTP";
        ToastMessage("Error", message, "error");
      }
    } catch (error) {
      ToastMessage("Error", error.message || "Something went wrong", "error");
    } finally {
      verifyingRef.current = false;
      setLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleResend = async () => {
    const remainingMs = getCooldownRemainingMs(email);
    if (remainingMs > 0) {
      ToastMessage(
        "Error",
        `Please wait ${Math.ceil(remainingMs / 1000)}s before requesting another OTP`,
        "error"
      );
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch(
        `${env.REACT_APP_BACKEND_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { email: email.trim() } })
        }
      );
      const data = await response.json();
      if (data.success) {
        setOtp("");
        setOtpCooldown(email.trim());
        setCooldownSeconds(60);
        ToastMessage("Success", "OTP sent to your email", "success");
      } else {
        const message =
          (typeof data?.message === "string" && data.message) ||
          data?.message?.message ||
          "Something went wrong";
        ToastMessage("Error", message, "error");
      }
    } catch (error) {
      ToastMessage("Error", error.message || "Something went wrong", "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={`login-page-wrapper forgot-password-page ${backgroundTheme}`}>
      {(loading || resendLoading) && <Loading content="Loading" />}

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
                handleVerify();
              }}
            >
              <h2
                className="text-center mb-4 text-white font-weight-bold"
                style={{ fontSize: "28px", letterSpacing: "0.5px" }}
              >
                Verify OTP
              </h2>
              <p className="text-center text-white mb-4" style={{ opacity: 0.8 }}>
                Enter the 6-digit code sent to{" "}
                <span style={{ color: "#d54343" }}>{email}</span>
              </p>

              <div className="mb-4 verify-otp-input-wrap">
                <OtpInput
                  value={otp}
                  onChange={handleOtpChange}
                  numInputs={6}
                  inputType="text"
                  shouldAutoFocus
                  skipDefaultStyles
                  containerStyle="verify-otp-container"
                  renderSeparator={<span className="verify-otp-separator" />}
                  renderInput={(props, index) => (
                    <input
                      {...props}
                      name={`fp_otp_${index}`}
                      className="verify-otp-circle"
                      inputMode="numeric"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-form-type="other"
                      onKeyDown={(event) => {
                        props.onKeyDown?.(event);
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleVerify();
                        }
                      }}
                    />
                  )}
                />
              </div>

              <div className="my-4">
                <ButtonComponent
                  onClick={() => handleVerify()}
                  text="VERIFY OTP"
                  radius={8}
                  type="button"
                  disabled={loading}
                  loading={loading}
                />
              </div>

              <div className="mt-3 text-center">
                {cooldownSeconds > 0 ? (
                  <span className="footer-text">
                    Resend OTP in {cooldownSeconds}s
                  </span>
                ) : (
                  <span
                    className="footer-link cursor"
                    onClick={handleResend}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleResend();
                      }
                    }}
                  >
                    Resend OTP
                  </span>
                )}
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="footer-link"
                  onClick={() => clearResetToken()}
                >
                  Change email
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
