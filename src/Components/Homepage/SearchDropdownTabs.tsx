import React, { useState } from "react";
import MealCategorySelect from "../SearchFeature/MealCategorySelect";
import CuisineSelect from "../SearchFeature/CuisineSelect";
import SortByDropdown from "../SearchFeature/SortByDropdown";

const SearchDropdownTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"meal" | "cuisine">("meal");

    return (
        <div className="dropdownMenu" style={{
            backgroundColor: "#f6efe4",
            padding: "16px", // optional: adds breathing room
            borderRadius: "8px" // optional: softens the edges of the whole box
          }}>
            <div className="row">
                {/* Sidebar Tabs */}
                <div className="col-3 border-end"  >
                    <ul className="nav flex-column nav-pills" >
                        <li className="nav-item" >
                            <button
                                className={`nav-link ${activeTab === "meal" ? "active" : ""}`}
                                onClick={() => setActiveTab("meal")}
                                style={{
                                    fontFamily: '"Rockwell", "Georgia", serif',
                                    color: activeTab === "meal" ? "#fff" : "#5b3e18",
                                    backgroundColor: activeTab === "meal" ? "#5b3e18" : "transparent",
                                    borderRadius: activeTab === "meal" ? "8px" : "0",
                                    fontWeight: 600,
                                    textAlign: "left"
                                }}
                            >
                                Meal Type
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "cuisine" ? "active" : ""}`}
                                onClick={() => setActiveTab("cuisine")}
                                style={{
                                    fontFamily: '"Rockwell", "Georgia", serif',
                                    color: activeTab === "cuisine" ? "#fff" : "#5b3e18",
                                    backgroundColor: activeTab === "cuisine" ? "#5b3e18" : "transparent",
                                    borderRadius: activeTab === "cuisine" ? "8px" : "0",
                                    fontWeight: 600,
                                    textAlign: "left"
                                }}
                            >
                                Cuisine
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Dynamic Content Area */}
                <div className="col-9" >
                    {activeTab === "meal" && <MealCategorySelect />}
                    {activeTab === "cuisine" && <CuisineSelect />}
                </div>
            </div>
        </div>
    );
};

export default SearchDropdownTabs;
