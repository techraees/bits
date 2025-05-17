import React, { useState } from "react";
import { bell } from "../../assets/index";
import "./css/index.css";
import { Nav } from "react-bootstrap";
import profileimg from "../../assets/images/profile1.svg";

const NotificationModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(10);

  const notifications = [
    {
      id: 1,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 2,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 3,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 4,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 5,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 6,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 7,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 8,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 9,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
    {
      id: 10,
      text: "Your NFT sold to snap boogie",
      imageUrl: profileimg,
    },
  ];

  const handleToggleModal = () => {
    setShowModal(!showModal);
    // Reset notification count when opening the modal
    if (showModal) {
      setNotificationCount(0);
    }
  };

  return (
    <div>
      <Nav.Link className="white mx-1" onClick={handleToggleModal}>
        <img src={bell} className="" alt="bell" />
        {notificationCount > 0 && (
          <span className="notification-count">{notificationCount}</span>
        )}
      </Nav.Link>
      {showModal && (
        <div className="notification-modal modal fade show">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Notifications</h5>
              <button
                type="button"
                className="close"
                onClick={handleToggleModal}
              >
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <ul className="list-group">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="list-group-item d-flex align-items-center"
                  >
                    <img
                      src={notification.imageUrl}
                      alt={`Notification ${notification.id}`}
                      className="notification-image mr-2"
                    />
                    {notification.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationModal;
