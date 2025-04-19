import React, { useState, useContext } from 'react';
import '../css/Header.css';
import LoginRegisterPopup from './LoginRegisterPopup';
import { Link } from "react-router-dom";
import { AuthContext, DisplayContext } from './Contexts';
import DisplayRecipe from './SearchFeature/DisplayRecipes';
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchDropdownTabs from './SearchFeature/SearchDropdownTabs';
import SortByDropdown from './SearchFeature/SortByDropdown';
import logoPic from "../assets/logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ still included globally

const Header: React.FC = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [showCuisineTab, setShowCuisineTab] = useState(false);

    const [mealCategory, setMealCategorySelect] = useState("")
    const [selectedCuisine, setSelectedCuisine] = useState("")
    const [invert, setInvert] = useState(false)
    const [sortBy, setSortBy] = useState("Recently Added")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const toggleCuisineTab = () => {
        setShowCuisineTab(prev => !prev);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className='wrapper'>
            <header>
                <div className='titleAndLogoWrapper'>
                    <img src={logoPic} alt="FoodCraft Logo" />
                    <h1>FoodCraft</h1>
                </div>
                <nav>
                    <ul>
                        <li><Link to="/"><button>Home</button></Link></li>
                        <li><button onClick={openModal}>Search</button></li>
                        {isLoggedIn ? (
                            <>
                                <li><Link to="/profile"><button >Profile</button></Link></li>
                                <li><Link to="/account"><button >Account</button></Link></li>
                            </>
                        ) : (
                            <li><LoginRegisterPopup /></li>
                        )}
                    </ul>
                </nav>
            </header>

            {/* Custom Modal (No Bootstrap) */}
            {isModalOpen && (
                <div className="custom-backdrop" onClick={closeModal}>
                    <div className="custom-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="custom-modal-header">
                            <h2>Search Recipes</h2>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="custom-modal-body" >
                            <DisplayContext.Provider value={{
                                mealCategory,
                                setMealCategorySelect,
                                selectedCuisine,
                                setSelectedCuisine,
                                invert,
                                setInvert,
                                sortBy,
                                setSortBy
                            }}>
                               
                               <input
                                type="text"
                                placeholder="Search for recipes..."
                                onChange={handleSearchChange}
                                value={searchQuery ?? ""}
                                className="form-control mb-3 text-center" // Bootstrap's text-center
                                />


                                <div className="filters-wrapper">
                                <SortByDropdown />
                                <button className="btn btn-warning" onClick={toggleCuisineTab}>
                                    Cuisine Filter
                                </button>
                                </div>

                                {showCuisineTab && (
                                <div className="cuisine-tab-wrapper">
                                    <SearchDropdownTabs />
                                </div>
                                )}

                                <div className="recipe-grid">
                                    <DisplayRecipe searchQuery={searchQuery} />
                                </div>
                            </DisplayContext.Provider>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
