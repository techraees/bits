import * as yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
let valid_token_address = /^0x[0-9a-fA-F]{40}$/;
const uploadValidation = values => {
  const errors = {};
  if (!values.name) {
    errors.name = "Required";
  } else if (values.name.length > 50) {
    errors.name = "Must be 50 characters or less";
  }
  if (!values.description) {
    errors.description = "Required";
  } else if (values.description.length > 200) {
    errors.description = "Must be 200 characters or less";
  }
  if (!values.video) {
    errors.video = "Required";
  }
  return errors;
};
const mintValidation = values => {
  const errors = {};
  if (!values.walletAddress) {
    errors.walletAddress = "Required";
  } else if (!valid_token_address.test(values.walletAddress.trim())) {
    errors.walletAddress = "Invalid address format";
  }
  if (!values.supply) {
    errors.supply = "Required";
  }
  if (!values.royalty) {
    errors.royalty = "Required";
  }
  return errors;
};
const PASSWORD_SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+.,?~\/-]/;
const PASSWORD_MALICIOUS_CHARS_REGEX = /[<>{}\[\];"']/;
const PASSWORD_FULL_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+.,?~\/-]).{8,}$/;
const PASSWORD_FORMAT_ERROR_MESSAGE = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
const getPasswordRequirementStatus = (password = "") => ({
  minLength: password.length >= 8 && password.length <= 20,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecial: PASSWORD_SPECIAL_CHARS_REGEX.test(password)
});
const isPasswordValid = (password = "") => PASSWORD_FULL_REGEX.test(password) && !/\s\s+/.test(password) && !PASSWORD_MALICIOUS_CHARS_REGEX.test(password);
const signUpSchema = yup.object().shape({
  full_name: yup.string().trim().required("Full name is required"),
  user_name: yup.string().trim().matches(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric and can only contain letters, numbers, and underscores (no spaces)").required("Username is required"),
  email: yup.string().trim().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required").matches(PASSWORD_FULL_REGEX, PASSWORD_FORMAT_ERROR_MESSAGE).test("no-malicious-chars", "Password contains invalid characters (e.g., < > { } [ ] ; \" ')", value => !value || !PASSWORD_MALICIOUS_CHARS_REGEX.test(value)).test("no-consecutive-spaces", "Password cannot contain consecutive spaces", value => !/\s\s+/.test(value)),
  phone_number: yup.string().test("is-valid-phone", "Phone number is invalid for the selected country", value => value ? isValidPhoneNumber(value) : false).required("Phone number is required")
});
const signInSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters long")
});
const userEditSchema = yup.object().shape({});
const passwordValidate = values => {
  const errors = {};
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else if (/\s\s+/.test(values.password)) {
    errors.password = "Password cannot contain consecutive spaces";
  }
  if (!values.newPassword) {
    errors.newPassword = "New password is required";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "New password must be at least 6 characters";
  } else if (/\s\s+/.test(values.newPassword)) {
    errors.newPassword = "New password cannot contain consecutive spaces";
  }
  return errors;
};
const contactValidate = values => {
  const errors = {};
  if (!values.fullName) {
    errors.fullName = "Full name is required";
  }
  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Invalid email address";
  }
  if (!values.phoneNumber) {} else if (!/^[0-9]+$/.test(values.phoneNumber)) {
    errors.phoneNumber = "Invalid phone number";
  }
  if (!values.message) {
    errors.message = "Message is required";
  }
  return errors;
};
const emailValidate = values => {
  const errors = {};
  if (!values.newEmail) {
    errors.newEmail = "Email is required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.newEmail)) {
    errors.newEmail = "Invalid email address";
  }
  if (!values.password) {
    errors.password = "Password is required";
  }
  return errors;
};
const editProfileValidate = values => {
  const errors = {};
  if (!values.full_name || !values.full_name.trim()) {
    errors.full_name = "Username is required";
  }
  if (!values.userAddress || !values.userAddress.trim()) {
    errors.userAddress = "Address is required";
  } else if (!valid_token_address.test(values.userAddress.trim())) {
    errors.userAddress = "Invalid address format";
  }
  return errors;
};
export { uploadValidation, mintValidation, PASSWORD_FORMAT_ERROR_MESSAGE, PASSWORD_SPECIAL_CHARS_REGEX, PASSWORD_FULL_REGEX, getPasswordRequirementStatus, isPasswordValid, signUpSchema, signInSchema, userEditSchema, passwordValidate, emailValidate, contactValidate, editProfileValidate };
