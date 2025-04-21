import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/RecipeCard.css';
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  id: string;
  title: string;
  author: string;
  description?: string;
  onDelete?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, author, description, onDelete, id }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe/db/${id}`);
  };

  return (
    <div className="card m-1 custom-card" style={{ cursor: 'pointer' }}>
      <div className="accordion-item">
        <h4 className="accordion-header" id={`flush-heading-${id}`}>
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#flush-collapse-${id}`}
            aria-expanded="false"
            aria-controls={`flush-collapse-${id}`}
          >
            {title}
          </button>
        </h4>
        <div
          id={`flush-collapse-${id}`}
          className="accordion-collapse collapse"
          data-bs-parent="#accordionFlushExample"
        >
          <div className="accordion-body">
            <p className="card-text fw-bold" onClick={handleCardClick}>By: {author}</p>
            {description && <p className="card-description">{description}</p>}
            {onDelete && (
              <button
                className="btn btn-sm btn-outline-danger delete-btn"
                onClick={(event) => {
                  event.stopPropagation(); // Prevent triggering the navigation
                  onDelete();
                }}
              >
                &#x1f5d1;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;