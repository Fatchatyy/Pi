import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleSelection = (destination) => {
    // Save user's choice in local storage or Redux store
    localStorage.setItem('userDestination', destination);
    // Navigate to the selected destination
    navigate('/redirect');
  };

  if (user.role !== 'hr') {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">Select Your Destination</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSelection('backoffice')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Go to BackOffice
          </button>
          <button
            onClick={() => handleSelection('frontoffice')}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
          >
            Go to FrontOffice
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
