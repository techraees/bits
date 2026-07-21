import { getPasswordRequirementStatus } from "../validations";
import "./css/index.css";

const REQUIREMENTS = [
  {
    key: "minLength",
    label: "Between 8 and 20 characters",
  },
  {
    key: "uppercase",
    label: "1 Uppercase letter",
  },
  {
    key: "hasNumber",
    label: "1 or more numbers",
  },
  {
    key: "hasSpecial",
    label: "1 or more special characters",
  },
];

const PasswordRequirements = ({ password = "" }) => {
  const status = getPasswordRequirementStatus(password);

  return (
    <div className="password-requirements">
      <p className="password-requirements__hint">
        Minimum length is 8 characters. Use Capital letters with Specials
        characters.
      </p>
      <p className="password-requirements__heading">
        Your password must contain
      </p>
      <ul className="password-requirements__list">
        {REQUIREMENTS.map(({ key, label }) => {
          const met = status[key];
          return (
            <li
              key={key}
              className={`password-requirements__item ${
                met ? "password-requirements__item--met" : ""
              }`}
            >
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
