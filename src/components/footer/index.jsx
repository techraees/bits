import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./css/index.css";
import {
  logo,
  metamaskFooter,
  helplinecustomer,
  instagramsocialicon,
  tiktoksocialicon,
  xsocialiconOutline,
} from "../../assets";

const Footer = () => {
  const location = useLocation();
  const textColor = useSelector((state) => state.app.theme.textColor);
  const isLightClass = textColor === "black" ? "light-mode" : "";
  const path = location.pathname.toLowerCase().trim();
  const isAuthRoute =
    path === "/login" ||
    path === "/login/" ||
    path.endsWith("/login") ||
    path.endsWith("/login/") ||
    path === "/signup" ||
    path === "/signup/" ||
    path.endsWith("/signup") ||
    path.endsWith("/signup/") ||
    path === "/forgot-password" ||
    path === "/forgot-password/" ||
    path.endsWith("/forgot-password") ||
    path.endsWith("/forgot-password/") ||
    path === "/verify-otp" ||
    path === "/verify-otp/" ||
    path.endsWith("/verify-otp") ||
    path.endsWith("/verify-otp/") ||
    path === "/reset-password" ||
    path === "/reset-password/" ||
    path.endsWith("/reset-password") ||
    path.endsWith("/reset-password/") ||
    path === "/reset-password/success" ||
    path === "/reset-password/success/" ||
    path.endsWith("/reset-password/success") ||
    path.endsWith("/reset-password/success/");

  if (isAuthRoute) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className={`footer-container ${isLightClass}`}>
      <div className="footer-support-align">
        <div className="container">
          <div className="support-btn-fixed">
            <img
              src={helplinecustomer}
              alt="support"
              className="support-icon"
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-brand-top">
              <img src={logo} alt="BITS logo" className="footer-logo-img" />
              <p className="footer-description">
                At BITS we will take your most iconic performances and
                immortalize them on the blockchain.
              </p>
            </div>
            <div className="footer-socials">
              <a
                href="#"
                aria-label="Instagram"
                onClick={(e) => e.preventDefault()}
              >
                <img
                  src={instagramsocialicon}
                  alt="Instagram"
                  className="social-icon"
                />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                onClick={(e) => e.preventDefault()}
              >
                <img
                  src={tiktoksocialicon}
                  alt="TikTok"
                  className="social-icon"
                />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <img src={xsocialiconOutline} alt="X" className="social-icon" />
              </a>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-column footer-column-home">
              <h4>Home</h4>
              <ul>
                <li>
                  <Link to="/marketplace">Marketplace</Link>
                </li>
                <li>
                  <Link to="/login">Connect Wallet</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column footer-column-contact">
              <h4>Contact Information</h4>
              <ul>
                <li>
                  <Link to="/about-us">About</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column footer-column-chains">
              <h4>Chains</h4>
              <ul>
                <li>
                  <a href="#eth">Ethereum</a>
                </li>
                <li>
                  <a href="#polygon">Polygon</a>
                </li>
              </ul>
            </div>

            <div className="footer-column footer-column-about">
              <h4>About us</h4>
              <ul>
                <li>
                  <Link to="/privacy-security">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/privacy-security">Terms of Services</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-wave">
        <svg
          className="footer-wave-svg"
          viewBox="0 0 1424 122"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="footer-wave-gradient"
              x1="-16"
              y1="61"
              x2="1424"
              y2="61"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#972020" />
              <stop offset="0.5" stopColor="#D54242" />
            </linearGradient>
          </defs>
          <path
            d="M-16 0L85.0012 17.3202C144.508 27.5248 205.372 26.8674 264.644 15.3798L269.707 14.3986C318.955 4.85388 369.359 2.77478 419.226 8.23113L472.38 14.0471C509.345 18.0917 546.645 18.0001 583.59 13.774L631.776 8.26183C679.674 2.78274 728.112 4.25964 775.586 12.6467L798.038 16.6131C856.219 26.8915 915.761 26.7769 973.901 16.2748L998.702 11.795C1042.04 3.96599 1086.23 1.89796 1130.11 5.6446L1201.08 11.7038C1229.31 14.1137 1257.69 14.1203 1285.92 11.7237L1424 0V122H-16V0Z"
            fill="url(#footer-wave-gradient)"
            fillOpacity="0.8"
          />
        </svg>
        <div className="footer-wave-bar">
          <div className="container footer-wave-inner">
            <p className="copyright-text">
              BITS NFT Inc. © {year} All Rights reserved
            </p>
            <a href="#metamask" className="metamask-link">
              <img
                src={metamaskFooter}
                alt="MetaMask"
                className="metamask-icon"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
