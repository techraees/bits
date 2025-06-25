/* eslint-disable no-useless-escape */
import { Modal } from "antd";
import React, { useState } from "react";
import { ButtonComponent, InputComponent, ToastMessage } from "..";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { RESET_PASSWORD_MUTATION } from "../../gql/mutations";

const env = process.env;

const ForgotPassModal = ({
  visible,
  onClose,
  step,
  setStep,
  token,
  handleCloseForgotPass,
}) => {
  const [formValue, setFormValue] = useState();
  //   const [step, setStep] = useState(3);
  let navigate = useNavigate();

  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION);
  const handleChange = (e) => {
    setFormValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitReset = async () => {
    if (validateEmail(formValue.email)) {
      const body = {
        data: {
          email: formValue.email,
        },
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `${env.REACT_APP_BACKEND_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (data.success) {
        setStep((step) => step + 1);
      } else {
        ToastMessage("Error", data.message, "error");
      }
    } else {
      ToastMessage("Error", "Wrong email format", "error");
    }
  };

  const handleSubmitConfirm = async () => {
    if (formValue?.password === formValue?.confirm_password) {
      if (validatePassword(formValue?.confirm_password)) {
        try {
          const { data } = await resetPassword({
            variables: {
              newPassword: formValue?.confirm_password,
            },
            context: {
              headers: {
                Authorization: `Bearer ${token} `,
              },
            },
          });
          if (data) {
            ToastMessage("Success", "Password reset successfully", "success");
            handleCloseForgotPass();
            navigate("/login");
          }
        } catch (e) {
          ToastMessage("Error", e.message, "error");
        }
      } else {
        ToastMessage("Error", "Incorrect password format", "error");
      }
    } else {
      ToastMessage("Error", "Password mismatch", "error");
    }
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

  return (
    <>
      <Modal
        style={{ marginTop: "6rem" }}
        footer={null}
        open={visible}
        onOk={onClose}
        onCancel={onClose}
      >
        <div className="my-5">
          {step === 1 && (
            <form autoComplete="off">
              <div className="w-100 semi-bold fs-5 text-center text-white mb-3">
                Forgot your password?
              </div>
              <InputComponent
                placeholder={"E-mail"}
                name="email"
                onChange={handleChange}
                value={formValue?.email}
                autoComplete="off"
              />

              <div className="my-3">
                <ButtonComponent
                  onClick={handleSubmitReset}
                  text={"RESET YOUR PASSWORD"}
                />
              </div>
            </form>
          )}

          {/* {step === 5 && (
            <form autoComplete="off">
              <div className="w-100 semi-bold fs-5 text-center text-white mb-3">
                The email you entered is not registered. Please double-check and
                re-enter a valid email.
              </div>
              <InputComponent
                placeholder={"E-mail"}
                name="email"
                onChange={handleChange}
                value={formValue?.email}
                autoComplete="off"
              />
              <div className="my-3">
                <ButtonComponent
                  onClick={handleSubmit}
                  text={"RESET YOUR PASSWORD"}
                />
              </div>
            </form>
          )} */}

          {step === 2 && (
            <div className="w-100 semi-bold fs-5 text-center text-white mb-3">
              Password reset link sent to your email!
            </div>
          )}

          {step === 3 && (
            <form autoComplete="off">
              <div className="w-100 semi-bold fs-5 text-center text-white mb-3">
                Reset your password
              </div>
              <div className="my-3">
                <InputComponent
                  placeholder={"Password"}
                  name="password"
                  // ref={register}
                  onChange={handleChange}
                  value={formValue?.password}
                  autoComplete="off"
                  password
                />
              </div>

              <InputComponent
                placeholder={"Confirm Password"}
                name="confirm_password"
                // ref={register}
                onChange={handleChange}
                value={formValue?.confirm_password}
                autoComplete="off"
                password
              />

              <div className="my-3">
                <ButtonComponent
                  onClick={handleSubmitConfirm}
                  text={"RESET YOUR PASSWORD"}
                />
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ForgotPassModal;
