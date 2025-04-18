import React, { useState } from "react";
import MealCategorySelect from "./MealCategorySelect";
import CuisineSelect from "./CuisineSelect";

const SearchDropdownTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"meal" | "cuisine">("meal");
    return (
        <div className="dropdownMenu">
            <div className="row">
                {/* Sidebar Tabs */}
                <div className="col-3 border-end"> 
                    <ul className="nav flex-column nav-pills">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "meal" ? "active" : ""}`}
                                onClick={() => setActiveTab("meal")}
                            >
                                Meal Type
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "cuisine" ? "active" : ""}`}
                                onClick={() => setActiveTab("cuisine")}
                            >
                                Cuisine
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Dynamic Content Area */}
                <div className="col-9">
                    
                        {activeTab === "meal" && <MealCategorySelect />}
                        {activeTab === "cuisine" && <CuisineSelect />}
                    
                </div>
            </div>
        </div>
    );
};

export default SearchDropdownTabs;
