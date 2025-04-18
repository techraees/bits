import React from "react";
import leftIconSingle from "./LeftIconSingle.svg";
import LeftIconDouble from "./LeftIconDouble.svg";
import RightIconSingle from "./RightIconSingle.svg";
import RightIconDouble from "./RightIconDouble.svg";
import ButtonComponent from "../button";

const TopNftPopupPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 0) {
    return <tfoot className="h-[27px] w-full">{}</tfoot>;
  }

  const getPageNumbers = () => {
    let pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pageNumbers.push(i);
      }
      if (currentPage < totalPages - 2) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      <nav>
        <ul className="lg:justify-content-end p-0 justify-content-center prevent_select mb-0 d-flex parent_ul_custon_li">
          <p
            className="previous_next_button prevent_select cursor_pointer"
            onClick={() => {
              if (currentPage === 1) {
              } else {
                onPageChange(currentPage - 1);
              }
            }}
          >
            Prev
          </p>
          <li
            className={`cursor_pointer prevent_select custom-li page-item ${currentPage === 1 ? "disabled" : ""}`}
          >
            <button
              className="page-link prevent_select"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <img src={LeftIconDouble} alt="Previous" />
            </button>
          </li>
          <li
            className={`cursor_pointer prevent_select custom-li  page-item ${currentPage === 1 ? "disabled" : ""}`}
          >
            <button
              className="page-link prevent_select"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <img src={leftIconSingle} alt="Previous" />
            </button>
          </li>

          {pageNumbers.map((page, index) => (
            <li
              key={index}
              className={`custom-li prevent_select page-item ${page === currentPage ? "theme_gradient_red" : ""}`}
            >
              <button
                className="page-link  "
                onClick={() => page !== "..." && onPageChange(page)}
                disabled={page === "..." || page === currentPage}
              >
                {page}
              </button>
            </li>
          ))}

          <li
            className={`cursor_pointer  prevent_select custom-li  page-item ${currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link prevent_select"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {/* Add the right arrow icon or any content here */}
              <img src={RightIconSingle} alt="Next" />
            </button>
          </li>
          <li
            className={`cursor_pointer prevent_select custom-li page-item ${currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link prevent_select"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              {/* Add the right arrow icon or any content here */}
              <img src={RightIconDouble} alt="Next" />
            </button>
          </li>
          <p
            className="previous_next_button cursor_pointer prevent_select"
            onClick={() => {
              if (currentPage === totalPages) {
              } else {
                onPageChange(currentPage + 1);
              }
            }}
          >
            Next
          </p>
        </ul>
      </nav>
    </>
  );
};

export default TopNftPopupPagination;
