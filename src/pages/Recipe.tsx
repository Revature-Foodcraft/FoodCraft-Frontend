import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/Recipe.css';
import imageNotFound from '../assets/imageNotFound.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReviewCard from '../Components/ReviewCard';
import Floppy from '../assets/floppy.svg';
import Toast from '../Components/toast';

interface Review {
    reviewId: string;
    recipeId: string;
    user_id: string;
    comment: string;
    rating: number;
    dateCreated: string;
}

interface User {
    user_id: string;
    picture?: string;
    account: {
        firstname: string;
        lastname: string;
    };
}
const Recipe: React.FC = () => {
    const { id } = useParams<{ id: string; }>();
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastType, setToastType] = useState<'success' | 'danger'>('success');
    const [recipe, setRecipe] = useState<any>(null);
    const [isApiRecipe, setIsApiRecipe] = useState(false);
    const [similarRecipes, setSimilarRecipes] = useState<any[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [enrichedReviews, setEnrichedReviews] = useState<(Review & {
        firstname: string;
        lastname: string;
        picture?: string;
    })[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(5);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const submitReview = async () => {
        try {
            const res = await fetch(`http://3.144.40.72:5000/recipes/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ comment: newComment, rating: newRating }),
            });
            const json = await res.json();
            if (json.success) {
                // reload reviews
                const updated = await fetch(`http://3.144.40.72:5000/recipes/${id}/reviews`).then(r => r.json());
                if (updated.success) setReviews(updated.reviews);
                closeModal();
                setToastMessage('Review submitted successfully!');
                setToastType('success');
            } else {
                setToastMessage(`Error: ${json.message}`);
                setToastType('danger');
            }
        } catch (err) {
            console.error(err);
            setToastMessage('Failed to submit review.');
            setToastType('danger');
        }
    };

    const handleSaveToList = async () => {
        const response = await fetch('http://3.144.40.72:5000/user/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                recipeId: id,
            }),
        });

        if (response.status === 200) {
            setToastMessage('Added to save list!');
            setToastType('success');
        } else {
            setToastMessage('Failed to add to save list.');
            setToastType('danger');
        }
    };
    useEffect(() => {
        if (!id) return;

        const isApi = window.location.pathname.includes("/recipe/api/");
        setIsApiRecipe(isApi);

        if (isApi) {
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                .then(res => res.json())
                .then(data => {
                    const meal = data.meals?.[0];
                    if (meal) {
                        setRecipe({
                            name: meal.strMeal,
                            ingredients: Array.from({ length: 20 }, (_, i) => {
                                const name = meal[`strIngredient${i + 1}`];
                                const amount = meal[`strMeasure${i + 1}`];
                                return name ? { name, amount, category: "Unknown" } : null;
                            }).filter(Boolean),
                            instructions: meal.strInstructions?.split(". ").filter(Boolean),
                            macros: {
                                calories: "N/A",
                                fat: "N/A",
                                carbs: "N/A",
                                protein: "N/A"
                            },
                            pictures: [{ link: meal.strMealThumb }],
                            youtube: meal.strYoutube,
                            user_id: "API",
                            category: meal.strCategory || "Unknown" // You might need to adjust this depending on your data
                        });

                        // Fetch similar recipes based on category
                        fetchSimilarRecipes(meal.strCategory);
                    }
                });
                fetch(`http://3.144.40.72:5000/recipes/${id}/reviews`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setReviews(data.reviews);
                })
                .catch(err => console.error("Error fetching reviews:", err));
        } else {
            fetch(`http://3.144.40.72:5000/recipes/${id}`)
                .then(response => response.json())
                .then(data => {
                    setRecipe(data.recipe);
                    fetchSimilarRecipes(data.recipe.category); // fetch similar recipes based on category
                })
                .catch(error => console.error("Error fetching recipe:", error));

            fetch(`http://3.144.40.72:5000/recipes/${id}/reviews`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setReviews(data.reviews);
                })
                .catch(err => console.error("Error fetching reviews:", err));
        }
    }, [id]);

    useEffect(() => {
        // once reviews are loaded, fetch all users in one go
        if (reviews.length === 0) {
            setEnrichedReviews([]);
            return;
        }
        const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
        console.log(userIds.length);
        fetch(`http://3.144.40.72:5000/users?ids=${userIds.join(',')}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) return;

                // 2) build a lookup map from userId → user object
                const userMap: Record<string, User> = {};
                data.users.forEach((u: User) => {
                    userMap[u.user_id] = u;
                });

                // 3) merge each review with its user info
                const merged = reviews.map(r => {
                    const user = userMap[r.user_id];
                    return {
                        ...r,
                        firstname: user?.account.firstname || 'Unknown',
                        lastname: user?.account.lastname || 'Unknown',
                        picture: user?.picture || undefined,
                    };
                });

                setEnrichedReviews(merged);
            });
    }, [reviews]);

    // New function to fetch similar recipes
    const fetchSimilarRecipes = (category: string) => {
        fetch(`http://3.144.40.72:5000/recipes?category=${category}`)
            .then(response => response.json())
            .then(data => {
                if (data.recipes) {
                    setSimilarRecipes(data.recipes.map((recipe: any) => ({
                        id: recipe.PK, // 👈 This is the actual ID!
                        name: recipe.name,
                        picture: recipe.pictures?.[0] || imageNotFound,
                        user_id: recipe.user_id
                    })));


                }
            })
            .catch(error => console.error("Error fetching similar recipes:", error));
    };



    if (!recipe) {
        return <p>Loading recipe...</p>;
    }

    // Determine image URL for main image
    const getImageUrl = (image: any) => {
        if (typeof image === 'string') return image;
        if (image?.link) return image.link;
        return imageNotFound;
    };

    // Extract YouTube thumbnail
    const getYouTubeVideoId = (url: string) => {
        if (!url) return null;
        return url.split('v=')[1]?.split('&')[0];
    };


    const youtubeVideoId = getYouTubeVideoId(recipe.youtube);


    return (
        <div className="containerRecipe">
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastMessage('')}
                />
            )}
            <div className="recipe-header">
                <h1 style={{color: "#ffffff"}}>{recipe.name}</h1>
                <button className="btn save-btn-header" onClick={handleSaveToList}>
                    <img src={Floppy} alt="Save" /> Save To Recipe List
                </button>
            </div>


            <div className="recipe-layout">
                <div className="ingredients-instructions">
                    <h3 className="recipe-name text-center">{recipe.name}</h3>

                    <div className="recipe-author">
                        <div className="author-avatar"></div>
                        <p className="author-name">Recipe By: FoodCrafter</p>
                    </div>
                    <h4>Ingredients</h4>
                    <ul className="ingredients-list">
                        {recipe.ingredients.map((ingredient: any, index: number) => (
                            <li key={index}>
                                {ingredient.amount} {ingredient.name} 
                            </li>
                        ))}
                    </ul>

                    <h4>Instructions</h4>
                    <ol className="instructions-list">
                        {recipe.instructions.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                    <div className="time-fields">
                        <p><strong>Calories:</strong> {recipe.macros?.calories} kcal</p>
                        <p><strong>Fat:</strong> {recipe.macros?.fat} g</p>
                        <p><strong>Carbs:</strong> {recipe.macros?.carbs} g</p>
                        <p><strong>Protein:</strong> {recipe.macros?.protein} g</p>
                    </div>
                </div>

                {/* NEW WRAPPER for side content */}
                <div className="side-content-wrapper">
                    <div className="middle-section">
                        {/*<div className="middle-top">
                            <div className="review-box">
                                <div className="review-header">
                                    <div className="review-avatar"></div>
                                    <p className="review-author">Recipe By: Foodcrafter</p>
                                </div>
                                <p className="review-text">"This recipe was amazing! The flavors were perfect."</p>
                                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>*/}
                        <div className="middle-top">
                            <div>
                                <button className="add-review-btn" onClick={openModal}>Add Review</button>
                            </div>

                            <div className="review-card-div">
                                {enrichedReviews.map((review) => (
                                    <ReviewCard
                                        key={review.reviewId}
                                        reviewerName={`${review.firstname} ${review.lastname}`}
                                        rating={review.rating}
                                        description={review.comment}
                                        reviewerPicture={review.picture}
                                    />
                                ))}
                            </div>
                            {showModal && (
                                <div className="modal-overlay" onClick={closeModal}>
                                    <div
                                        className="modal-content"
                                        onClick={e => e.stopPropagation() /* prevent closing when clicking inside */}
                                    >
                                        <h3>Add a Review</h3>
                                        <textarea
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Your comment..."
                                        />
                                        <label>
                                            Rating:
                                            <select
                                                value={newRating}
                                                onChange={e => setNewRating(Number(e.target.value))}
                                            >
                                                {[5, 4, 3, 2, 1].map(n => (
                                                    <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <div className="modal-buttons">
                                            <button onClick={submitReview}>Submit</button>
                                            <button onClick={closeModal}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>


                        <div className="middle-bottom">
                            {youtubeVideoId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="youtube-player"
                                ></iframe>
                            ) : (
                                <p>No video available.</p>
                            )}
                        </div>
                    </div>

                    <div className="food-image">
                        <img
                            src={getImageUrl(recipe.pictures?.[0] || recipe.pictures)}
                            alt={recipe.name || "Recipe Image"}
                        />
                    </div>
                </div>
            </div>

            <div className="recipeSuggestions">
                <h2>Similar Recipes</h2>
                <div className="suggestions-container">
                    {similarRecipes.length > 0 ? (
                        similarRecipes.map((similarRecipe, index) => (
                            <Link
                                to={
                                    similarRecipe.user_id === "API"
                                        ? `/recipe/api/${similarRecipe.id}`
                                        : `/recipe/${similarRecipe.id}`
                                }
                                key={index}
                                className="suggestion-box"
                            >
                                <img
                                    src={similarRecipe.picture}
                                    alt={similarRecipe.name || "Recipe Image"}
                                    className="suggestion-image"
                                />
                                <p>{similarRecipe.name}</p>
                            </Link>
                        ))
                    ) : (
                        <p>No similar recipes found.</p>
                    )}
                </div>
            </div>




        </div>
    );
};
export default Recipe;
