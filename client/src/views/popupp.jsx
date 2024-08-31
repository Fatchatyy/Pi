// Popup.jsx
import React from 'react';

const Popupp = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto'>
                <button
                    onClick={onClose}
                    className='absolute top-3 right-3 text-gray-600 hover:text-gray-800'
                >
                    &times;
                </button>
                <div className='pt-10'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Popupp;
