import { useEffect, useRef, useState } from "react";
import profileimg from "../../assets/images/profile1.svg";
import HeaderBellIcon from "./icons/HeaderBellIcon";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    name: "John",
    text: "Joins in group! BITS",
    imageUrl: profileimg,
    time: "20m",
    tag: "joined",
  },
  {
    id: 2,
    name: "Snap",
    text: "Snap assigned New Admin. You have new Alert!",
    imageUrl: profileimg,
    time: "20m",
  },
];

const HeaderNotificationBell = ({ isLight }) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(INITIAL_NOTIFICATIONS.length);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="bits-header__notify-wrap" ref={wrapperRef}>
      <button
        type="button"
        className="bits-header__notify-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <HeaderBellIcon />
        {unreadCount > 0 && (
          <span className="bits-header__notify-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div
          className={`bits-header__notify-dropdown ${isLight ? "is-light" : "is-dark"}`}
        >
          <div className="bits-header__notify-header">
            <div className="bits-header__notify-header-left">
              <h5 className="bits-header__notify-title">Notifications</h5>
              {unreadCount > 0 && (
                <span className="bits-header__notify-count-pill">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              className="bits-header__notify-mark-read"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          </div>

          <div className="bits-header__notify-body">
            {INITIAL_NOTIFICATIONS.map((notification) => (
              <div key={notification.id} className="bits-header__notify-item">
                <img
                  src={notification.imageUrl}
                  alt=""
                  className="bits-header__notify-avatar"
                />
                <div className="bits-header__notify-content">
                  <p className="bits-header__notify-text">
                    <span className="bits-header__notify-name">
                      {notification.name}
                    </span>
                    {notification.tag && (
                      <span className="bits-header__notify-tag">
                        {notification.tag}
                      </span>
                    )}{" "}
                    {notification.text}
                  </p>
                  <span className="bits-header__notify-time">
                    {notification.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNotificationBell;
