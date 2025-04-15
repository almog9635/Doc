import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../entity/decodedToken';

export function useAuthCheck() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if(decoded.roles.includes('admin')) {
        setIsAuthorized(true);
        return;
      } else {
        setIsAuthorized(false);
        navigate('/home');
      }
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  }, [navigate]);

  return { isAuthorized };
}