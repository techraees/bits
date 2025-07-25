import React, { useEffect } from "react";
import CardSkeletalCard from "./CardSkeletalCard";
import "./css/index.css";

const CardSkeletal = () => {
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });

      window.addEventListener("resize", handleResize);

      return (_) => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  if (dimensions?.width <= 768) {
    return (
      <>
        <div className="skeletal_parent d-flex align-items-center flex-column">
          <CardSkeletalCard />
          <CardSkeletalCard />
          <CardSkeletalCard />
          <CardSkeletalCard />
          <CardSkeletalCard />
          <CardSkeletalCard />
          <CardSkeletalCard />
          <CardSkeletalCard />
        </div>
      </>
    );
  }
  if (dimensions?.width <= 1024) {
    return (
      <>
        <div className="skeletal_parent d-flex align-items-center flex-column">
          <div className="d-flex align-items-center gap-3">
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
          </div>
          <div className="d-flex align-items-center gap-3">
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
          </div>
          <div className="d-flex align-items-center gap-3">
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="skeletal_parent">
        <CardSkeletalCard />
        <CardSkeletalCard />
        <CardSkeletalCard />
        <CardSkeletalCard />
        <CardSkeletalCard />
        <CardSkeletalCard />
        <CardSkeletalCard />
        <CardSkeletalCard />
      </div>
    </>
  );
};

export default CardSkeletal;
