export const timeToTimeStamp = (time) => {
  const str = time.toString();
  const [dateComponents, timeComponents] = str.split(" ");
  const [year, month, day] = dateComponents.split("-");
  const [hours, minutes, seconds] = timeComponents.split(":");
  const date = new Date(+year, month - 1, +day, +hours, +minutes, +seconds);
  const timestamp = date.getTime();
  return timestamp / 1000;
};
export const timestampToDate = (timestamp) => {
  const dateFormat = new Date(timestamp);
  const fulldate =
    dateFormat.getMonth() +
    1 +
    "/" +
    dateFormat.getDate() +
    "/" +
    dateFormat.getFullYear();
  return fulldate;
};
export const dbDateToReadableDate = (dbdate) => {
  const date = new Date(dbdate);
  const readableDateTime = date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return readableDateTime;
};
export const dbDateToTime = (dbdate) => {
  const givenTime = new Date(dbdate);
  const timestampInMilliseconds = givenTime.getTime();
  const timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);
  return timestampInSeconds;
};
