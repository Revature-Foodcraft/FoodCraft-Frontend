import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeCard from '../../Components/SavedRecipes/RecipeCard';

describe('RecipeCard Component', () => {
    const mockProps = {
        id: '1',
        title: 'Test Recipe',
        author: 'Test Author',
        description: 'This is a test description.',
        onDelete: jest.fn(),
    };

    it('renders correctly with given props', () => {
        render(<RecipeCard {...mockProps} />);

        expect(screen.getByText('Test Recipe')).toBeInTheDocument();
        expect(screen.getByText('By: Test Author')).toBeInTheDocument();
        expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    });

    it('calls onDelete when the delete button is clicked', () => {
        render(<RecipeCard {...mockProps} />);

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        expect(mockProps.onDelete).toHaveBeenCalled();
    });

    it('navigates to the recipe details page when clicked', () => {
        const mockNavigate = jest.fn();
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate,
        }));

        render(<RecipeCard {...mockProps} />);

        const card = screen.getByText('Test Recipe');
        fireEvent.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/recipes/1');
    });
});