import React from "react";
import "./css/index.css";
import { useSelector } from "react-redux";
import { discord, telegram, twitter } from "../../../assets";

const AboutUs = () => {
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  return (
    <div className={`${backgroundTheme}`} style={{ minHeight: "100vh" }}>
      <div className="container about-us-container">
        <p className={`m-0 ${textColor2} about-us`}>
          This concept challenges the stigmas attached to "the streets," by
          acknowledging the value and talent of artists who share their passions
          with society in public spaces. Snap Boogie brought life to a vision
          whereby street performing artists and dancers are no longer
          underestimated due to the location of their exhibitions, but instead
          are praised and respected for their integrity and authenticity.
          <br /> BITS intends to display the true quality of these artists, by
          rewriting the script, and showcasing the heart and soul of these
          talented individuals. This is achieved by turning their dance
          moves/performing moments into a video-game emote NFT. Thus, enabling
          these artist to connect with fans on another level, while bringing
          them closer to gaining intellectual property in a growing industry.
          Therefore, merging the Arts with, gaming, and the NFT industry,
          towards a new and creative future.
        </p>
      </div>
      <div
        className="container about-us-container"
        style={{ background: " #B13232;" }}
      >
        <div
          style={{
            display: "flex",
            gap: "5rem",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="socialIcons socialIcons_mobile"
        >
          <img src={discord} height={70} />
          <img src={telegram} height={70} />
          <img src={twitter} height={70} />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
