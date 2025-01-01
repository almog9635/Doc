import React from 'react';
import { Link } from 'react-router-dom';
import styles from './navbar.module.css';
import SideProfile from '../sideprofile/sideProfile';
import LogoutButton from '../logout/logout';

const Navbar: React.FC = () => {
    return (
        <nav className={styles.navbar}>
            <SideProfile />
            <ul className={styles.navList}>
                <li className={styles.navItem}><Link to="/home" className={styles.navLink}>Home</Link></li>
                <li className={styles.navItem}><Link to="/users" className={styles.navLink}>Users</Link></li>
            </ul>
            <div className={styles.navbarRight}>
                <LogoutButton />
            </div>
        </nav>
    );
};

export default Navbar;