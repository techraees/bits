import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./css/index.css";
import { logo, metamaskFooter, helplinecustomer, telegramsocialicon, xsocialicon, metamasksocialicon } from "../../assets";
const Footer = () => {
  const location = useLocation();
  const textColor = useSelector(state => state.app.theme.textColor);
  const isLightClass = textColor === "black" ? "light-mode" : "";
  const path = location.pathname.toLowerCase().trim();
  const isAuthRoute = path === "/login" || path === "/login/" || path.endsWith("/login") || path.endsWith("/login/") || path === "/signup" || path === "/signup/" || path.endsWith("/signup") || path.endsWith("/signup/") || path === "/reset-password" || path === "/reset-password/" || path.endsWith("/reset-password") || path.endsWith("/reset-password/") || path === "/reset-password/success" || path === "/reset-password/success/" || path.endsWith("/reset-password/success") || path.endsWith("/reset-password/success/");
  if (isAuthRoute) {
    return null;
  }
  return <footer className={`footer-container ${isLightClass}`}>
      <div className="footer-support-align">
        <div className="container">
          <div className="support-btn-fixed">
            <img src={helplinecustomer} alt="support" className="support-icon" />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-content">
          {}
          <div className="footer-brand">
            <img src={logo} alt="BITS logo" className="footer-logo-img" />
            <p className="footer-description">
              At BITS we will take your most iconic performances and immortalize
              them on the blockchain.
            </p>
          </div>

          {}
          <div className="footer-column">
            <h4>Home</h4>
            <ul>
              <li>
                <Link to="/video-gallery">Emote/Video Gallery</Link>
              </li>
              <li>
                <Link to="/video-gallery">Auctioned NFTs</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact Information</h4>
            <ul>
              <li>
                <Link to="/contact">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
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

          <div className="footer-socials">
            <a href="https://discord.com" target="_blank" rel="noreferrer">
              <img src={metamasksocialicon} alt="discord" className="social-icon" />
            </a>
            <a href="https://telegram.org" target="_blank" rel="noreferrer">
              <img src={telegramsocialicon} alt="telegram" className="social-icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <img src={xsocialicon} alt="twitter" className="social-icon" />
            </a>
          </div>

          {}
          <div className="footer-right-section">
            <div className="footer-search">
              <div className="search-box">
                <input type="text" placeholder="Write here ..." className="search-input" />
                <button className="search-btn">Search</button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="footer-bottom-parent">
          <div className="footer-bottom">
            <div className="red-bar">
              <p className="copyright-text">
                BITS NFT Inc.  {new Date().getFullYear()} All Rights reserved
              </p>
            </div>
            <a href="#metamask" className="metamask-link">
              <img src={metamaskFooter} alt="MetaMask" className="metamask-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
