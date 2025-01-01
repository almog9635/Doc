import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './logout.module.css';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        axios.post('http://localhost:4000/logout', { accessToken, refreshToken }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.data.success) {
                console.log('Logout successful');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                console.error('Logout failed:', response.data.message);
            }
        });
    };

    return (
        <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
        </button>
    );
};

export default LogoutButton;