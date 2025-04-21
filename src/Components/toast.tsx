import React from 'react';

const Toast: React.FC<{ message: string; type?: 'success' | 'danger'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
    return (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
            <div className={`toast align-items-center text-bg-${type} border-0 show`} role="alert">
                <div className="d-flex">
                    <div className="toast-body">{message}</div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
