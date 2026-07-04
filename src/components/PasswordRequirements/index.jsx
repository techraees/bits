import { FaCheckCircle } from "react-icons/fa";
import { getPasswordRequirementStatus } from "../validations";
import "./css/index.css";

const REQUIREMENTS = [
  { key: "minLength", label: "Password must be at least 8 characters long." },
  {
    key: "uppercase",
    label: "Password must contain at least one upper case.",
  },
  { key: "lowercase", label: "One lower case letter." },
  {
    key: "hasNumber",
    label: "Password must contain at least one number.",
  },
  {
    key: "hasSpecial",
    label: "Password must contain at least one special character.",
  },
];

const PasswordRequirements = ({ password = "" }) => {
  const status = getPasswordRequirementStatus(password);

  return (
    <ul className="password-requirements">
      {REQUIREMENTS.map(({ key, label }) => {
        const met = status[key];

        return (
          <li
            key={key}
            className={`password-requirements__item ${
              met ? "password-requirements__item--met" : ""
            }`}
          >
            <FaCheckCircle className="password-requirements__icon" size={14} />
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirements;
