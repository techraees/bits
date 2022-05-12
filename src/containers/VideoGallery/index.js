import React from "react";
import "./css/index.css";
import { NavbarComponent, CardCompnent } from "../../components";
import { Input } from "antd";
import { search, AZ, grid, profile } from "../../assets";

const VideoGallery = () => {
  let cardsData = [
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
    {
      image: profile,
      name: "Snap Boogie",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=9xwazD5SyVg",
    },
  ];
  return (
    <div className="black-background pb-2">
      <NavbarComponent selectedKey={"3"} headerText={"Emote Video Gallery"} />
      <div className="container">
        <div style={{ width: "100%" }} className="d-flex searchStyle my-4">
          <Input placeholder="Search Here..." className="searchStyle" />
          <img className="me-3 cursor" style={{ width: 15 }} src={search} />
        </div>
        <div style={{ border: "1px solid #5e2a2a" }}></div>
        <div style={{ width: "100%" }} className="d-flex justify-content-end">
          <div
            className="d-flex py-2 px-3 my-4"
            style={{ backgroundColor: "#2b2b2b", borderRadius: 20 }}
          >
            <img src={AZ} className="me-2" style={{ width: 20, height: 20 }} />
            <span
              className="me-2"
              style={{ border: "1px solid #D54343" }}
            ></span>
            <img src={grid} style={{ width: 20, height: 20 }} />
          </div>
        </div>
        <div style={{ border: "1px solid #5e2a2a" }}></div>
        <div className="row my-3">
          {cardsData.map((e, i) => {
            return (
              <CardCompnent
                key={i}
                image={e.image}
                status={e.status}
                name={e.name}
                videoLink={e.videoLink}
                topName
                collectionBtn
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
