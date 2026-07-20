import { Input } from "antd";
import { useLayoutEffect, useState } from "react";
import { FiMail } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../../../assets";
import { ButtonComponent, ToastMessage } from "../../../components";
import Loading from "../../../components/loaders/loading";
import {
  getCooldownRemainingMs,
  setOtpCooldown,
  clearPasswordResetStorage
} from "../../../utills/forgotPasswordOtpStorage";
import "../Login/css/index.css";
import "./css/index.css";

const env = process.env;
const NO_SCROLL_CLASS = "forgot-password-no-scroll";

function ForgotPassword() {
  const navigate = useNavigate();
  const backgroundTheme = useSelector(state => state.app.theme.backgroundTheme);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      ToastMessage("Error", "Wrong email format", "error");
      return;
    }

    const remainingMs = getCooldownRemainingMs(email);
    if (remainingMs > 0) {
      const seconds = Math.ceil(remainingMs / 1000);
      ToastMessage(
        "Error",
        `Please wait ${seconds}s before requesting another OTP`,
        "error"
      );
      // Push so Back from OTP still returns to forgot-password
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
      return;
    }

    setLoading(true);
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
        setOtpCooldown(email.trim());
        ToastMessage("Success", "OTP sent to your email", "success");
        // Push (not replace) so Back from OTP returns here before verify
        navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
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
      setLoading(false);
    }
  };

  return (
    <div className={`login-page-wrapper forgot-password-page ${backgroundTheme}`}>
      {loading && <Loading content="Loading" />}

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
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  top: "auto",
                  width: 1,
                  height: 1,
                  overflow: "hidden"
                }}
              >
                <input type="text" name="fake_username" autoComplete="username" tabIndex={-1} />
                <input type="password" name="fake_password" autoComplete="current-password" tabIndex={-1} />
              </div>

              <h2
                className="text-center mb-4 text-white font-weight-bold"
                style={{ fontSize: "28px", letterSpacing: "0.5px" }}
              >
                Forgot your password?
              </h2>
              <p className="text-center text-white mb-4" style={{ opacity: 0.8 }}>
                Enter your email and we&apos;ll send you a one-time verification code.
              </p>

              <div className="mb-4">
                <div className="login-input-group">
                  <label className="login-input-label">Email</label>
                  <Input
                    name="fp_email_field"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    prefix={<FiMail className="login-input-icon" />}
                    className="login-input-field"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    inputMode="email"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="my-4">
                <ButtonComponent
                  onClick={handleSubmit}
                  text="SEND OTP"
                  radius={8}
                />
              </div>

              <div className="mt-4 text-center">
                <span className="footer-text">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="footer-link"
                    onClick={() => clearPasswordResetStorage()}
                  >
                    Sign in
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

export default ForgotPassword;
