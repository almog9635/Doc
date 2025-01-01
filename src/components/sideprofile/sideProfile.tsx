import React from 'react';
import { Link } from 'react-router-dom';
import styles from './sideProfile.module.css';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    name: string;
    sub: string;
}

const SideProfile: React.FC = () => {
    const [userName, setUserName] = React.useState<string | null>(null);
    const [userId, setUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decodedToken = jwtDecode<DecodedToken>(token);
            if (decodedToken.sub && decodedToken.name) {
                setUserName(decodedToken.name);
                setUserId(decodedToken.sub);
            }
        }
    }, []);

    if (!userName || !userId) {
        return null;
    }

    return (
        <Link to={`/user/${userId}`} className={styles.profileButton}>
            {userName}
        </Link>
    );
};

export default SideProfile;