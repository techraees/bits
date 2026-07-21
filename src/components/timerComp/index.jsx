import React from "react";
import { useTimer } from "react-timer-hook";
import "./style.css";
function MyTimer({ expiryTimestamp, className = "" }) {
  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp,
    onExpire: () => {},
  });
  return (
    <div className={`auction-timer ${className}`.trim()}>
      <span className="time-wrapper">{days}D</span>
      <span className="time-wrapper">{hours} hrs</span>
      <span className="time-wrapper">{minutes} min</span>
      <span className="time-wrapper">{seconds} sec</span>
    </div>
  );
}
export default function Timercomp({
  auctionStartTime,
  auctionEndTime,
  isUnixSeconds = false,
  className = "",
}) {
  const multiplier = isUnixSeconds ? 1000 : 1;
  const expiryTime = new Date(auctionEndTime * multiplier);
  return (
    <div>
      <MyTimer expiryTimestamp={expiryTime} className={className} />
    </div>
  );
}
