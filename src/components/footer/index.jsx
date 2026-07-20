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
            <img src={helplinecustomer} alt="support" className="support-icon" />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-brand-top">
              <img src={logo} alt="BITS logo" className="footer-logo-img" />
              <p className="footer-description">
                At BITS we will take your most iconic performances and immortalize
                them on the blockchain.
              </p>
            </div>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                <img src={instagramsocialicon} alt="Instagram" className="social-icon" />
              </a>
              <a href="#" aria-label="TikTok" onClick={(e) => e.preventDefault()}>
                <img src={tiktoksocialicon} alt="TikTok" className="social-icon" />
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
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,38 C180,58 360,10 540,22 C720,34 900,56 1080,40 C1260,24 1380,8 1440,18 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
        <div className="footer-wave-bar">
          <div className="container footer-wave-inner">
            <p className="copyright-text">
              BITS NFT Inc. © {year} All Rights reserved
            </p>
            <a href="#metamask" className="metamask-link">
              <img src={metamaskFooter} alt="MetaMask" className="metamask-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
