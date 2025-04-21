import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddIngredientModal from '../../Components/SmartFridge/AddIngredientModal';

describe('AddIngredientModal Component', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    it('renders correctly with default values', () => {
        render(<AddIngredientModal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByText('Add Ingredient')).toBeInTheDocument();
        expect(screen.getByLabelText('Name:')).toBeInTheDocument();
        expect(screen.getByLabelText('Amount:')).toBeInTheDocument();
        expect(screen.getByLabelText('Unit:')).toBeInTheDocument();
    });

    it('calls onCancel when the Cancel button is clicked', () => {
        render(<AddIngredientModal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onSubmit with correct data when the Save button is clicked', () => {
        render(<AddIngredientModal onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Tomato' } });
        fireEvent.change(screen.getByLabelText('Amount:'), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText('Unit:'), { target: { value: 'kg' } });

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockOnSubmit).toHaveBeenCalledWith({
            id: '',
            name: 'Tomato',
            amount: 2,
            unit: 'kg',
            category: 'Other',
        });
    });
});