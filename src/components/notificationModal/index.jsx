import React, { useState, useRef, useEffect } from "react";
import { bell } from "../../assets/index";
import "./css/index.css";
import { Nav } from "react-bootstrap";
import profileimg from "../../assets/images/profile1.svg";
import { BsThreeDotsVertical } from "react-icons/bs";

const NotificationModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(10);
  const modalRef = useRef(null);

  const notifications = [
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
    {
      id: 3,
      name: "A",
      text: "You have new Alert!",
      imageUrl: profileimg,
      time: "20m",
    },
  ];

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleMarkAllAsRead = () => {
    setNotificationCount(0);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <div className="notification-wrapper" ref={modalRef}>
      <Nav.Link className="white mx-1" onClick={handleToggleModal}>
        <img src={bell} className="" alt="bell" />
        {notificationCount > 0 && (
          <span className="notification-count">{notificationCount}</span>
        )}
      </Nav.Link>
      {showModal && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div className="notification-header-left">
              <h5 className="notification-title">Notifications</h5>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </div>
            <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          </div>
          <div className="notification-body">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <div className="notification-avatar">
                  {notification.name === "A" ? (
                    <div className="avatar-placeholder">
                      {notification.name}
                    </div>
                  ) : (
                    <img src={notification.imageUrl} alt={notification.name} />
                  )}
                </div>
                <div className="notification-content">
                  <div className="notification-text">
                    <span className="notification-name">
                      {notification.name}
                    </span>
                    {notification.tag && (
                      <span className="notification-tag">
                        {notification.tag}
                      </span>
                    )}
                    <span className="notification-message">
                      {notification.text}
                    </span>
                  </div>
                  <span className="notification-time">{notification.time}</span>
                </div>
                <button className="notification-menu">
                  <BsThreeDotsVertical />
                </button>
              </div>
            ))}
          </div>
          <div className="notification-footer">
            <button className="see-all-btn">See all</button>
            <span className="view-more-text">View more</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationModal;
