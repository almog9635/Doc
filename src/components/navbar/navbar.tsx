import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './navbar.module.css';
import SideProfile from '../sideprofile/sideProfile';
import LogoutButton from '../../pages/auth/logout/logout';
import UserRoleBadge from '../userRoleBadge/userRoleBadge';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../../entity/decodedToken';

const Navbar: React.FC = () => {
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUserRoles(decoded.roles || []);
                setUserId(decoded.sub || null);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    const isAdmin = userRoles.includes('admin');
    const isLeader = userRoles.includes('leader');

    return (
        <nav className={styles.navbar}>
            <SideProfile />
            <ul className={styles.navList}>
                <li className={styles.navItem}>
                    <Link to="/home" className={styles.navLink}>Home</Link>
                </li>
                
                <li className={styles.navItem}>
                    <Link to="/debriefs" className={styles.navLink}>Debriefs</Link>
                </li>

                {(isAdmin || isLeader) && (
                    <li className={styles.navItem}>
                        <Link to="/statistics" className={styles.navLink}>Statistics</Link>
                    </li>
                )}

                {isAdmin && (
                    <>
                        <li className={styles.navItem}>
                            <Link to="/users" className={styles.navLink}>Users</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link to="/groups" className={styles.navLink}>Groups</Link>
                        </li>
                    </>
                )}

                {isLeader && userId && (
                    <li className={styles.navItem}>
                        <Link to={`/commander/${userId}`} className={styles.navLink}>Commander Dashboard</Link>
                    </li>
                )}
            </ul>
            <div className={styles.navbarRight}>
                <UserRoleBadge roles={userRoles} />
                <LogoutButton />
            </div>
        </nav>
    );
};

export default Navbar;