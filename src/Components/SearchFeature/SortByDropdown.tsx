import React, { useState, useContext } from "react";
import { DisplayContext } from "../Contexts";
import filterIcon from "../../assets/filter-circle.svg";

const SortByDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { sortBy, setSortBy, invert, setInvert } = useContext(DisplayContext);

  const sortByOptions: string[] = [
    "Recently Added", "Rating", "Alphabetically"
  ];

  const handleSortBySelect = (sortId: string) => {
    setSortBy(sortId);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center gap-2" style={{ position: "relative" }}>
      <button
        className="btn btn-outline-secondary"
        style={{
          padding: "6px 10px",
          fontSize: "15px",
          height: "38px",
          display: "flex",
          alignItems: "center"
        }}
        onClick={() => { setInvert(!invert); }}
      >
        <img src={filterIcon} alt="Filter Icon" style={{ width: "1rem", height: "1rem" }} />
      </button>

      <button
        className="btn btn-info dropdown-toggle"
        style={{
          padding: "6px 12px",
          fontSize: "15px",
          height: "38px",
          whiteSpace: "nowrap",
          maxWidth: "220px"
        }}
        onClick={toggleDropdown}
      >
        Sort by: {sortBy}
      </button>

      {isOpen && (
        <ul
          className="list-group border border-light"
          style={{
            position: "absolute",
            top: "110%",
            width: "100%",
            listStyle: "none",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1050
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {sortByOptions.map((option) => (
            <li className="list-group-item" key={option}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={option}
                  checked={sortBy === option}
                  onChange={() => handleSortBySelect(option)}
                />
                <label className="form-check-label" htmlFor={option}>
                  {option}
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "transparent",
            zIndex: 1040
          }}
          onClick={closeDropdown}
        />
      )}
    </div>
  );
};

export default SortByDropdown;
