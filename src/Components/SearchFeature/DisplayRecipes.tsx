import React, { useContext, useEffect, useRef, useState } from "react";
import { Pagination } from "react-bootstrap";
import Fuse from "fuse.js";
import { DisplayContext } from "../Contexts";
import { Link } from "react-router-dom";
import StarRating from "../StarRating";

interface SearchProp {
  searchQuery: string | null;
}

const DisplayRecipe: React.FC<SearchProp> = ({ searchQuery }) => {
  const { sortBy, invert, selectedCuisine, mealCategory } = useContext(DisplayContext);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const hasSearched = useRef(false);

  const getRecipes = async () => {
    try {
      const searchParam = new URLSearchParams();
      if (selectedCuisine) {
        searchParam.append("cuisine", selectedCuisine);
      }
      if (mealCategory) {
        searchParam.append("category", mealCategory);
      }

      const dbRes = await fetch(`http://3.144.40.72:5000/recipes?${searchParam.toString()}`, {
        method: "GET",
      });

      const dbRecipes = await dbRes.json();
      if (dbRecipes.recipes.length <= 0) {
        getRecipesFromAPI();
      } else {
        setRecipes(dbRecipes.recipes);
      }
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  };

  const getRecipesFromAPI = async () => {
    const searchParam = new URLSearchParams();
    let baseURL = 'https://www.themealdb.com/api/json/v1/1/filter.php';
    if (searchQuery) {
      searchParam.append("s", searchQuery);
      baseURL = 'https://www.themealdb.com/api/json/v1/1/search.php';
    } else {
      if (selectedCuisine) {
        searchParam.append("a", selectedCuisine);
      }
      if (mealCategory) {
        searchParam.append("c", mealCategory);
      }
    }

    try {
      const data = await fetch(`${baseURL}?${searchParam.toString()}`, {
        method: "GET"
      });

      const response = await data.json();

      const apiRecipes: any = [];
      response.meals.forEach((meal: any) => {
        apiRecipes.push({
          PK: meal.idMeal,
          name: meal.strMeal,
          dateCreated: meal.dateModified || "2024-01-01",
          rating: 3,
          source: "api",
          images: meal.strMealThumb ? [meal.strMealThumb] : []
        });
      });

      setRecipes(apiRecipes);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getRecipes();
  }, [selectedCuisine, mealCategory]);

  useEffect(() => {
    hasSearched.current = false;
    if (!searchQuery) {
      getRecipes();
      hasSearched.current = true;
    }
  }, [searchQuery]);

  const fuseOptions = {
    keys: ['name'],
    threshold: 0.4
  };
  const fuse = new Fuse(recipes, fuseOptions);
  const filteredRecipes = searchQuery ? fuse.search(searchQuery).map((result) => result.item) : recipes;

  useEffect(() => {
    if (searchQuery && filteredRecipes.length === 0 && !hasSearched.current) {
      hasSearched.current = true;
      getRecipesFromAPI();
    }
  }, [filteredRecipes, searchQuery]);

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const currentRecipes = filteredRecipes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (sortBy === "Rating") {
    currentRecipes.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "Alphabetically") {
    currentRecipes.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    currentRecipes.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  }

  if (invert) {
    currentRecipes.reverse();
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div
        className="recipe-container grid gap-4 p-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          background: "inherit",
        }}
      >
        {currentRecipes.map((recipes) => {
          const imageUrl = recipes?.images?.[0] || recipes?.pictures?.[0] || "https://via.placeholder.com/250x150.png?text=No+Image";

          return (
            <div
              className="card"
              key={recipes.PK}
              style={{
                minWidth: "250px",
                maxWidth: "300px",
                border: "4px solid #f6efe4",
                borderRadius: "6px",
                overflow: "hidden",
                backgroundColor: "#ffffff"
              }}
            >
              <img
                src={imageUrl}
                alt={recipes.name}
                className="card-img-top"
                style={{
                  height: "180px",
                  objectFit: "cover"
                }}
              />

              <div
                style={{
                  marginTop: "8px",
                  backgroundColor: "transparent",
                  padding: "0",
                  border: "none"
                }}
              >
                <Link
                  to={`/recipe/${recipes?.source ? recipes.source : "db"}/${recipes.PK}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                    color: "#5b3e18",
                    fontWeight: "600",
                    fontFamily: '"Rockwell", "Georgia", serif',
                    padding: "8px 0"
                  }}
                >
                  <h5 style={{ margin: 0 }}>{recipes.name}</h5>
                </Link>
              </div>

              <div
                className="card-body text-center"
                style={{
                  backgroundColor: "#f6efe4",
                  padding: "12px",
                  borderRadius: "6px"
                }}
              >
                <div className="d-flex justify-content-center mb-2">
                  <StarRating rating={recipes.rating} outOf={5} />
                </div>
                <div
                  style={{
                    fontFamily: '"Rockwell", "Georgia", serif',
                    color: "#5b3e18",
                    fontSize: "14px"
                  }}
                >
                  {recipes.dateCreated}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-center align-content-center" style={{ position: "absolute", width: "100%", background: "inherit" }}>
        <Pagination className="m-1">
          <Pagination.First onClick={() => handlePageChange(1)} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item key={index + 1} active={currentPage === index + 1} onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </div>
  );
};

export default DisplayRecipe;
