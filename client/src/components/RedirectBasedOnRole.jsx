import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { storeToken } from '../api/request';
import { Link, useNavigate } from 'react-router-dom'

const RedirectBasedOnRole = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate()
  useEffect(() => {
    console.log('User role in RedirectBasedOnRole:', user.role);
    const destination = localStorage.getItem('userDestination');
    if (user.role === 'hr') {
      const token = user.token; // Get the token from the Redux state
      if (token) {
        console.log('the token', token);

        // Store token via the storeToken method
        storeToken(token,user, (response) => {
          console.log('Token stored successfully:', response);

          // Redirect to BackOffice with token as a URL parameter
          if(destination==='backoffice'){
          window.location.replace(`http://localhost:3001?token=${user.id}`);
          }else{
            navigate('/');
          }
        }, (loading) => {
          if (loading) {
            console.log('Storing token...');
          } else {
            console.log('Token stored.');
          }
        });
      } else {
        console.error('Token not found in user state');
      }
    }
  }, [user.role, user.token]);

  // Show a loading spinner or a message while checking the role
  return <div>Loading...</div>;
};

export default RedirectBasedOnRole;
