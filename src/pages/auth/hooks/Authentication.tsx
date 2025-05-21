import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../../entity/decodedToken';

export function useAuthCheck(requiredRoles: string[] = []) {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      if (requiredRoles.length === 0) {
        setIsAuthorized(true);
        return;
      }
      
      const hasRequiredRole = requiredRoles.some(role => 
        decoded.roles && decoded.roles.includes(role)
      );
      
      if (hasRequiredRole) {
        setIsAuthorized(true);
      } else {
        console.log('User does not have required roles:', requiredRoles);
        setIsAuthorized(false);
        navigate('/unauthorized');
      }
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  }, [navigate, requiredRoles]);

  return { isAuthorized, getAuthHeader };
}