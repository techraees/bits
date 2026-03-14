import React from "react";
import { useTimer } from "react-timer-hook";
import "./style.css";
function MyTimer({ expiryTimestamp }) {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn("onExpire called"),
  });

  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "white",
          marginTop: "1rem",
        }}
      >
        <span className="time-wrapper">{days} D</span>
        &nbsp;
        <span className="time-wrapper">{hours} hrs</span>
        &nbsp;
        <span className="time-wrapper">{minutes} min</span>
        &nbsp;
        <span className="time-wrapper">{seconds} sec</span>
      </div>
    </div>
  );
}

export default function Timercomp({
  auctionStartTime,
  auctionEndTime,
  isUnixSeconds = false
}) {
  const multiplier = isUnixSeconds ? 1000 : 1;
  const expiryTime = new Date(auctionEndTime * multiplier);

  // let time = new Date(auctionStartTime * 1);
  // let sub = auctionEndTime - auctionStartTime;

  // time.setSeconds(time.getSeconds() + sub);
  return (
    <div>
      <MyTimer expiryTimestamp={expiryTime} />
    </div>
  );
}
