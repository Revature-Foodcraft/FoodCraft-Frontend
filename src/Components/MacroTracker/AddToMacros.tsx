import React from 'react';
import '../../css/AddToMacros.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from '../toast';
import { useState } from 'react';

const [toastMessage, setToastMessage] = useState<string>('');
const [toastType, setToastType] = useState<'success' | 'danger'>('success');

interface MacroData {
    label: string;
    amount: number;
    goal: number;
}

interface AddToMacrosProps {
    macros: MacroData[];
    inputValues: Record<string, number>;
    onInputChange: (label: string, value: number) => void;
    onSubmit: () => void;
}

const AddToMacros: React.FC<AddToMacrosProps> = ({
    macros,
    inputValues,
    onInputChange,
    onSubmit,
}) => {
    const handleSubmit = () => {
        try {
            onSubmit();
        } catch (error) {
            console.error("Error submitting macros:", error);
            setToastMessage('Failed to add macros. Please try again.');
            setToastType('danger');

        }
    };

    return (
        <div className="add-to-macros">
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastMessage('')}
                />
            )}
            <div className="macro-inputs-row">
                {macros.map(macro => (
                    <div key={macro.label} className="macro-input">
                        <label htmlFor={macro.label} className='fw-bold'>{macro.label}</label>
                        <input
                            id={macro.label}
                            type="number"
                            value={inputValues[macro.label] || 0} // Default to 0 if undefined
                            onChange={e =>
                                onInputChange(
                                    macro.label,
                                    parseInt(e.target.value) || 0
                                )
                            }
                        />
                    </div>
                ))}
            </div>
            <button className="btn btn-warning btn-lg rounded-pill shadow-sm btn-custom" onClick={handleSubmit}>Add</button>
        </div>
    );
};

export default AddToMacros;
