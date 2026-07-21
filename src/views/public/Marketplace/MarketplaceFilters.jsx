import { Select } from "antd";
import { useRef, useState } from "react";
import { USDTOMATIC } from "../../../utills/currencyConverter";

const CATEGORY_OPTIONS = [
  { value: "Dance", label: "Dance" },
  { value: "Emote", label: "Emote" },
  { value: "Moments", label: "Moments" },
  { value: "Other", label: "Other" },
];

const PRICE_OPTIONS = [
  { value: "0-10", label: "$0-$10" },
  { value: "10-100", label: "$10-$100" },
  { value: "100-1000", label: "$100-$1000" },
  { value: "1000-10000", label: "$1000-$10000" },
  { value: "10000-100000", label: "$10000+" },
];

const QUANTITY_OPTIONS = [
  { value: "0-10", label: "0-10" },
  { value: "10-100", label: "10-100" },
  { value: "100-1000", label: "100-1000" },
  { value: "1000-10000", label: "1000-10000" },
  { value: "10000-100000", label: "10000+" },
];

const PLACEHOLDER_OPTIONS = [{ value: "Coming Soon", label: "Coming Soon" }];

const FILTER_FIELDS = [
  {
    key: "category",
    label: "Category",
    options: CATEGORY_OPTIONS,
  },
  {
    key: "price",
    label: "Price",
    options: PRICE_OPTIONS,
  },
  {
    key: "quantity",
    label: "Quantity",
    options: QUANTITY_OPTIONS,
  },
  {
    key: "auction",
    label: "Auction",
    options: PLACEHOLDER_OPTIONS,
  },
  {
    key: "ranking",
    label: "Ranking",
    options: PLACEHOLDER_OPTIONS,
  },
];

const DROPDOWN_MAX_WIDTH = 150;

const MarketplaceFilterSelect = ({
  field,
  isLight,
  disabled,
  onChange,
}) => {
  const pillRef = useRef(null);
  const [dropdownMinWidth, setDropdownMinWidth] = useState(undefined);

  const handleDropdownVisibleChange = (open) => {
    if (open && pillRef.current) {
      setDropdownMinWidth(pillRef.current.offsetWidth);
    }
  };

  return (
    <div ref={pillRef} className="marketplace-filter-pill">
      <Select
        bordered={false}
        defaultValue={field.label}
        className={`marketplace-filter-select ${isLight ? "marketplace-filter-select--light" : ""}`}
        dropdownClassName={
          isLight
            ? "marketplace-filter-select-dropdown marketplace-filter-select-dropdown--light"
            : "marketplace-filter-select-dropdown"
        }
        dropdownMatchSelectWidth={false}
        dropdownStyle={{
          minWidth: dropdownMinWidth,
          maxWidth: DROPDOWN_MAX_WIDTH,
        }}
        disabled={disabled}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        onChange={onChange}
        options={field.options}
      />
    </div>
  );
};

const MarketplaceFilters = ({
  filterObj,
  setFilterObj,
  isLight,
  isFreeNftTab,
}) => {
  const updateFilter = (updater) => {
    const filterObjCopy = JSON.parse(filterObj);
    updater(filterObjCopy);
    setFilterObj(JSON.stringify(filterObjCopy));
  };

  const handleCategoryChange = (value) => {
    updateFilter((copy) => {
      copy.category = value;
    });
  };

  const handlePriceChange = async (value) => {
    if (isFreeNftTab) return;

    const data = value.split("-").map(Number);
    const convertedPrice = await Promise.all(
      data.map(async (val) => USDTOMATIC(val)),
    );

    updateFilter((copy) => {
      copy.price =
        convertedPrice?.length === 1
          ? [0, convertedPrice[0]]
          : convertedPrice;
    });
  };

  const handleQuantityChange = (value) => {
    const data = value.split("-").map(Number);
    updateFilter((copy) => {
      copy.quantity = data;
    });
  };

  const handleChangeByKey = {
    category: handleCategoryChange,
    price: handlePriceChange,
    quantity: handleQuantityChange,
    auction: () => {},
    ranking: () => {},
  };

  return (
    <div className="marketplace-filters">
      {FILTER_FIELDS.map((field) => (
        <MarketplaceFilterSelect
          key={field.key}
          field={field}
          isLight={isLight}
          disabled={field.key === "price" && isFreeNftTab}
          onChange={handleChangeByKey[field.key]}
        />
      ))}
    </div>
  );
};

export default MarketplaceFilters;
