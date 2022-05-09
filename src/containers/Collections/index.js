import React from "react";
import {
  profile_large,
  location,
  upload,
  search,
  AZ,
  grid,
  profile,
} from "../../assets";
import {
  ButtonComponent,
  CardCompnent,
  NavbarComponent,
} from "../../components";
import "./css/index.css";
import { Input } from "antd";

const Collections = () => {
  let cardsData = [
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
    {
      image: profile,
      name: "Speedy Walkovers",
      status: "First Gen Emote",
      videoLink: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
    },
  ];
  return (
    <div className="black-background">
      <NavbarComponent />
      <div className="container">
        <div
          style={{ alignItems: "center" }}
          className="d-flex justify-content-between collectionFirstContainer"
        >
          <div
            className="d-flex profileImageContainer"
            style={{ alignItems: "center" }}
          >
            <img src={profile_large} className="collectionImage" />
            <div className="userNameView">
              <h3 className="red-gradient-color semi-bold">Snap Boogie</h3>
              <div className="d-flex">
                <h5 className="m-0 white">Boston, MA (USA)</h5>
                <img className="ms-2" src={location} />
              </div>
              <span className="light-grey">
                (Snap Boggie is a Professional Dancer){" "}
              </span>
              <div style={{ width: "60%" }} className="mt-4">
                <ButtonComponent simple text={"Edit Profile"} />
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-center uploadView1">
            <div className="d-flex py-4 uploadView">
              <img src={upload} />
              <p className="white m-0 mt-3">Upload Emote Video</p>
            </div>
          </div>
        </div>
        <div style={{ border: "1px solid #B23232" }}></div>
        <div className="my-4 d-flex justify-content-between">
          <div style={{ width: "100%" }} className="d-flex searchStyle">
            <Input placeholder="Search Here..." className="searchStyle" />
            <img className="me-3" style={{ width: 15 }} src={search} />
          </div>
          <div
            className="d-flex ms-3 p-2"
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
        <div className="row">
          {cardsData.map((e, i) => {
            return (
              <CardCompnent
                key={i}
                image={e.image}
                status={e.status}
                name={e.name}
                videoLink={e.videoLink}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Collections;