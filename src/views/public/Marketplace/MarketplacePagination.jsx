import LeftIconDouble from "../../../components/topNftsPopup/LeftIconDouble.svg";
import LeftIconSingle from "../../../components/topNftsPopup/LeftIconSingle.svg";
import RightIconDouble from "../../../components/topNftsPopup/RightIconDouble.svg";
import RightIconSingle from "../../../components/topNftsPopup/RightIconSingle.svg";
const MarketplacePagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 0) {
    return null;
  }
  const getPageNumbers = () => {
    const pageNumbers = [];
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
    <nav className="marketplace-pagination" aria-label="Marketplace pagination">
      <ul className="marketplace-pagination__list">
        <li>
          <button
            type="button"
            className="marketplace-pagination__nav-text"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
        </li>
        <li
          className={`marketplace-pagination__item ${currentPage === 1 ? "marketplace-pagination__item--disabled" : ""}`}
        >
          <button
            type="button"
            className="marketplace-pagination__btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <img src={LeftIconDouble} alt="" />
          </button>
        </li>
        <li
          className={`marketplace-pagination__item ${currentPage === 1 ? "marketplace-pagination__item--disabled" : ""}`}
        >
          <button
            type="button"
            className="marketplace-pagination__btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <img src={LeftIconSingle} alt="" />
          </button>
        </li>

        {pageNumbers.map((page, index) => (
          <li
            key={`${page}-${index}`}
            className={`marketplace-pagination__item ${page === currentPage ? "marketplace-pagination__item--active" : ""}`}
          >
            <button
              type="button"
              className="marketplace-pagination__btn marketplace-pagination__page"
              onClick={() => page !== "..." && onPageChange(page)}
              disabled={page === "..." || page === currentPage}
            >
              {page}
            </button>
          </li>
        ))}

        <li
          className={`marketplace-pagination__item ${currentPage === totalPages ? "marketplace-pagination__item--disabled" : ""}`}
        >
          <button
            type="button"
            className="marketplace-pagination__btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <img src={RightIconSingle} alt="" />
          </button>
        </li>
        <li
          className={`marketplace-pagination__item ${currentPage === totalPages ? "marketplace-pagination__item--disabled" : ""}`}
        >
          <button
            type="button"
            className="marketplace-pagination__btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <img src={RightIconDouble} alt="" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="marketplace-pagination__nav-text"
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};
export default MarketplacePagination;
