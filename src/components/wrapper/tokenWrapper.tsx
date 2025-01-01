import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const TokenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkTokens = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const isAccessTokenValid = (token: string) => {
                if (!token) return false;
                    try {
                        const decodedToken = jwtDecode(token);
                        if (decodedToken.exp) {
                            const expiryTime = decodedToken.exp * 1000;

                            return new Date().getTime() < expiryTime;
                        }

                        return false;
                    } catch {

                        return false;
                    }
                };

            if (!accessToken && !refreshToken) {
                navigate('/login');
                
                return;
            }
            
            if(accessToken && !isAccessTokenValid(accessToken)) {
                if (refreshToken) {
                    try {
                        const refreshResponse = await axios.post('http://localhost:4000/refresh-token', { refreshToken }, {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });

                        if (refreshResponse.data.success) {
                            localStorage.setItem('accessToken', refreshResponse.data.access);
                            localStorage.setItem('refreshToken', refreshResponse.data.refresh);
                        } else {
                            navigate('/login');
                        }
                    } catch {
                        navigate('/login');
                    }
                } else {
                    navigate('/login');
                }
            }
        };

        checkTokens();
    }, [navigate]);

    return <>{children}</>;
};

export default TokenWrapper;